import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { InvitacionesService } from '../../invitaciones/invitaciones.service';

/**
 * Protege los endpoints de /asistentes: no usan JWT, se autentican con la
 * contraseña del evento (invitacion.contrasenaAsistentes) enviada en cada
 * request vía header x-event-password. Reemplaza la validación manual que
 * antes vivía inline en InvitadosService.obtenerAsistentes().
 */
@Injectable()
export class EventPasswordGuard implements CanActivate {
  constructor(private readonly invitacionesService: InvitacionesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const invitacionId = String(request.params.id);
    const passwordRecibida = request.headers['x-event-password'];

    const invitacion =
      await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    if (
      !invitacion.contrasenaAsistentes ||
      invitacion.contrasenaAsistentes !== passwordRecibida
    ) {
      throw new ForbiddenException('Contraseña del evento incorrecta.');
    }

    // Reutilizable por el handler, evita volver a buscar la invitación.
    (request as any).invitacion = invitacion;

    return true;
  }
}
