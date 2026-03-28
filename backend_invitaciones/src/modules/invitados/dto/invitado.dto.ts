import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * Invitado individual dentro del array de carga masiva.
 */
export class InvitadoItemDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del invitado es obligatorio' })
  @MaxLength(100)
  nombre!: string;

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
  @IsArray()
  @ArrayMinSize(1, { message: 'La lista de invitados no puede estar vacía' })
  @ValidateNested({ each: true })
  @Type(() => InvitadoItemDto)
  invitados!: InvitadoItemDto[];
}

/**
 * POST /invitaciones/:id/confirmar
 * Confirmar asistencia de un invitado (público).
 */
export class ConfirmarAsistenciaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido!: string;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

/**
 * URL personalizada generada para un invitado.
 */
export class UrlInvitadoDto {
  nombre!: string;
  apellido!: string;
  url!: string;
}

/**
 * POST /invitaciones/:id/invitados (201)
 * Response de carga masiva.
 */
export class CargarInvitadosResponseDto {
  totalInvitados!: number;
  urlsGeneradas!: UrlInvitadoDto[];
}

/**
 * GET /invitaciones/:id/invitados
 * Invitado con su estado de confirmación (admin).
 */
export class InvitadoResponseDto {
  id!: number;
  nombre!: string;
  apellido!: string;
  confirmado!: boolean;
  fechaConfirmacion!: Date | null;
  urlPersonalizada!: string;
}

/**
 * POST /invitaciones/:id/confirmar (200)
 * Response de confirmación de asistencia.
 */
export class ConfirmacionResponseDto {
  mensaje!: string;
  nombre!: string;
  apellido!: string;
  confirmado!: boolean;
  fechaConfirmacion!: Date | null;
}

/**
 * GET /invitaciones/:id/asistentes
 * Lista de asistentes con conteos (protegido por contraseña).
 */
export class AsistentesResponseDto {
  totalEsperados!: number;
  totalConfirmados!: number;
  invitados!: {
    nombre: string;
    apellido: string;
    confirmado: boolean;
    fechaConfirmacion: Date | null;
  }[];
}