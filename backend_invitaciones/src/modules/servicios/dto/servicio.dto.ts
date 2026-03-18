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

export class CreateServicioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  precio!: number;

  @IsBoolean()
  @IsOptional()
  incluidoEnBase?: boolean = false; // Define si el servicio viene "gratis" con el plan base

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;
}

export class UpdateServicioDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  precio?: number;

  @IsBoolean()
  @IsOptional()
  incluidoEnBase?: boolean;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;
}

/**
 * Filtros para el catálogo de servicios
 */
export class ServicioQueryDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  incluidoEnBase?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

export class ServicioResponseDto {
  id!: number;
  nombre!: string;
  precio!: number;
  incluidoEnBase!: boolean;
  descripcion!: string | null;
  activo!: boolean;
}