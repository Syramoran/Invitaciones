import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

export class CreateTipoEventoDto {
  @ApiProperty({ example: 'Boda' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del tipo de evento es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre!: string;

  @ApiPropertyOptional({ example: 'Evento de boda' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({ example: { colorTema: '#000000' } })
  @IsObject({ message: 'Los campos específicos deben ser un objeto JSON válido' })
  @IsOptional()
  camposEspecificos?: Record<string, any>; // Esquema dinámico JSONB
}

export class UpdateTipoEventoDto extends PartialType(CreateTipoEventoDto) {
  @ApiPropertyOptional({ example: true })
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  @IsOptional()
  activo?: boolean; // Permite activar/desactivar el tipo de evento
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

export class TipoEventoResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Boda' })
  nombre!: string;

  @ApiProperty({ example: 'Evento de boda', required: false, type: String })
  @IsString()
  descripcion?: string | null;

  @ApiProperty({ example: { colorTema: '#000000' }, required: false, type: Object })
  @IsObject()
  camposEspecificos?: Record<string, any> | null;

  @ApiProperty({ example: true })
  @IsBoolean()
  activo!: boolean;

}