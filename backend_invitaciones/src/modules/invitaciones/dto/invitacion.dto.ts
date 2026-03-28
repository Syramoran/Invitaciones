import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsArray,
  IsBoolean,
  IsObject,
  IsDateString,
  IsMilitaryTime,
  Matches,
  MaxLength,
  Allow,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * POST /invitaciones
 * Crear invitación desde el panel admin (JWT).
 * Los archivos (fotos, música) se envían como multipart/form-data.
 */
export class CreateInvitacionDto {
  @IsInt()
  @Type(() => Number)
  pedidoId!: number;

  @IsInt()
  @Type(() => Number)
  templateId!: number;

  @IsInt()
  @Type(() => Number)
  tipoEventoId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo!: string;

  @IsDateString({}, { message: 'fechaEvento debe ser una fecha válida (YYYY-MM-DD)' })
  fechaEvento!: Date;

  @IsMilitaryTime({ message: 'horaEvento debe tener formato HH:mm' })
  horaEvento!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  ubicacion!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  direccion!: string;

  @IsNumber({ maxDecimalPlaces: 7 })
  @Type(() => Number)
  latitud!: number;

  @IsNumber({ maxDecimalPlaces: 7 })
  @Type(() => Number)
  longitud!: number;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'colorPrimario debe tener formato hex: #RRGGBB',
  })
  colorPrimario?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  contrasenaAsistentes?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  maxFotos?: number;

  @IsObject()
  @IsOptional()
  camposEspecificos?: Record<string, any>;

  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => {
    // form-data envía strings: "4" o ["4","5","6"]
    if (Array.isArray(value)) return value.map(Number);
    if (value === undefined || value === null) return [];
    return [Number(value)];
  })
  serviciosIds!: number[];

  // Campos de archivos — Multer los maneja via @UploadedFiles(),
  // pero form-data puede filtrar los nombres al body.
  // @Allow() evita que forbidNonWhitelisted los rechace.
  @Allow()
  fotos?: any;

  @Allow()
  musica?: any;
}

/**
 * PUT /invitaciones/:id
 * Actualizar invitación (admin, JWT). Todos los campos opcionales.
 */
export class UpdateInvitacionDto extends PartialType(CreateInvitacionDto) {
  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}

/**
 * GET /invitaciones?page=1&limit=20&activa=true&tipoEventoId=1
 * Query params para listar invitaciones con filtro y paginación (admin).
 */
export class InvitacionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activa?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoEventoId?: number;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

/**
 * Response completo de una invitación (admin).
 * Usado en GET /invitaciones, GET /invitaciones/:id, POST /invitaciones, PUT /invitaciones/:id.
 */
export class InvitacionResponseDto {
  id!: string;
  pedidoId!: number;
  templateId!: number;
  templateNombre!: string;
  tipoEventoId!: number;
  tipoEventoNombre!: string;
  titulo!: string;
  fechaEvento!: Date;
  horaEvento!: string;
  ubicacion!: string;
  direccion!: string;
  latitud!: number;
  longitud!: number;
  colorPrimario!: string | null;
  contrasenaAsistentes!: string | null;
  maxFotos!: number;
  camposEspecificos!: Record<string, any> | null;
  activa!: boolean;
  fechaExpiracion!: Date;
  servicios!: { servicioId: number; nombre: string; habilitado: boolean }[];
  createdAt!: Date;
}

/**
 * GET /invitaciones/:id/public
 * Vista pública que renderiza la invitación para el invitado.
 */
export class InvitacionPublicDto {
  id!: string;
  titulo!: string;
  fechaEvento!: Date;
  horaEvento!: string;
  ubicacion!: string;
  direccion!: string;
  latitud!: number;
  longitud!: number;
  colorPrimario!: string | null;
  camposEspecificos!: Record<string, any> | null;

  template!: {
    id: number;
    nombre: string;
    slug: string;
    thumbnailUrl: string | null;
  };

  servicios!: { id: number; nombre: string }[];

  fotosAnfitrion!: {
    id: number;
    url: string;
    orden: number;
  }[];

  musica!: {
    id: number;
    archivoUrl: string;
  } | null;

  historias!: {
    id: number;
    texto: string;
    imagenUrl: string | null;
    orden: number;
  }[];

  saludoPersonalizado!: string | null;
  tieneConfirmacion!: boolean;
  mostrarBotonConfirmar!: boolean;
}

/**
 * GET /invitaciones/:id/countdown
 * Datos de cuenta regresiva para el frontend.
 */
export class CountdownResponseDto {
  titulo!: string;
  fechaEvento!: Date;
  horaEvento!: string;
  fechaHoraEventoISO!: string;  // "2026-08-15T20:00:00-03:00"
  eventoFinalizado!: boolean;
}

/**
 * Response paginado para listado de invitaciones (admin).
 */
export class PaginatedInvitacionesDto {
  data!: InvitacionResponseDto[];
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}