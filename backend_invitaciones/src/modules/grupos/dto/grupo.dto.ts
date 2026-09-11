import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * Integrante de grupo (nombre y apellido siempre obligatorios).
 */
export class IntegranteGrupoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del integrante es obligatorio' })
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido del integrante es obligatorio' })
  @MaxLength(100)
  apellido!: string;
}

/**
 * POST /invitaciones/:id/asistentes/grupos
 */
export class CrearGrupoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del grupo es obligatorio' })
  @MaxLength(150)
  nombre!: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'maxIntegrantes no puede ser 0' })
  maxIntegrantes?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntegranteGrupoDto)
  integrantes?: IntegranteGrupoDto[];
}

/**
 * PATCH /invitaciones/:id/asistentes/grupos/:grupoId
 */
export class ActualizarGrupoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'maxIntegrantes no puede ser 0' })
  maxIntegrantes?: number;

  @IsOptional()
  @IsBoolean()
  invitacionEnviada?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  restriccionAlimentaria?: string;
}

/**
 * POST /invitaciones/:id/asistentes/grupos/:grupoId/integrantes
 */
export class AgregarIntegranteDto extends IntegranteGrupoDto {}

/**
 * POST /invitaciones/:id/grupos/confirmar (público, vía slug)
 * Confirma integrantes precargados por id y/o suma integrantes nuevos ya
 * confirmados. restriccionAlimentaria es un solo campo para todo el grupo.
 */
export class ConfirmarGrupoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  grupoSlug!: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  integrantesConfirmados?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntegranteGrupoDto)
  integrantesNuevos?: IntegranteGrupoDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  restriccionAlimentaria?: string;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

export class IntegranteResponseDto {
  id!: number;
  nombre!: string;
  apellido!: string;
  confirmado!: boolean;
}

export class GrupoResponseDto {
  id!: number;
  nombre!: string;
  slug!: string;
  maxIntegrantes!: number | null;
  restriccionAlimentaria!: string | null;
  invitacionEnviada!: boolean;
  integrantes!: IntegranteResponseDto[];
}

/**
 * POST /invitaciones/:id/grupos/confirmar (200)
 */
export class ConfirmacionGrupoResponseDto {
  mensaje!: string;
  grupo!: GrupoResponseDto;
}
