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
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginAttemptService } from './login-attempt.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { ExtractJwt } from 'passport-jwt';
import { TokenBlacklistService } from './strategies/token-blacklist.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginAttemptService: LoginAttemptService,
    private readonly blacklistService: TokenBlacklistService,
  ) { }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      this.blacklistService.add(token);
    }
    return { message: 'Sesión cerrada' };
  }

  @Get('me') // Usamos GET para recuperar perfil
  @HttpCode(HttpStatus.OK)
  getProfile(@Req() req: any) {
    // req.user contiene exactamente lo que retornaste en el validate() de la estrategia
    return req.user;
  }
}