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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  tipoEventoId!: number;

  @ApiProperty({ example: 'Boda Clásica' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiProperty({ example: 'boda-clasica' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'El slug solo admite letras minúsculas, números y guiones (ej: boda-clasica)',
  })
  slug!: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'Descripción del template' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}


export class UpdateTemplateDto {
  @ApiPropertyOptional({ example: 'Boda Clásica' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({ example: 'boda-clasica' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'El slug solo admite letras minúsculas, números y guiones',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'Descripción del template' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}

/**
 * Query params para filtrar templates.
 * GET /templates?tipoEventoId=1&activo=true
 */
export class TemplateQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoEventoId?: number;

  @ApiPropertyOptional({ example: true })
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
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  tipoEventoId!: number;

  @ApiProperty({ example: 'Boda Clásica' })
  nombre!: string;

  @ApiProperty({ example: 'boda-clasica' })
  slug!: string;

  @ApiProperty({ example: 'https://...' })
  thumbnailUrl!: string | null;

  @ApiProperty({ example: 'Descripción del template' })
  descripcion!: string | null;

  @ApiProperty({ example: true })
  activo!: boolean;
}

/**
 * Response público (landing page / invitación).
 * Solo lo que necesita el frontend para mostrar
 * el catálogo y resolver el componente.
 */
export class TemplatePublicDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Boda Clásica' })
  nombre!: string;

  @ApiProperty({ example: 'boda-clasica' })
  slug!: string;

  @ApiProperty({ example: 'https://...' })
  thumbnailUrl!: string | null;

  @ApiProperty({ example: 'Descripción del template' })
  descripcion!: string | null;
}