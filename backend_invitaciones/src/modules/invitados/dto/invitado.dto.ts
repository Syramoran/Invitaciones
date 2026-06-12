import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * Invitado individual dentro del array de carga masiva.
 */
export class InvitadoItemDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del invitado' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del invitado es obligatorio' })
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del invitado' })
  @IsString()
  @IsNotEmpty({ message: 'El apellido del invitado es obligatorio' })
  @MaxLength(100)
  apellido!: string;
}

/**
 * POST /invitaciones/:id/invitados
 * Carga masiva de invitados desde JSON (admin, JWT).
 */
export class CargarInvitadosDto {
  @ApiProperty({ type: [InvitadoItemDto], description: 'Lista de invitados a cargar' })
  @IsArray()
  @ArrayMinSize(1, { message: 'La lista de invitados no puede estar vacía' })
  @ValidateNested({ each: true })
  @Type(() => InvitadoItemDto)
  invitados!: InvitadoItemDto[];
}

/**
 * POST /invitaciones/:id/confirmar
 * Confirmar asistencia de un invitado (público).
 * Se recibe el slug tal como viene en el parámetro ?invitado de la URL.
 */
export class ConfirmarAsistenciaDto {
  @ApiProperty({ example: 'juan-perez-1234', description: 'Slug único del invitado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  invitadoSlug!: string;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

/**
 * URL personalizada generada para un invitado.
 */
export class UrlInvitadoDto {
  @ApiProperty({ example: 'Juan' })
  nombre!: string;

  @ApiProperty({ example: 'Pérez' })
  apellido!: string;

  @ApiProperty({ example: 'https://invitacion.com/boda-juan-ana?invitado=juan-perez-1234' })
  url!: string;
}

export class CargarInvitadosResponseDto {
  @ApiProperty({ example: 15 })
  totalInvitados!: number;

  @ApiProperty({ type: [UrlInvitadoDto] })
  urlsGeneradas!: UrlInvitadoDto[];
}

export class InvitadoResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Juan' })
  nombre!: string;

  @ApiProperty({ example: 'Pérez' })
  apellido!: string;

  @ApiProperty({ example: true })
  confirmado!: boolean;

  @ApiProperty({ example: '2026-10-01T10:00:00Z', required: false, type: Date })
  fechaConfirmacion!: Date | null;

  @ApiProperty({ example: 'https://invitacion.com/boda-juan-ana?invitado=juan-perez-1234' })
  urlPersonalizada!: string;
}

export class ConfirmacionResponseDto {
  @ApiProperty({ example: 'Asistencia confirmada exitosamente' })
  mensaje!: string;

  @ApiProperty({ example: 'Juan' })
  nombre!: string;

  @ApiProperty({ example: 'Pérez' })
  apellido!: string;

  @ApiProperty({ example: true })
  confirmado!: boolean;

  @ApiProperty({ example: '2026-10-01T10:00:00Z', required: false, type: Date })
  fechaConfirmacion!: Date | null;
}

export class AsistentesResponseDto {
  @ApiProperty({ example: 150 })
  totalEsperados!: number;

  @ApiProperty({ example: 120 })
  totalConfirmados!: number;

  @ApiProperty({
    example: [
      { nombre: 'Juan', apellido: 'Pérez', confirmado: true, fechaConfirmacion: '2026-10-01T10:00:00Z' }
    ]
  })
  invitados!: {
    nombre: string;
    apellido: string;
    confirmado: boolean;
    fechaConfirmacion: Date | null;
  }[];
}