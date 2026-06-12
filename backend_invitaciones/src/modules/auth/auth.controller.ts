// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  HttpException,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginAttemptService } from './login-attempt.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { ExtractJwt } from 'passport-jwt';
import { TokenBlacklistService } from './strategies/token-blacklist.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginAttemptService: LoginAttemptService,
    private readonly blacklistService: TokenBlacklistService,
  ) { }

  // ═══════════════════════════════════════════
  // POST /auth/login — Iniciar sesión (admin o cliente)
  // ═══════════════════════════════════════════

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión (admin o cliente)' })
  @ApiResponse({ status: 200, description: 'Login exitoso', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos fallidos' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = req.ip ?? 'unknown';

    // 1. Verificar si la IP está bloqueada
    if (this.loginAttemptService.isBlocked(ip)) {
      throw new HttpException(
        'Demasiados intentos fallidos. Intentá de nuevo en 15 minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Validar credenciales
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);

    // 3. Si falla, registrar el intento y lanzar 401
    if (!user) {
      this.loginAttemptService.registerFailure(ip);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Login exitoso — resetear contador y retornar token
    this.loginAttemptService.reset(ip);
    return this.authService.login(user);
  }

  // ═══════════════════════════════════════════
  // POST /auth/register — Registro de clientes
  // ═══════════════════════════════════════════

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registro de clientes' })
  @ApiResponse({ status: 201, description: 'Cliente registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ═══════════════════════════════════════════
  // GET /auth/verify-email?token=xxx — Verificar email
  // ═══════════════════════════════════════════

  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar correo electrónico' })
  @ApiResponse({ status: 200, description: 'Email verificado correctamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ═══════════════════════════════════════════
  // POST /auth/logout — Cerrar sesión (invalida JWT)
  // ═══════════════════════════════════════════

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión (invalida JWT)' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async logout(@Req() req: Request) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      this.blacklistService.add(token);
    }
    return { message: 'Sesión cerrada' };
  }

  // ═══════════════════════════════════════════
  // GET /auth/me — Perfil del usuario autenticado
  // ═══════════════════════════════════════════

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProfile(@Req() req: any) {
    return req.user;
  }
}