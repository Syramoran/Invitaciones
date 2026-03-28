import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import {
  Notificacion,
  TipoNotificacion,
} from '../../entities/notificacion.entity';

import {
  NotificacionQueryDto,
  NotificacionResponseDto,
  PaginatedNotificacionesDto,
} from './dto/notificacion.dto';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepo: Repository<Notificacion>,

    private readonly configService: ConfigService,
  ) {}

  // ═══════════════════════════════════════════
  // GET /notificaciones — Listar notificaciones (admin, JWT)
  // ═══════════════════════════════════════════

  async listar(query: NotificacionQueryDto): Promise<PaginatedNotificacionesDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.notificacionRepo
      .createQueryBuilder('notificacion')
      .orderBy('notificacion.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.tipo) {
      qb.andWhere('notificacion.tipo = :tipo', { tipo: query.tipo });
    }

    const [notificaciones, total] = await qb.getManyAndCount();

    return {
      data: notificaciones.map((n) => this.mapearResponse(n)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ═══════════════════════════════════════════
  // POST /notificaciones/test — Enviar notificación de prueba (admin, JWT)
  // ═══════════════════════════════════════════

  async enviarPrueba(): Promise<NotificacionResponseDto> {
    const adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'admin@invitaciones.com',
    );

    return this.crearYEnviar({
      tipo: TipoNotificacion.NUEVO_PEDIDO,
      destinatarioEmail: adminEmail,
      asunto: '[TEST] Notificación de prueba',
      mensaje:
        'Esta es una notificación de prueba enviada desde el panel de administración. ' +
        'Si estás viendo esto, el sistema de notificaciones funciona correctamente.',
    });
  }

  // ═══════════════════════════════════════════
  // Métodos públicos — Llamados por otros módulos
  // ═══════════════════════════════════════════

  /**
   * NUEVO_PEDIDO — Notifica al propietario cuando se crea un pedido.
   * Llamado desde PedidosService.crear() (fire-and-forget).
   *
   * // TODO: Reemplazar console.log por nodemailer:
   * // await this.transporter.sendMail({ to, subject, html })
   * // Usar template HTML con datos del pedido
   */
  async notificarNuevoPedido(datos: {
    pedidoId: number;
    nombreCliente: string;
    telefono: string;
    email: string;
    tipoEvento: string;
    template: string;
    precioTotal: number;
  }): Promise<void> {
    const adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'admin@invitaciones.com',
    );

    const asunto = `Nuevo pedido #${datos.pedidoId} — ${datos.nombreCliente}`;
    const mensaje =
      `Nuevo pedido recibido:\n\n` +
      `Cliente: ${datos.nombreCliente}\n` +
      `Teléfono: ${datos.telefono}\n` +
      `Email: ${datos.email}\n` +
      `Tipo de evento: ${datos.tipoEvento}\n` +
      `Template: ${datos.template}\n` +
      `Precio total: $${datos.precioTotal}`;

    await this.crearYEnviar({
      tipo: TipoNotificacion.NUEVO_PEDIDO,
      destinatarioEmail: adminEmail,
      asunto,
      mensaje,
    });
  }

  /**
   * EXPIRACION_PROXIMA — Avisa al anfitrión que su invitación será eliminada.
   * Llamado desde el cron job de verificación (7 días y 3 días antes).
   *
   * // TODO: Reemplazar console.log por nodemailer:
   * // await this.transporter.sendMail({ to: emailAnfitrion, subject, html })
   * // Incluir link para descargar ZIP de fotos antes de la eliminación
   */
  async notificarExpiracionProxima(datos: {
    invitacionId: string;
    titulo: string;
    emailAnfitrion: string;
    diasRestantes: number;
    fechaEliminacion: Date;
  }): Promise<void> {
    const asunto =
      `Tu invitación "${datos.titulo}" será eliminada en ${datos.diasRestantes} días`;
    const mensaje =
      `Hola,\n\n` +
      `Te recordamos que tu invitación "${datos.titulo}" será eliminada ` +
      `el ${datos.fechaEliminacion.toLocaleDateString('es-AR')}.\n\n` +
      `Si querés conservar las fotos de la galería, podés descargarlas ` +
      `antes de esa fecha desde el link de tu invitación.\n\n` +
      `ID de invitación: ${datos.invitacionId}`;

    await this.crearYEnviar({
      tipo: TipoNotificacion.EXPIRACION_PROXIMA,
      destinatarioEmail: datos.emailAnfitrion,
      asunto,
      mensaje,
    });
  }

  /**
   * AVISO_ELIMINACION — Registro interno cuando el cron job elimina datos.
   * No se envía email real — solo se registra en BD como auditoría.
   *
   * // TODO: Opcionalmente enviar resumen diario al admin con
   * // cantidad de invitaciones eliminadas esa noche
   */
  async registrarEliminacion(datos: {
    invitacionId: string;
    titulo: string;
    fotosEliminadas: number;
  }): Promise<void> {
    const adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'admin@invitaciones.com',
    );

    const asunto = `Eliminación automática — "${datos.titulo}"`;
    const mensaje =
      `Eliminación automática ejecutada:\n\n` +
      `Invitación: ${datos.invitacionId}\n` +
      `Título: ${datos.titulo}\n` +
      `Fotos eliminadas: ${datos.fotosEliminadas}\n` +
      `Fecha: ${new Date().toLocaleString('es-AR')}`;

    // Este tipo no envía email, solo registra en BD
    const notificacion = this.notificacionRepo.create({
      tipo: TipoNotificacion.AVISO_ELIMINACION,
      destinatarioEmail: adminEmail,
      asunto,
      mensaje,
      enviada: true, // Se marca como "enviada" porque es solo un registro interno
      fechaEnvio: new Date(),
    });

    await this.notificacionRepo.save(notificacion);

    this.logger.log(
      `📋 Eliminación registrada — Invitación: ${datos.invitacionId} | ` +
      `Fotos: ${datos.fotosEliminadas}`,
    );
  }

  // ═══════════════════════════════════════════
  // Métodos privados
  // ═══════════════════════════════════════════

  /**
   * Crea el registro en BD e intenta "enviar" la notificación.
   * Por ahora solo loguea en consola. Cuando se implemente nodemailer,
   * este método envía el email real y marca como enviada.
   *
   * // TODO: Implementar envío real con nodemailer:
   * // 1. npm install nodemailer && npm install -D @types/nodemailer
   * // 2. Crear transporter en onModuleInit():
   * //    this.transporter = nodemailer.createTransport({
   * //      host: configService.get('SMTP_HOST'),
   * //      port: configService.get('SMTP_PORT'),
   * //      auth: { user: configService.get('SMTP_USER'), pass: configService.get('SMTP_PASS') },
   * //    });
   * // 3. En este método reemplazar el console.log por:
   * //    await this.transporter.sendMail({
   * //      from: `"Invitaciones Digitales" <${configService.get('SMTP_USER')}>`,
   * //      to: destinatarioEmail,
   * //      subject: asunto,
   * //      text: mensaje,
   * //      html: this.generarHtml(asunto, mensaje), // template HTML
   * //    });
   * // 4. Variables de entorno necesarias:
   * //    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
   */
  private async crearYEnviar(datos: {
    tipo: TipoNotificacion;
    destinatarioEmail: string;
    asunto: string;
    mensaje: string;
  }): Promise<NotificacionResponseDto> {
    // 1. Crear registro en BD (estado: no enviada)
    const notificacion = this.notificacionRepo.create({
      tipo: datos.tipo,
      destinatarioEmail: datos.destinatarioEmail,
      asunto: datos.asunto,
      mensaje: datos.mensaje,
      enviada: false,
    });

    const guardada = await this.notificacionRepo.save(notificacion);

    // 2. "Enviar" — por ahora solo consola
    try {
      this.logger.log(
        `📧 ══════════════════════════════════════\n` +
        `   NOTIFICACIÓN [${datos.tipo}]\n` +
        `   Para: ${datos.destinatarioEmail}\n` +
        `   Asunto: ${datos.asunto}\n` +
        `   ──────────────────────────────────────\n` +
        `   ${datos.mensaje.replace(/\n/g, '\n   ')}\n` +
        `   ══════════════════════════════════════`,
      );

      // Marcar como enviada
      guardada.enviada = true;
      guardada.fechaEnvio = new Date();
      await this.notificacionRepo.save(guardada);
    } catch (error: any) {
      // Si falla el envío, queda en BD como no enviada para reintentar
      this.logger.error(
        `❌ Error enviando notificación #${guardada.id}: ${error.message}`,
      );
    }

    return this.mapearResponse(guardada);
  }

  /**
   * Mapea una entidad Notificacion a NotificacionResponseDto.
   */
  private mapearResponse(n: Notificacion): NotificacionResponseDto {
    return {
      id: n.id,
      tipo: n.tipo,
      destinatarioEmail: n.destinatarioEmail,
      asunto: n.asunto,
      mensaje: n.mensaje,
      enviada: n.enviada,
      fechaEnvio: n.fechaEnvio ?? null,
      createdAt: n.createdAt,
    };
  }
}