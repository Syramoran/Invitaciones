import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * Item individual dentro de la carga masiva.
 */
export class InvitadoItemDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  nombre!: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(100)
  apellido!: string;
}

/**
 * POST /invitaciones/:id/invitados
 * Carga masiva de invitados desde JSON (admin, JWT).
 * El invitacionId viene del path param, no del body.
 */
export class CreateInvitadosDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'La lista de invitados no puede estar vacía' })
  @ValidateNested({ each: true })
  @Type(() => InvitadoItemDto)
  invitados!: InvitadoItemDto[];
}

/**
 * POST /invitaciones/:id/confirmar
 * Confirmación de asistencia (público, sin auth).
 * El invitado se identifica por nombre+apellido que vienen
 * del parámetro ?invitado=nombre-apellido de la URL.
 * Solo la primera confirmación se registra (idempotente).
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
 * URL personalizada generada para cada invitado.
 */
export class UrlInvitadoDto {
  nombre!: string;
  apellido!: string;
  url!: string; // Ej: https://invitaciones.com/{uuid}?invitado=juan-perez
}

/**
 * Response de POST /invitaciones/:id/invitados (201).
 */
export class InvitadosCargadosResponseDto {
  totalInvitados!: number;
  urlsGeneradas!: UrlInvitadoDto[];
  csvDownloadUrl!: string;
}

/**
 * Response de POST /invitaciones/:id/confirmar (200).
 */
export class ConfirmacionResponseDto {
  mensaje!: string;
  invitado!: {
    nombre: string;
    apellido: string;
    confirmado: boolean;
    fechaConfirmacion: Date;
  };
}

/**
 * Item individual en la lista de asistentes.
 */
export class InvitadoEstadoDto {
  id!: number;
  nombre!: string;
  apellido!: string;
  confirmado!: boolean;
  fechaConfirmacion!: Date | null;
}

/**
 * GET /invitaciones/:id/asistentes
 * Lista de asistentes con stats (requiere contraseña del evento).
 */
export class AsistentesResponseDto {
  totalEsperados!: number;
  totalConfirmados!: number;
  invitados!: InvitadoEstadoDto[];
}