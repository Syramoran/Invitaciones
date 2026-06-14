import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

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
export class NotificacionesService implements OnModuleInit {
  private readonly logger = new Logger(NotificacionesService.name);
  private resend: Resend | null = null;
  private fromEmail!: string;

  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepo: Repository<Notificacion>,
    private readonly configService: ConfigService,
  ) {}

  // ═══════════════════════════════════════════
  // Inicialización — Configurar cliente Resend
  // ═══════════════════════════════════════════

  onModuleInit() {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>(
      'RESEND_FROM',
      'Festeja Invitaciones Digitales <onboarding@resend.dev>',
    );

    if (!apiKey) {
      this.logger.warn(
        '⚠️ Resend no configurado (falta RESEND_API_KEY). Los emails NO se enviarán.',
      );
      return;
    }

    this.resend = new Resend(apiKey);
    this.logger.log(`📧 Resend listo — desde: ${this.fromEmail}`);
  }

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
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════
  // POST /notificaciones/test — Enviar prueba (admin, JWT)
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
      mensaje: 'Esta es una notificación de prueba desde el panel de administración.',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#333;">Notificación de prueba</h2>
          <p>Si estás viendo esto, el sistema de notificaciones funciona correctamente.</p>
          <p style="color:#888;font-size:12px;">Invitaciones Digitales</p>
        </div>`,
    });
  }

  // ═══════════════════════════════════════════
  // NUEVO_PEDIDO
  // Llamar desde: PedidosService.crear()
  // Destinatario: ADMIN_EMAIL (propietario)
  // ═══════════════════════════════════════════

  async notificarNuevoPedido(datos: {
    pedidoId: number;
    nombreCliente: string;
    telefono: string;
    email: string;
    tipoEvento: string;
    template: string;
    precioTotal: number;
  }): Promise<void> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@invitaciones.com');
    const asunto = `Nuevo pedido #${datos.pedidoId} — ${datos.nombreCliente}`;
    const mensaje =
      `Nuevo pedido recibido:\n` +
      `Cliente: ${datos.nombreCliente}\n` +
      `Teléfono: ${datos.telefono}\n` +
      `Email: ${datos.email}\n` +
      `Evento: ${datos.tipoEvento}\n` +
      `Template: ${datos.template}\n` +
      `Total: $${datos.precioTotal.toLocaleString('es-AR')}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#333;">Nuevo Pedido #${datos.pedidoId}</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Cliente</td>
              <td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${datos.nombreCliente}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Teléfono</td>
              <td style="padding:8px;border-bottom:1px solid #eee;">${datos.telefono}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Email</td>
              <td style="padding:8px;border-bottom:1px solid #eee;">${datos.email}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Tipo de evento</td>
              <td style="padding:8px;border-bottom:1px solid #eee;">${datos.tipoEvento}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Template</td>
              <td style="padding:8px;border-bottom:1px solid #eee;">${datos.template}</td></tr>
          <tr><td style="padding:8px;color:#666;">Precio total</td>
              <td style="padding:8px;font-weight:bold;font-size:18px;color:#2e7d32;">$${datos.precioTotal.toLocaleString('es-AR')}</td></tr>
        </table>
        <p style="margin-top:20px;">
          <a href="https://wa.me/${datos.telefono.replace(/[^0-9]/g, '')}"
             style="background:#25D366;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
            Contactar por WhatsApp</a>
        </p>
        <p style="color:#888;font-size:12px;margin-top:30px;">Invitaciones Digitales — Notificación automática</p>
      </div>`;

    await this.crearYEnviar({ tipo: TipoNotificacion.NUEVO_PEDIDO, destinatarioEmail: adminEmail, asunto, mensaje, html });
  }

  // ═══════════════════════════════════════════
  // VERIFICACION_EMAIL
  // Llamar desde: AuthService.register() y AuthService.resendVerification()
  // Destinatario: email del usuario recién registrado
  // ═══════════════════════════════════════════

  async enviarCodigoVerificacion(datos: {
    email: string;
    username: string;
    codigo: string;
  }): Promise<void> {
    const asunto = `${datos.codigo} es tu código de verificación — Festeja`;
    const mensaje =
      `Hola ${datos.username},\n\n` +
      `Tu código de verificación es: ${datos.codigo}\n\n` +
      `Este código es válido por 15 minutos.\n\n` +
      `Si no creaste esta cuenta, podés ignorar este mensaje.\n\n` +
      `— Festeja Invitaciones Digitales`;

    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #f0ece4;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#2d2926 0%,#4a4441 100%);padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
            festejá<span style="color:#c5a572;font-style:italic;">.</span>
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.6);letter-spacing:0.5px;text-transform:uppercase;">Verificación de cuenta</p>
        </div>

        <!-- Body -->
        <div style="padding:40px 40px 32px;">
          <p style="margin:0 0 8px;font-size:16px;color:#2d2926;">Hola, <strong>${datos.username}</strong> 👋</p>
          <p style="margin:0 0 32px;font-size:15px;color:#6b7280;line-height:1.6;">
            Usá el siguiente código para verificar tu cuenta. Es válido por <strong>15 minutos</strong>.
          </p>

          <!-- OTP Box -->
          <div style="background:#faf8f5;border:2px solid #e8e0d4;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
            <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Tu código de verificación</p>
            <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:12px;color:#2d2926;font-family:'Courier New',monospace;">${datos.codigo}</p>
          </div>

          <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
            Si no creaste una cuenta en Festeja, podés ignorar este mensaje de forma segura.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#faf8f5;padding:20px 40px;border-top:1px solid #f0ece4;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© Festeja Invitaciones Digitales — Notificación automática</p>
        </div>
      </div>`;

    await this.crearYEnviar({
      tipo: TipoNotificacion.VERIFICACION_EMAIL,
      destinatarioEmail: datos.email,
      asunto,
      mensaje,
      html,
    });
  }

  // ═══════════════════════════════════════════
  // Reset de contraseña
  // Destinatario: email del usuario que solicitó reset
  // ═══════════════════════════════════════════

  async enviarEmailResetPassword(datos: {
    email: string;
    username: string;
    resetLink: string;
  }): Promise<void> {
    const asunto = 'Resetea tu contraseña — Festeja';
    const mensaje =
      `Hola ${datos.username},\n\n` +
      `Recibimos una solicitud para resetear tu contraseña. Usá el siguiente link:\n\n` +
      `${datos.resetLink}\n\n` +
      `Este link es válido por 30 minutos.\n\n` +
      `Si no solicitaste un reset, podés ignorar este mensaje de forma segura.\n\n` +
      `— Festeja Invitaciones Digitales`;

    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #f0ece4;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#2d2926 0%,#4a4441 100%);padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
            festejá<span style="color:#c5a572;font-style:italic;">.</span>
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.6);letter-spacing:0.5px;text-transform:uppercase;">Reset de contraseña</p>
        </div>

        <!-- Body -->
        <div style="padding:40px 40px 32px;">
          <p style="margin:0 0 8px;font-size:16px;color:#2d2926;">Hola, <strong>${datos.username}</strong> 👋</p>
          <p style="margin:0 0 32px;font-size:15px;color:#6b7280;line-height:1.6;">
            Solicitaste resetear tu contraseña. Usá el siguiente link para continuar. Es válido por <strong>30 minutos</strong>.
          </p>

          <!-- CTA Button -->
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${datos.resetLink}" style="display:inline-block;background:#c5a572;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
              Resetear contraseña
            </a>
          </div>

          <p style="margin:0 0 16px;font-size:13px;color:#9ca3af;">O copia y pega este link en tu navegador:</p>
          <p style="margin:0 0 16px;font-size:12px;color:#6b7280;word-break:break-all;background:#faf8f5;padding:12px;border-radius:8px;border-left:3px solid #c5a572;">
            ${datos.resetLink}
          </p>

          <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
            Si no solicitaste resetear tu contraseña, podés ignorar este mensaje de forma segura. Tu cuenta permanecerá protegida.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#faf8f5;padding:20px 40px;border-top:1px solid #f0ece4;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© Festeja Invitaciones Digitales — Notificación automática</p>
        </div>
      </div>`;

    await this.crearYEnviar({
      tipo: TipoNotificacion.VERIFICACION_EMAIL,
      destinatarioEmail: datos.email,
      asunto,
      mensaje,
      html,
    });
  }

  // ═══════════════════════════════════════════
  // EXPIRACION_PROXIMA
  // Llamar desde: CronJobsService.notificarExpiracionProxima()
  // Destinatario: email del anfitrión (pedido.email)
  // ═══════════════════════════════════════════

  async notificarExpiracionProxima(datos: {
    invitacionId: string;
    titulo: string;
    emailAnfitrion: string;
    diasRestantes: number;
    fechaEliminacion: Date;
  }): Promise<void> {
    const fechaStr = datos.fechaEliminacion instanceof Date
      ? datos.fechaEliminacion.toLocaleDateString('es-AR')
      : new Date(datos.fechaEliminacion).toLocaleDateString('es-AR');

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://invitaciones.com');
    const asunto = `Tu invitación "${datos.titulo}" será eliminada en ${datos.diasRestantes} días`;
    const mensaje =
      `Hola,\n\n` +
      `Tu invitación "${datos.titulo}" será eliminada el ${fechaStr}.\n` +
      `Descargá las fotos antes de esa fecha: ${frontendUrl}/${datos.invitacionId}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#e65100;">Tu invitación será eliminada en ${datos.diasRestantes} días</h2>
        <p>Hola,</p>
        <p>Tu invitación <strong>"${datos.titulo}"</strong> será eliminada el <strong>${fechaStr}</strong>.</p>
        <p>Si querés conservar las fotos de la galería, descargalas antes de esa fecha:</p>
        <p style="margin:20px 0;">
          <a href="${frontendUrl}/${datos.invitacionId}/galeria"
             style="background:#1976d2;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
            Ver invitación y descargar fotos</a>
        </p>
        <p style="color:#888;font-size:13px;">
          Después del ${fechaStr}, la invitación, la galería de fotos
          y todos los datos asociados serán eliminados permanentemente.</p>
        <p style="color:#888;font-size:12px;margin-top:30px;">Invitaciones Digitales — Notificación automática</p>
      </div>`;

    await this.crearYEnviar({ tipo: TipoNotificacion.EXPIRACION_PROXIMA, destinatarioEmail: datos.emailAnfitrion, asunto, mensaje, html });
  }

  // ═══════════════════════════════════════════
  // AVISO_ELIMINACION
  // Llamar desde: CronJobsService.eliminarInvitacionesExpiradas()
  //               InvitacionesService.eliminar() (manual)
  // Solo registro en BD, no envía email.
  // ═══════════════════════════════════════════

  async registrarEliminacion(datos: {
    invitacionId: string;
    titulo: string;
    fotosEliminadas: number;
  }): Promise<void> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@invitaciones.com');

    await this.notificacionRepo.save(
      this.notificacionRepo.create({
        tipo: TipoNotificacion.AVISO_ELIMINACION,
        destinatarioEmail: adminEmail,
        asunto: `Eliminación — "${datos.titulo}"`,
        mensaje:
          `Invitación: ${datos.invitacionId}\n` +
          `Título: ${datos.titulo}\n` +
          `Fotos eliminadas: ${datos.fotosEliminadas}\n` +
          `Fecha: ${new Date().toLocaleString('es-AR')}`,
        enviada: true,
        fechaEnvio: new Date(),
      }),
    );

    this.logger.log(`📋 Eliminación registrada — ${datos.invitacionId} | Fotos: ${datos.fotosEliminadas}`);
  }

  // ═══════════════════════════════════════════
  // Método privado — Crear registro + enviar email via Resend
  // ═══════════════════════════════════════════

  private async crearYEnviar(datos: {
    tipo: TipoNotificacion;
    destinatarioEmail: string;
    asunto: string;
    mensaje: string;
    html?: string;
  }): Promise<NotificacionResponseDto> {
    // 1. Persistir en BD
    let guardada: Notificacion | null = null;
    try {
      guardada = await this.notificacionRepo.save(
        this.notificacionRepo.create({
          tipo: datos.tipo,
          destinatarioEmail: datos.destinatarioEmail,
          asunto: datos.asunto,
          mensaje: datos.mensaje,
          enviada: false,
        }),
      );
    } catch (dbError: any) {
      this.logger.warn(
        `⚠️ No se pudo registrar notificación en BD [${datos.tipo}]: ${dbError.message}. ` +
        `Se intentará enviar el email de todas formas.`,
      );
    }

    // 2. Enviar via Resend
    try {
      if (this.resend) {
        this.logger.log(`📧 Enviando via Resend [${datos.tipo}] → ${datos.destinatarioEmail}`);

        const { error } = await this.resend.emails.send({
          from: this.fromEmail,
          to: [datos.destinatarioEmail],
          subject: datos.asunto,
          text: datos.mensaje,
          html: datos.html ?? datos.mensaje.replace(/\n/g, '<br>'),
        });

        if (error) throw new Error(error.message);

        this.logger.log(`✅ Email enviado via Resend [${datos.tipo}] → ${datos.destinatarioEmail}`);

        if (guardada) {
          guardada.enviada = true;
          guardada.fechaEnvio = new Date();
          await this.notificacionRepo.save(guardada).catch(() => { /* ignorar */ });
        }
      } else {
        this.logger.warn(`⚠️ Resend no inicializado — email NO enviado [${datos.tipo}] → ${datos.destinatarioEmail}`);
      }
    } catch (emailError: any) {
      this.logger.error(`❌ Error Resend [${datos.tipo}] → ${datos.destinatarioEmail}: ${emailError.message}`);
    }

    if (guardada) return this.mapearResponse(guardada);

    return {
      id: 0,
      tipo: datos.tipo,
      destinatarioEmail: datos.destinatarioEmail,
      asunto: datos.asunto,
      mensaje: datos.mensaje,
      enviada: false,
      fechaEnvio: null,
      createdAt: new Date(),
    };
  }

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
