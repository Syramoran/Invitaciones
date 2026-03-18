import { IsOptional, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoNotificacion } from '../../../entities/notificacion.entity';

// ═══════════════════════════════════════════
// QUERY DTOs
// ═══════════════════════════════════════════

/**
 * GET /notificaciones?page=1&limit=20&tipo=NUEVO_PEDIDO
 * Query params para listar notificaciones (admin, JWT).
 */
export class NotificacionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;

  @IsOptional()
  @IsEnum(TipoNotificacion)
  tipo?: TipoNotificacion;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

/**
 * Item individual de notificación.
 * Tipos: NUEVO_PEDIDO, EXPIRACION_PROXIMA, AVISO_ELIMINACION
 */
export class NotificacionResponseDto {
  id!: number;
  tipo!: TipoNotificacion;
  destinatarioEmail!: string;
  asunto!: string;
  mensaje!: string;
  enviada!: boolean;
  fechaEnvio!: Date | null;
  createdAt!: Date;
}

/**
 * Response paginado para listado de notificaciones (admin).
 */
export class PaginatedNotificacionesDto {
  data!: NotificacionResponseDto[];
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Registro de auditoría de eliminación automática.
 * La invitacion_id_ref es una referencia blanda (UUID)
 * porque el registro original ya fue eliminado (hard delete).
 */
export class LogEliminacionResponseDto {
  id!: number;
  invitacionIdRef!: string; // UUID de la invitación eliminada
  fechaEliminacion!: Date;
  fotosEliminadas!: number;
  detalles!: string | null;
}