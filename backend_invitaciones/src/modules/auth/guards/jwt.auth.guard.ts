// src/modules/auth/jwt-auth.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Si el endpoint tiene @Public(), dejamos pasar sin verificar token
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  // Sobreescribimos para controlar el mensaje de error
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      const message =
        info?.name === 'TokenExpiredError'
          ? 'El token ha expirado'
          : info?.name === 'JsonWebTokenError'
            ? 'Token inválido'
            : 'No autorizado';

      throw new UnauthorizedException(message);
    }
    return user;
  }
}