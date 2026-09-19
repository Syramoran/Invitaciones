import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { InvitacionesService } from '../../invitaciones/invitaciones.service';
import type { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';

/**
 * Permite el acceso a un ADMIN (control total, cualquier invitación) o al
 * usuario dueño de la invitación puntual del :id de la ruta (mismo criterio
 * de ownership que ya usa InvitacionesClientController). Requiere correr
 * después de JwtAuthGuard, que puebla request.user.
 */
@Injectable()
export class InvitacionOwnerOrAdminGuard implements CanActivate {
  constructor(private readonly invitacionesService: InvitacionesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const usuario = (request as any).user as AuthenticatedUser | undefined;

    if (!usuario) {
      throw new ForbiddenException('Usuario no autenticado.');
    }

    if (usuario.role === 'ADMIN') {
      return true;
    }

    const invitacionId = String(request.params.id);
    await this.invitacionesService.verificarPropiedad(invitacionId, usuario.id);
    return true;
  }
}
