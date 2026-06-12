import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Injectable()
export class RoleGuard implements CanActivate {
  public readonly requiredRole: string;

  constructor(requiredRole: string = 'ADMIN') {
    this.requiredRole = requiredRole;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user as AuthenticatedUser | undefined;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (user.role !== this.requiredRole) {
      throw new ForbiddenException(`Se requiere rol ${this.requiredRole}, tienes ${user.role}`);
    }

    return true;
  }
}

/**
 * Factory para crear guards de rol específicos
 * Uso: @UseGuards(createRoleGuard('ADMIN'))
 */
export function createRoleGuard(role: string) {
  @Injectable()
  class SpecificRoleGuard extends RoleGuard {
    constructor() {
      super(role);
    }
  }
  return SpecificRoleGuard;
}
