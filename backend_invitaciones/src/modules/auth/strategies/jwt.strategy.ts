// src/modules/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsuarioService } from 'src/modules/entities-modules/usuario-module/usuario.service';
import { TokenBlacklistService } from './token-blacklist.service';

export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

// Forma de req.user en cada request autenticado
export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly blacklistService: TokenBlacklistService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      // Necesitamos el request completo para poder extraer el token crudo
      // y verificar si está en la blacklist
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<AuthenticatedUser> {
    // Extraer el token crudo del header para verificar blacklist
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (token && this.blacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('El token ha sido invalidado');
    }

    // Hidratar desde BD — si el usuario fue eliminado, findById lanza NotFoundException
    const usuario = await this.usuarioService.findById(payload.sub);

    // Lo que retornamos acá queda disponible como req.user en todos los controllers
    return {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      role: usuario.role,
    };
  }
}