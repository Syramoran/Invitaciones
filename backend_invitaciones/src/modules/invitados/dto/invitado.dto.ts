import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GrupoResponseDto } from '../../grupos/dto/grupo.dto';

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
 * Plus-one enviado al confirmar (sin campo de restricción propio — la nota
 * del titular en ConfirmarAsistenciaDto.restriccionAlimentaria lo cubre).
 */
export class PlusOneConfirmarDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del acompañante es obligatorio' })
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido del acompañante es obligatorio' })
  @MaxLength(100)
  apellido!: string;
}

/**
 * POST /invitaciones/:id/confirmar
 * Confirmar asistencia de un invitado (público).
 * Se recibe el slug tal como viene en el parámetro ?invitado de la URL.
 */
export class ConfirmarAsistenciaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  invitadoSlug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  restriccionAlimentaria?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlusOneConfirmarDto)
  plusOne?: PlusOneConfirmarDto;
}

/**
 * POST /invitaciones/:id/asistentes/invitados
 * Alta manual de un invitado individual/titular desde el panel de contraseña.
 */
export class CrearInvitadoAsistenteDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del invitado es obligatorio' })
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido del invitado es obligatorio' })
  @MaxLength(100)
  apellido!: string;

  @IsOptional()
  @IsBoolean()
  puedeAgregarPlusOne?: boolean;
}

/**
 * PATCH /invitaciones/:id/asistentes/invitados/:invitadoId
 */
export class ActualizarInvitadoAsistenteDto {
  @IsOptional()
  @IsBoolean()
  invitacionEnviada?: boolean;

  @IsOptional()
  @IsBoolean()
  puedeAgregarPlusOne?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  restriccionAlimentaria?: string;
}

/**
 * PATCH /invitaciones/:id/asistentes/settings
 * maxIntegrantesDefault: null = sin límite.
 */
export class ActualizarSettingsDto {
  @IsOptional()
  @IsBoolean()
  permitirPlusOne?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'maxIntegrantesDefault no puede ser 0' })
  maxIntegrantesDefault?: number | null;
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
 * Error de fila individual durante la importación por archivo.
 */
export class ErrorImportacionDto {
  fila!: number;
  motivo!: string;
}

/**
 * POST /invitaciones/:id/invitados/importar (201)
 * Response de importación desde archivo .xlsx/.csv (admin).
 */
export class ImportarInvitadosResponseDto {
  totalCreados!: number;
  totalGrupos!: number;
  duplicadosOmitidos!: number;
  errores!: ErrorImportacionDto[];
}

/**
 * Plus-one de un invitado individual/titular (anidado).
 */
export class PlusOneResponseDto {
  id!: number;
  nombre!: string;
  apellido!: string;
  confirmado!: boolean;
}

/**
 * Invitado individual/titular (grupoId e invitadoPrincipalId nulos),
 * con su plus-one anidado si existe.
 */
export class InvitadoIndividualResponseDto {
  id!: number;
  nombre!: string;
  apellido!: string;
  confirmado!: boolean;
  fechaConfirmacion!: Date | null;
  slug!: string | null;
  urlPersonalizada!: string;
  invitacionEnviada!: boolean;
  /** null = hereda el permitirPlusOne global de la invitación */
  puedeAgregarPlusOne!: boolean | null;
  restriccionAlimentaria!: string | null;
  plusOne!: PlusOneResponseDto | null;
}

/**
 * GET /invitaciones/:id/invitados (admin)
 * Listado extendido: individuales (+plusOne) y grupos (+integrantes).
 */
export class InvitadosListadoResponseDto {
  individuales!: InvitadoIndividualResponseDto[];
  grupos!: GrupoResponseDto[];
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
 * Panel de gestión completo (protegido por contraseña del evento):
 * individuales+plusOne, grupos+integrantes, settings globales y conteos
 * (confirmados y pendientes).
 */
export class AsistentesResponseDto {
  totalEsperados!: number;
  totalConfirmados!: number;
  permitirPlusOne!: boolean;
  maxIntegrantesDefault!: number | null;
  individuales!: InvitadoIndividualResponseDto[];
  grupos!: GrupoResponseDto[];
}

/**
 * PATCH /invitaciones/:id/asistentes/settings (200)
 */
export class SettingsResponseDto {
  permitirPlusOne!: boolean;
  maxIntegrantesDefault!: number | null;
}