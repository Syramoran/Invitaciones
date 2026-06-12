// src/modules/auth/auth.service.ts
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { HashService } from './hash.service';
import { UsuarioService } from '../entities-modules/usuario-module/usuario.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Usuario, UserRole } from '../../entities';
import { LoginResponseDto, UserDataDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuarioService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  // Busca y verifica la contraseña. Retorna el usuario (sin hash) o null.
  async validateUser(username: string, pass: string): Promise<Omit<Usuario, 'passwordHash'> | null> {
    const user = await this.usuariosService.findByUsername(username);

    if (user && await this.hashService.verify(user.passwordHash, pass)) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  // Firma el JWT y arma la respuesta tipada
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

  // ═══════════════════════════════════════════
  // Registro de cliente
  // ═══════════════════════════════════════════

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const passwordHash = await this.hashService.hash(dto.password);

    // Token de verificación: 32 bytes aleatorios en hex (64 chars)
    const tokenVerificacion = randomBytes(32).toString('hex');

    // ConflictException se lanza desde UsuarioService si username/email ya existen
    await this.usuariosService.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      nombreCompleto: dto.nombreCompleto,
      role: UserRole.CLIENTE,
      tokenVerificacion,
    });

    // Enviar email de verificación (fire-and-forget — no bloquea la respuesta)
    this.notificacionesService
      .notificarRegistroCliente({
        email: dto.email,
        username: dto.username,
        tokenVerificacion,
      })
      .catch(() => {}); // silencioso — el usuario ya fue creado

    return {
      message:
        'Cuenta creada exitosamente. Te enviamos un email para verificar tu cuenta.',
    };
  }

  // ═══════════════════════════════════════════
  // Verificación de email
  // ═══════════════════════════════════════════

  async verifyEmail(token: string): Promise<{ message: string }> {
    const usuario = await this.usuariosService.findByTokenVerificacion(token);

    if (!usuario) {
      throw new UnprocessableEntityException(
        'Token de verificación inválido o ya utilizado.',
      );
    }

    await this.usuariosService.activar(usuario.id);

    return { message: 'Cuenta verificada exitosamente. Ya podés iniciar sesión.' };
  }
}