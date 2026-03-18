import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsUrl,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

export class CreateHistoriaSeccionDto {
  // @IsString()
  // @IsNotEmpty()
  // invitacionId!: string; // UUID de la invitación vinculada

  @IsString({ message: 'El texto de la historia debe ser una cadena' })
  @IsNotEmpty({ message: 'El contenido de la sección no puede estar vacío' })
  @MaxLength(3000, { message: 'El texto no puede superar los 3000 caracteres' })
  texto!: string; //

  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  @IsOptional()
  @MaxLength(500)
  imagenUrl?: string; // URL de Firebase

  @IsInt()
  @Min(1)
  @Max(3) 
  @Type(() => Number)
  orden!: number;
}

export class UpdateHistoriaSeccionDto {
  @IsString()
  @IsOptional()
  @MaxLength(3000)
  texto?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  imagenUrl?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
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