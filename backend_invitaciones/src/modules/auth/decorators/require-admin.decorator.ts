import { UseGuards } from '@nestjs/common';
import { RoleGuard } from '../guards/role.guard';

/**
 * Decorador para proteger rutas que requieren rol ADMIN
 * Uso: @RequireAdmin() en controladores o métodos
 */
export function RequireAdmin() {
  return UseGuards(new RoleGuard('ADMIN'));
}

/**
 * Decorador genérico para requerir un rol específico
 * Uso: @RequireRole('ADMIN') o @RequireRole('MODERATOR')
 */
export function RequireRole(role: string) {
  return UseGuards(new RoleGuard(role));
}
