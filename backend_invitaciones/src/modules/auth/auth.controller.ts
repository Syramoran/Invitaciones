// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  HttpException,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginAttemptService } from './login-attempt.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { ExtractJwt } from 'passport-jwt';
import { TokenBlacklistService } from './strategies/token-blacklist.service';
import { JwtService } from '@nestjs/jwt';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

// Body DTOs para verify y resend
class VerifyEmailDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  codigo!: string;
}

class ResendVerificationDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginAttemptService: LoginAttemptService,
    private readonly blacklistService: TokenBlacklistService,
    private readonly jwtService: JwtService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // POST /auth/register
  // ─────────────────────────────────────────────────────────

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // ─────────────────────────────────────────────────────────
  // POST /auth/verify-email
  // ─────────────────────────────────────────────────────────

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return this.authService.verifyEmail(Number(body.userId), body.codigo);
  }

  // ─────────────────────────────────────────────────────────
  // POST /auth/resend-verification
  // ─────────────────────────────────────────────────────────

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() body: ResendVerificationDto) {
    return this.authService.resendVerification(Number(body.userId));
  }

  // ─────────────────────────────────────────────────────────
  // POST /auth/login
  // ─────────────────────────────────────────────────────────

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = req.ip ?? 'unknown';

    // 1. Verificar si la IP está bloqueada
    if (await this.loginAttemptService.isBlocked(ip)) {
      throw new HttpException(
        'Demasiados intentos fallidos. Intentá de nuevo en 15 minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Validar credenciales (puede lanzar ForbiddenException si no verificó email)
    let user: Awaited<ReturnType<AuthService['validateUser']>>;
    try {
      user = await this.authService.validateUser(loginDto.username, loginDto.password);
    } catch (err) {
      // Si es EMAIL_NOT_VERIFIED, propagamos el 403 tal cual (no contamos como intento fallido)
      throw err;
    }

    // 3. Si las credenciales son inválidas, registrar el intento y lanzar 401
    if (!user) {
      await this.loginAttemptService.registerFailure(ip);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Login exitoso — resetear contador y retornar token
    await this.loginAttemptService.reset(ip);
    return this.authService.login(user);
  }

  // ─────────────────────────────────────────────────────────
  // POST /auth/logout
  // ─────────────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      try {
        // Decodificar el token para obtener la fecha de expiración
        const decoded = this.jwtService.decode(token) as any;
        if (decoded?.exp) {
          const expiresAt = new Date(decoded.exp * 1000);
          await this.blacklistService.add(token, expiresAt);
        }
      } catch (error) {
        // Si no podemos decodificar, simplemente ignorar
        console.error('Error al decodificar token para blacklist:', error);
      }
    }
    return { message: 'Sesión cerrada' };
  }

  // ─────────────────────────────────────────────────────────
  // GET /auth/me
  // ─────────────────────────────────────────────────────────

  @Get('me')
  @HttpCode(HttpStatus.OK)
  getProfile(@Req() req: any) {
    return req.user;
  }

  // ─────────────────────────────────────────────────────────
  // POST /auth/forgot-password
  // ─────────────────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() { email }: { email: string }) {
    return this.authService.forgotPassword(email);
  }

  // ─────────────────────────────────────────────────────────
  // GET /auth/verify-reset-token/:token
  // ─────────────────────────────────────────────────────────

  @Public()
  @Get('verify-reset-token/:token')
  @HttpCode(HttpStatus.OK)
  async verifyResetToken(@Param('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  // ─────────────────────────────────────────────────────────
  // POST /auth/reset-password
  // ─────────────────────────────────────────────────────────

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: any) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }
}