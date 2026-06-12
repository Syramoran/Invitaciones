import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Preference, Payment } from 'mercadopago';

import { Pedido, EstadoPedido } from '../../entities/pedido.entity';
import { Invitacion } from '../../entities/invitacion.entity';
import { Pago } from '../../entities/pago.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);
  private mpClient!: MercadoPagoConfig;

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,

    @InjectRepository(Invitacion)
    private readonly invitacionRepo: Repository<Invitacion>,

    @InjectRepository(Pago)
    private readonly pagoRepo: Repository<Pago>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly notificacionesService: NotificacionesService,
  ) {
    this.mpClient = new MercadoPagoConfig({
      accessToken: this.configService.getOrThrow<string>('MP_ACCESS_TOKEN'),
    });
  }

  // ═══════════════════════════════════════════
  // Crear preferencia de pago en Mercado Pago
  // POST /client/pedidos/:id/checkout
  // ═══════════════════════════════════════════

  async crearPreferencia(pedidoId: number, usuarioId: number): Promise<{ checkoutUrl: string; preferenceId: string }> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id: pedidoId, usuarioId },
      relations: ['tipoEvento', 'template'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${pedidoId} no encontrado.`);
    }

    if (pedido.estado !== EstadoPedido.PENDIENTE) {
      throw new BadRequestException(
        `El pedido ya fue procesado (estado: ${pedido.estado}). No se puede generar un nuevo pago.`,
      );
    }

    // Verificar que la invitación (borrador) exista para este pedido
    const invitacion = await this.invitacionRepo.findOne({ where: { pedidoId } });
    if (!invitacion) {
      throw new UnprocessableEntityException(
        'Primero debés completar los datos de tu invitación antes de pagar.',
      );
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const clientPortalUrl = this.configService.get<string>('CLIENT_PORTAL_URL', `${frontendUrl}/portal`);

    const preference = new Preference(this.mpClient);

    const preferenceBody = {
      items: [
        {
          id: String(pedido.id),
          title: `Invitación Digital — ${pedido.tipoEvento?.nombre ?? 'Evento'} (${pedido.template?.nombre ?? ''})`,
          quantity: 1,
          unit_price: Number(pedido.precioTotal),
          currency_id: 'ARS',
        },
      ],
      external_reference: String(pedido.id),
      back_urls: {
        success: `${clientPortalUrl}/pedidos/${pedido.id}/pago?status=success`,
        failure: `${clientPortalUrl}/pedidos/${pedido.id}/pago?status=failure`,
        pending: `${clientPortalUrl}/pedidos/${pedido.id}/pago?status=pending`,
      },
      notification_url: `${frontendUrl}/v1/pagos/webhook`,
    };

    this.logger.debug('Preference Body: ' + JSON.stringify(preferenceBody, null, 2));

    const response = await preference.create({
      body: preferenceBody,
    });

    // Guardar el preferenceId en el pedido
    await this.pedidoRepo.update(pedidoId, {
      mpPreferenceId: response.id,
    });

    this.logger.log(`💳 Preferencia MP creada — Pedido: #${pedidoId} | Preference: ${response.id}`);

    return {
      checkoutUrl: response.init_point!,
      preferenceId: response.id!,
    };
  }

  // ═══════════════════════════════════════════
  // Procesar notificación webhook de Mercado Pago
  // POST /pagos/webhook (público — validado por firma)
  // ═══════════════════════════════════════════

  async procesarWebhook(body: Record<string, any>): Promise<void> {
    // Solo procesamos eventos de pago
    if (body.type !== 'payment' || !body.data?.id) {
      this.logger.log(`⏭️ Webhook ignorado — type: ${body.type}`);
      return;
    }

    const mpPaymentId = String(body.data.id);

    try {
      // Consultar el pago a la API de MP para obtener datos reales (evita falsificaciones)
      const paymentApi = new Payment(this.mpClient);
      const pagoMp = await paymentApi.get({ id: mpPaymentId });

      const pedidoId = Number(pagoMp.external_reference);
      const status = pagoMp.status ?? 'unknown';
      const monto = Number(pagoMp.transaction_amount ?? 0);

      this.logger.log(`📩 Webhook MP — Payment: ${mpPaymentId} | Status: ${status} | Pedido: #${pedidoId}`);

      // Registrar el evento de pago (auditoría)
      await this.pagoRepo.save(
        this.pagoRepo.create({
          pedidoId,
          mpPaymentId,
          mpStatus: status,
          monto,
          rawData: body,
        }),
      );

      // Solo activar si el pago está aprobado
      if (status !== 'approved') {
        this.logger.log(`⚠️ Pago no aprobado (${status}) — Pedido #${pedidoId}. Sin cambios en la invitación.`);
        return;
      }

      // Verificar que el pedido no esté ya procesado (idempotencia)
      const pedido = await this.pedidoRepo.findOne({
        where: { id: pedidoId },
        relations: ['usuario'],
      });

      if (!pedido) {
        this.logger.error(`❌ Pedido #${pedidoId} no encontrado para webhook ${mpPaymentId}`);
        return;
      }

      if (pedido.estado === EstadoPedido.PAGADO || pedido.estado === EstadoPedido.COMPLETADO) {
        this.logger.log(`⏭️ Pedido #${pedidoId} ya estaba en estado ${pedido.estado}. Idempotente.`);
        return;
      }

      // Transacción: actualizar pedido + activar invitación
      const invitacion = await this.dataSource.transaction(async (manager) => {
        // Marcar pedido como PAGADO
        await manager.update(Pedido, pedidoId, {
          estado: EstadoPedido.PAGADO,
          mpPaymentId,
        });

        // Activar la invitación borrador
        const inv = await manager.findOne(Invitacion, { where: { pedidoId } });
        if (inv) {
          await manager.update(Invitacion, inv.id, { activa: true });
          return inv;
        }
        return null;
      });

      if (invitacion) {
        this.logger.log(`✅ Invitación activada — ID: ${invitacion.id} | Pedido: #${pedidoId}`);

        // Notificar al cliente (fire-and-forget)
        if (pedido.usuario) {
          this.notificacionesService
            .notificarPagoConfirmado({
              email: pedido.usuario.email,
              nombreCliente: pedido.usuario.nombreCompleto ?? pedido.usuario.username,
              pedidoId,
              invitacionId: invitacion.id,
            })
            .catch((err) =>
              this.logger.error(`Error notificando pago confirmado: ${err.message}`),
            );
        }
      }

    } catch (error: any) {
      this.logger.error(`❌ Error procesando webhook ${mpPaymentId}: ${error.message}`);
      // No relanzamos — MP reintenta si no respondemos 200
    }
  }

  // ═══════════════════════════════════════════
  // Estado del pago de un pedido del cliente
  // GET /client/pedidos/:id/pago
  // ═══════════════════════════════════════════

  async obtenerEstadoPago(pedidoId: number, usuarioId: number) {
    const pedido = await this.pedidoRepo.findOne({
      where: { id: pedidoId, usuarioId },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${pedidoId} no encontrado.`);
    }

    const pagos = await this.pagoRepo.find({
      where: { pedidoId },
      order: { createdAt: 'DESC' },
    });

    return {
      pedidoId,
      estadoPedido: pedido.estado,
      mpPreferenceId: pedido.mpPreferenceId,
      mpPaymentId: pedido.mpPaymentId,
      pagos: pagos.map((p) => ({
        id: p.id,
        mpPaymentId: p.mpPaymentId,
        mpStatus: p.mpStatus,
        monto: Number(p.monto),
        createdAt: p.createdAt,
      })),
    };
  }
}
