import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../entities';

export const ROLES_KEY = 'roles';

/**
 * Decorador @Roles(...) — restringe el acceso a uno o varios roles específicos.
 *
 * Uso:
 *   @Roles(UserRole.ADMIN)               → solo administradores
 *   @Roles(UserRole.CLIENTE)             → solo clientes registrados
 *   @Roles(UserRole.ADMIN, UserRole.CLIENTE) → cualquier rol autenticado
 *
 * Sin @Roles() → cualquier usuario autenticado (ADMIN o CLIENTE) puede acceder.
 * Con @Public() → sin autenticación ni roles.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
