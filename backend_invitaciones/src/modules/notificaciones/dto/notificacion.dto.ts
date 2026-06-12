import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoNotificacion } from '../../../entities/notificacion.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * GET /notificaciones?page=1&limit=20&tipo=NUEVO_PEDIDO
 * Query params para listar notificaciones con filtro y paginación (admin).
 */
export class NotificacionQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: TipoNotificacion })
  @IsOptional()
  @IsEnum(TipoNotificacion)
  tipo?: TipoNotificacion;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

export class NotificacionResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'NUEVO_PEDIDO' })
  tipo!: string;

  @ApiProperty({ example: 'admin@invitaciones.com' })
  destinatarioEmail!: string;

  @ApiProperty({ example: 'Nuevo pedido recibido' })
  asunto!: string;

  @ApiProperty({ example: 'Contenido del correo...' })
  mensaje!: string;

  @ApiProperty({ example: true })
  enviada!: boolean;

  @ApiProperty({ example: '2026-10-01T10:00:00Z', required: false, type: Date })
  fechaEnvio!: Date | null;

  @ApiProperty({ example: '2026-10-01T09:00:00Z' })
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