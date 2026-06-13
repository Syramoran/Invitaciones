import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { InvitacionesService } from '../invitaciones/invitaciones.service';
import { CodigosDescuentoService } from '../codigos-descuento/codigos-descuento.service';

export interface CrearPreferenciaResult {
  tipo: 'MERCADO_PAGO' | 'GRATUITO';
  init_point?: string;
}

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);
  private readonly mpClient: MercadoPagoConfig;
  private readonly frontendUrl: string;
  private readonly backendUrl: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly invitacionesService: InvitacionesService,
    private readonly codigosDescuentoService: CodigosDescuentoService,
  ) {
    this.mpClient = new MercadoPagoConfig({
      accessToken: this.configService.get<string>('MP_ACCESS_TOKEN')!,
    });
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    this.backendUrl = this.configService.get<string>('BACKEND_URL');
  }

  async crearPreferencia(
    invitacionId: string,
    title: string,
    price: number,
    usuarioId: number,
    userRole: string,
    codigoDescuento?: string,
  ): Promise<CrearPreferenciaResult> {
    // Verificar propiedad solo para usuarios no admin
    if (userRole !== 'ADMIN') {
      await this.invitacionesService.verificarPropiedad(invitacionId, usuarioId);
    }

    let precioFinal = price;
    let codigoAplicado: string | undefined;

    // Aplicar código de descuento si se proporcionó
    if (codigoDescuento) {
      const validacion = await this.codigosDescuentoService.validar(codigoDescuento);
      if (!validacion.valido) {
        throw new BadRequestException(validacion.mensaje);
      }
      precioFinal = price * (1 - validacion.porcentaje / 100);
      codigoAplicado = codigoDescuento;
    }

    // Si el precio es 0 (100% de descuento), activar directamente
    if (precioFinal <= 0) {
      if (codigoAplicado) {
        await this.codigosDescuentoService.aplicar(codigoAplicado);
      }
      await this.invitacionesService.actualizarEstadoPago(invitacionId, 'PAGADO');
      this.logger.log(`✅ Invitación ${invitacionId} activada con código 100% de descuento`);
      return { tipo: 'GRATUITO' };
    }

    // Crear preferencia en MercadoPago
    const preference = new Preference(this.mpClient);
    const body: Parameters<typeof preference.create>[0]['body'] = {
      items: [
        {
          id: `invitacion-${invitacionId}`,
          title,
          quantity: 1,
          unit_price: Math.round(precioFinal),
          currency_id: 'ARS',
        },
      ],
      external_reference: invitacionId,
      back_urls: {
        success: `${this.frontendUrl}/client/dashboard?payment=success`,
        failure: `${this.frontendUrl}/client/create-invitation?payment=failed`,
        pending: `${this.frontendUrl}/client/dashboard?payment=pending`,
      },
    };

    // auto_return solo funciona con URLs públicas (no localhost)
    const isPublicUrl = !this.frontendUrl.includes('localhost') && !this.frontendUrl.includes('127.0.0.1');
    if (isPublicUrl) {
      body.auto_return = 'approved';
    }

    if (this.backendUrl) {
      body.notification_url = `${this.backendUrl}/v1/pagos/webhook`;
    }

    const result = await preference.create({ body });

    // Aplicar código (si es descuento parcial) una vez creada la preferencia con éxito
    if (codigoAplicado) {
      await this.codigosDescuentoService.aplicar(codigoAplicado);
    }

    this.logger.log(`💳 Preferencia MP creada para invitación ${invitacionId} — precio: $${Math.round(precioFinal)}`);

    return { tipo: 'MERCADO_PAGO', init_point: result.init_point! };
  }

  async procesarWebhook(tipo: string, paymentId: string): Promise<void> {
    if (tipo !== 'payment') return;

    try {
      const paymentClient = new Payment(this.mpClient);
      const pago = await paymentClient.get({ id: paymentId });

      if (pago.status === 'approved' && pago.external_reference) {
        await this.invitacionesService.actualizarEstadoPago(
          pago.external_reference,
          'PAGADO',
        );
        this.logger.log(
          `✅ Pago confirmado vía webhook — invitación: ${pago.external_reference}`,
        );
      }
    } catch (err) {
      this.logger.error(`Error procesando webhook de pago ${paymentId}:`, err);
    }
  }
}
