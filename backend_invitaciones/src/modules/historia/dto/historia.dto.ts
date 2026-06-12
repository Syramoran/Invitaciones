import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * POST /invitaciones/:id/historias
 * Crear sección de historia (admin, JWT).
 * Request multipart/form-data: texto + imagen (File) + orden.
 */
export class CreateHistoriaSeccionDto {
  @ApiPropertyOptional({ example: 'Nos conocimos un día...', description: 'Texto de la historia' })
  @IsString({ message: 'El texto de la historia debe ser una cadena' })
  @IsOptional()
  @MaxLength(3000, { message: 'El texto no puede superar los 3000 caracteres' })
  texto?: string;

  @ApiPropertyOptional({ example: 'https://...', description: 'URL de la imagen (opcional)' })
  @IsString()                          // ← agregar
  @IsOptional()                        // ← agregar
  @MaxLength(500)                      // ← agregar
  imagenUrl?: string;                  // ← agregar

  @ApiProperty({ example: 1, description: 'Orden de la sección (1 al 3)' })
  @IsInt()
  @Min(1)
  @Max(3)
  @Type(() => Number)
  orden!: number;
}

/**
 * PUT /invitaciones/:id/historias/:seccionId
 * Actualizar sección existente (admin, JWT).
 */
export class UpdateHistoriaSeccionDto {
  @ApiPropertyOptional({ example: 'Nos conocimos un día...', description: 'Texto de la historia' })
  @IsString()
  @IsOptional()
  @MaxLength(3000)
  texto?: string;

  @ApiPropertyOptional({ example: 'https://...', description: 'URL de la imagen' })
  @IsString()                          // ← agregar
  @IsOptional()                        // ← agregar
  @MaxLength(500)                      // ← agregar
  imagenUrl?: string;                  // ← agregar

  @ApiPropertyOptional({ example: 2, description: 'Nuevo orden' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(3)
  @Type(() => Number)
  orden?: number;

  /** true cuando el usuario quitó la imagen sin reemplazarla */
  @ApiPropertyOptional({ example: false, description: 'Indica si se eliminó la imagen' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  removeImagen?: boolean;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

export class HistoriaSeccionResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  invitacionId!: string;

  @ApiProperty({ example: 'Nuestra historia...' })
  texto!: string;

  @ApiPropertyOptional({ example: 'https://...' })
  imagenUrl!: string | null;

  @ApiProperty({ example: 1 })
  orden!: number;
}