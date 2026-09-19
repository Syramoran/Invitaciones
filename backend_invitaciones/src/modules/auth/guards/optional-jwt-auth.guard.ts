import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Variante de JwtAuthGuard para endpoints públicos que necesitan *saber*,
 * sin exigirlo, si quien llama está autenticado (ej: mostrar templates
 * privados solo si el caller es admin). Nunca bloquea: si no hay token o es
 * inválido, sigue igual pero req.user queda undefined.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // No confiamos en el valor de retorno de super.canActivate() para decidir
    // si se bloquea: siempre dejamos pasar, con o sin token válido.
    try {
      await super.canActivate(context);
    } catch {
      // Token ausente o inválido — está bien, seguimos sin usuario.
    }
    return true;
  }

  handleRequest(_err: any, user: any) {
    // A diferencia de JwtAuthGuard: nunca lanza, solo devuelve lo que haya.
    return user || undefined;
  }
}
