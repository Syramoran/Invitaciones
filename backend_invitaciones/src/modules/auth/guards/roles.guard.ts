import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserRole } from '../../../entities';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

/**
 * RolesGuard — Se aplica GLOBALMENTE (después de JwtAuthGuard).
 * Solo actúa cuando existe metadata @Roles() en el endpoint o controlador.
 * Si no hay @Roles(), deja pasar a cualquier usuario autenticado.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Sin @Roles() → por defecto SOLO ADMIN puede acceder (protege v1 API).
    let allowedRoles = requiredRoles;
    if (!allowedRoles || allowedRoles.length === 0) {
      allowedRoles = [UserRole.ADMIN];
    }

    const user = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>().user;

    if (!user || !allowedRoles.includes(user.role as UserRole)) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}.`,
      );
    }

    return true;
  }
}
