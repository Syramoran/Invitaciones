import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * POST /invitaciones/:id/historias
 * Crear sección de historia (admin, JWT).
 * Request multipart/form-data: texto + imagen (File) + orden.
 */
export class CreateHistoriaSeccionDto {
  @IsString({ message: 'El texto de la historia debe ser una cadena' })
  @IsNotEmpty({ message: 'El contenido de la sección no puede estar vacío' })
  @MaxLength(3000, { message: 'El texto no puede superar los 3000 caracteres' })
  texto!: string;

  @IsString()                          // ← agregar
  @IsOptional()                        // ← agregar
  @MaxLength(500)                      // ← agregar
  imagenUrl?: string;                  // ← agregar

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
  @IsString()
  @IsOptional()
  @MaxLength(3000)
  texto?: string;

  @IsString()                          // ← agregar
  @IsOptional()                        // ← agregar
  @MaxLength(500)                      // ← agregar
  imagenUrl?: string;                  // ← agregar

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(3)
  @Type(() => Number)
  orden?: number;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

export class HistoriaSeccionResponseDto {
  id!: number;
  invitacionId!: string;
  texto!: string;
  imagenUrl!: string | null;
  orden!: number;
}