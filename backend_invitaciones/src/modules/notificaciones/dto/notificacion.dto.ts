import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoNotificacion } from '../../../entities/notificacion.entity';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * GET /notificaciones?page=1&limit=20&tipo=NUEVO_PEDIDO
 * Query params para listar notificaciones con filtro y paginación (admin).
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

export class NotificacionResponseDto {
  id!: number;
  tipo!: string;
  destinatarioEmail!: string;
  asunto!: string;
  mensaje!: string;
  enviada!: boolean;
  fechaEnvio!: Date | null;
  createdAt!: Date;
}

export class PaginatedNotificacionesDto {
  data!: NotificacionResponseDto[];
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}