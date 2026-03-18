import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateDto {
  @IsInt()
  tipoEventoId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;


  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'El slug solo admite letras minúsculas, números y guiones (ej: boda-clasica)',
  })
  slug!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}


export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'El slug solo admite letras minúsculas, números y guiones',
  })
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

/**
 * Query params para filtrar templates.
 * GET /templates?tipoEventoId=1&activo=true
 */
export class TemplateQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoEventoId?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

/**
 * Response completo (admin).
 */
export class TemplateResponseDto {
  id!: number;
  tipoEventoId!: number;
  nombre!: string;
  slug!: string;
  thumbnailUrl!: string | null;
  descripcion!: string | null;
  activo!: boolean;
}

/**
 * Response público (landing page / invitación).
 * Solo lo que necesita el frontend para mostrar
 * el catálogo y resolver el componente.
 */
export class TemplatePublicDto {
  id!: number;
  nombre!: string;
  slug!: string;
  thumbnailUrl!: string | null;
  descripcion!: string | null;
}