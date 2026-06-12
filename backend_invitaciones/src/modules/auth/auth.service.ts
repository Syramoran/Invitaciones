// src/modules/auth/auth.service.ts
import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

import { HashService } from './hash.service';
import { UsuarioService } from '../entities-modules/usuario-module/usuario.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Usuario, VerificacionEmail, PasswordReset } from '../../entities';
import { LoginResponseDto, UserDataDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';

const OTP_EXPIRY_MINUTES = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usuariosService: UsuarioService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly notificacionesService: NotificacionesService,
    @InjectRepository(VerificacionEmail)
    private readonly verificacionRepo: Repository<VerificacionEmail>,
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>,
  ) {}

  // ─────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────

  /**
   * Busca y verifica la contraseña. Retorna el usuario (sin hash) o null.
   * Si el email no está verificado, lanza ForbiddenException con EMAIL_NOT_VERIFIED.
   */
  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<Usuario, 'passwordHash'> | null> {
    const user = await this.usuariosService.findByUsername(username);

    if (!user) return null;

    const passwordOk = await this.hashService.verify(user.passwordHash, pass);
    if (!passwordOk) return null;

    // Credenciales correctas — verificar que el email esté confirmado
    if (!user.emailVerificado) {
      throw new ForbiddenException({
        code: 'EMAIL_NOT_VERIFIED',
        userId: user.id,
        email: user.email,
        message: 'Debés verificar tu correo electrónico antes de ingresar.',
      });
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  /** Firma el JWT y arma la respuesta tipada */
  async login(user: Omit<Usuario, 'passwordHash'>): Promise<LoginResponseDto> {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const userData: UserDataDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: userData,
    };
  }

  // ─────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<{ userId: number; email: string }> {
    // 1. Verificar duplicados
    const [existingUsername, existingEmail] = await Promise.all([
      this.usuariosService.findByUsername(dto.username),
      this.usuariosService.findByEmail(dto.email),
    ]);

    if (existingUsername) {
      throw new ConflictException({
        code: 'USERNAME_TAKEN',
        message: 'El nombre de usuario ya está en uso',
      });
    }
    if (existingEmail) {
      throw new ConflictException({
        code: 'EMAIL_TAKEN',
        message: 'El correo electrónico ya está en uso',
      });
    }

    // 2. Hashear contraseña y crear usuario
    const passwordHash = await this.hashService.hash(dto.password);
    const user = await this.usuariosService.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      role: 'CLIENT',
      emailVerificado: false,
    });

    // 3. Generar OTP y enviar email (no bloqueamos si el email falla)
    const codigo = this.generarOtp();
    await this.guardarOtp(user.id, codigo);
    this.logger.log(`📨 Enviando código de verificación al registrar → userId=${user.id} email=${user.email}`);
    this.notificacionesService
      .enviarCodigoVerificacion({ email: user.email, username: user.username, codigo })
      .then(() => this.logger.log(`✅ Email de verificación enviado en registro → ${user.email}`))
      .catch((err) => this.logger.error(`❌ Falló envío de email en registro → ${user.email}: ${err?.message}`));

    return { userId: user.id, email: user.email };
  }

  // ─────────────────────────────────────────────────────────
  // VERIFY EMAIL
  // ─────────────────────────────────────────────────────────

  async verifyEmail(
    userId: number,
    codigo: string,
  ): Promise<LoginResponseDto> {
    const ahora = new Date();

    // Buscar el OTP más reciente no usado y no expirado
    const otp = await this.verificacionRepo.findOne({
      where: { usuarioId: userId, usado: false },
      order: { createdAt: 'DESC' },
    });

    if (!otp || otp.expiresAt < ahora || otp.codigo !== codigo) {
      throw new BadRequestException({
        code: 'INVALID_CODE',
        message: 'El código es inválido o ha expirado.',
      });
    }

    // Marcar OTP como usado y verificar usuario (en paralelo)
    await Promise.all([
      this.verificacionRepo.update(otp.id, { usado: true }),
      this.usuariosService.markEmailVerified(userId),
    ]);

    // Auto-login: retornar JWT
    const user = await this.usuariosService.findById(userId);
    return this.login({ ...user, emailVerificado: true });
  }

  // ─────────────────────────────────────────────────────────
  // RESEND VERIFICATION
  // ─────────────────────────────────────────────────────────

  async resendVerification(userId: number): Promise<{ message: string }> {
    const user = await this.usuariosService.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (user.emailVerificado) {
      throw new BadRequestException({
        code: 'ALREADY_VERIFIED',
        message: 'Esta cuenta ya está verificada.',
      });
    }

    // Invalidar OTPs anteriores y generar uno nuevo
    await this.verificacionRepo.update(
      { usuarioId: userId, usado: false },
      { usado: true },
    );

    const codigo = this.generarOtp();
    await this.guardarOtp(userId, codigo);

    this.logger.log(`📨 Reenviando código de verificación → userId=${userId} email=${user.email}`);
    this.notificacionesService
      .enviarCodigoVerificacion({ email: user.email, username: user.username, codigo })
      .then(() => this.logger.log(`✅ Reenvío exitoso → ${user.email}`))
      .catch((err) => this.logger.error(`❌ Falló reenvío → ${user.email}: ${err?.message}`));

    return { message: 'Código reenviado. Revisá tu bandeja de entrada.' };
  }

  // ─────────────────────────────────────────────────────────
  // FORGOT PASSWORD
  // ─────────────────────────────────────────────────────────

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usuariosService.findByEmail(email);

    if (!user) {
      // No revelamos si el email existe o no (por seguridad)
      return { message: 'Si el email está registrado, recibirás un link para resetear tu contraseña.' };
    }

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    // Guardar token en BD
    await this.passwordResetRepo.save({
      usuarioId: user.id,
      token,
      expiresAt,
      used: false,
    });

    // Enviar email de forma asincrónica
    this.notificacionesService
      .enviarEmailResetPassword({
        email: user.email,
        username: user.username,
        resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/reset-password?token=${token}`,
      })
      .then(() => this.logger.log(`📨 Email de reset enviado → ${user.email}`))
      .catch((err) => this.logger.error(`❌ Falló envío de reset → ${user.email}: ${err?.message}`));

    return { message: 'Si el email está registrado, recibirás un link para resetear tu contraseña.' };
  }

  async verifyResetToken(token: string): Promise<{ isValid: boolean; message: string }> {
    const resetRecord = await this.passwordResetRepo.findOne({
      where: { token, used: false },
    });

    if (!resetRecord) {
      return { isValid: false, message: 'El token es inválido o ya fue utilizado.' };
    }

    if (new Date() > resetRecord.expiresAt) {
      return { isValid: false, message: 'El token ha expirado.' };
    }

    return { isValid: true, message: 'Token válido' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const resetRecord = await this.passwordResetRepo.findOne({
      where: { token, used: false },
    });

    if (!resetRecord) {
      throw new BadRequestException('El token es inválido o ya fue utilizado.');
    }

    if (new Date() > resetRecord.expiresAt) {
      throw new BadRequestException('El token ha expirado.');
    }

    // Obtener usuario
    const user = await this.usuariosService.findById(resetRecord.usuarioId);

    // Hashear nueva contraseña
    const passwordHash = await this.hashService.hash(newPassword);

    // Actualizar contraseña
    await this.usuariosService.updatePassword(user.id, passwordHash);

    // Marcar token como usado
    resetRecord.used = true;
    await this.passwordResetRepo.save(resetRecord);

    // Invalidar todos los demás tokens de reset para este usuario (opcional pero seguro)
    await this.passwordResetRepo.update(
      { usuarioId: user.id, used: false },
      { used: true },
    );

    this.logger.log(`✅ Contraseña reseteada → userId=${user.id}`);

    return { message: 'Contraseña actualizada exitosamente. Podés iniciar sesión con tu nueva contraseña.' };
  }

  // ─────────────────────────────────────────────────────────
  // Utilidades privadas
  // ─────────────────────────────────────────────────────────

  private generarOtp(): string {
    // crypto.randomInt es criptográficamente seguro
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private async guardarOtp(usuarioId: number, codigo: string): Promise<void> {
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await this.verificacionRepo.save(
      this.verificacionRepo.create({ usuarioId, codigo, expiresAt, usado: false }),
    );
  }
}