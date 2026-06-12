import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServicioDto {
  @ApiProperty({ example: 'Confirmación de asistencia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ example: 1500.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  precio!: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  incluidoEnBase?: boolean = false; // Define si el servicio viene "gratis" con el plan base

  @ApiPropertyOptional({ example: 'Servicio para confirmar asistencia de invitados' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;
}

export class UpdateServicioDto {
  @ApiPropertyOptional({ example: 'Confirmación de asistencia' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ example: 1500.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  precio?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  incluidoEnBase?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiPropertyOptional({ example: 'Servicio para confirmar asistencia de invitados' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;
}

/**
 * Filtros para el catálogo de servicios
 */
export class ServicioQueryDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  incluidoEnBase?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

export class ServicioResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Confirmación de asistencia' })
  nombre!: string;

  @ApiProperty({ example: 1500.5 })
  precio!: number;

  @ApiProperty({ example: false })
  incluidoEnBase!: boolean;

  @ApiProperty({ example: 'Servicio para confirmar asistencia de invitados', required: false, type: String })
  descripcion!: string | null;

  @ApiProperty({ example: true })
  activo!: boolean;
}