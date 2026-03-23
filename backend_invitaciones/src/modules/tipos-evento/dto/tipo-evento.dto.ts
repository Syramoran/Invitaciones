import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsObject,
  IsBoolean,
} from 'class-validator';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

export class CreateTipoEventoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del tipo de evento es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre!: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @IsObject({ message: 'Los campos específicos deben ser un objeto JSON válido' })
  @IsOptional()
  camposEspecificos?: Record<string, any>; // Esquema dinámico JSONB
}

export class UpdateTipoEventoDto extends PartialType(CreateTipoEventoDto) {
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  @IsOptional()
  activo?: boolean; // Permite activar/desactivar el tipo de evento
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

export class TipoEventoResponseDto {
  id!: number;

  nombre!: string;

  @IsString()
  descripcion?: string | null;

  @IsObject()
  camposEspecificos?: Record<string, any> | null;

  @IsBoolean()
  activo!: boolean;

}