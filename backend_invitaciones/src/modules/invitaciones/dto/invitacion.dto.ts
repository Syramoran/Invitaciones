import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsDateString,
  IsMilitaryTime,
  MaxLength,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * POST /invitaciones
 * Crear invitación desde el panel admin (JWT, multipart/form-data).
 *
 * Los archivos (fotos y música) no van en el DTO — se procesan
 * en el controller con @UploadedFiles() y @UseInterceptors(FileFieldsInterceptor).
 * Los campos de texto viajan como form fields dentro del multipart.
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

  @IsDateString()
  fechaEvento!: string; // YYYY-MM-DD

  @IsMilitaryTime()
  horaEvento!: string; // HH:mm

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
    message: 'colorPrimario debe ser formato hex: #RRGGBB',
  })
  colorPrimario?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  contrasenaAsistentes?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  maxFotos?: number;

  @IsObject()
  @IsOptional()
  camposEspecificos?: Record<string, any>;

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  serviciosIds!: number[];
}

/**
 * PUT /invitaciones/:id
 * Actualizar invitación (admin, JWT).
 * Todos los campos son opcionales.
 */
export class UpdateInvitacionDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  templateId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  titulo?: string;

  @IsDateString()
  @IsOptional()
  fechaEvento?: string;

  @IsMilitaryTime()
  @IsOptional()
  horaEvento?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  ubicacion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  direccion?: string;

  @IsNumber({ maxDecimalPlaces: 7 })
  @IsOptional()
  @Type(() => Number)
  latitud?: number;

  @IsNumber({ maxDecimalPlaces: 7 })
  @IsOptional()
  @Type(() => Number)
  longitud?: number;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'colorPrimario debe ser formato hex: #RRGGBB',
  })
  colorPrimario?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  contrasenaAsistentes?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  maxFotos?: number;

  @IsObject()
  @IsOptional()
  camposEspecificos?: Record<string, any>;

  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  @Type(() => Number)
  serviciosIds?: number[];

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}

/**
 * GET /invitaciones?page=1&limit=20&activa=true
 * Query params para listar invitaciones con paginación (admin).
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
 * GET /invitaciones/:id — Response completo (admin).
 * Incluye todos los datos, servicios habilitados, fotos y música.
 */
export class InvitacionResponseDto {
  id!: string; // UUID
  pedidoId!: number;
  templateId!: number;
  templateNombre!: string;
  templateSlug!: string;
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
  createdAt!: Date;
  fechaExpiracion!: Date;
  urlPublica!: string; // Ej: https://invitaciones.com/{id}

  servicios!: {
    id: number;
    nombre: string;
    habilitado: boolean;
  }[];

  fotosAnfitrion!: {
    id: number;
    url: string;
    orden: number;
    tamano: number;
  }[];

  musica!: {
    id: number;
    archivoUrl: string;
    tamano: number;
    mimeType: string;
  } | null;

  historias!: {
    id: number;
    texto: string;
    imagenUrl: string | null;
    orden: number;
  }[];

  totalInvitados!: number;
  totalConfirmados!: number;
  totalFotos!: number;
}

/**
 * GET /invitaciones/:id/public — Response público (invitado, sin auth).
 *
 * Es lo que recibe el frontend cuando alguien abre la URL de la invitación.
 * El frontend usa template.slug para resolver el componente React.
 * Si la URL tiene ?invitado=nombre-apellido, se muestra saludo personalizado
 * y el botón de confirmar asistencia.
 */
export class InvitacionPublicaDto {
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
  };

  tipoEvento!: {
    id: number;
    nombre: string;
  };

  servicios!: {
    id: number;
    nombre: string;
  }[];

  fotosAnfitrion!: {
    id: number;
    url: string;
    orden: number;
  }[];

  musica!: {
    archivoUrl: string;
    mimeType: string;
  } | null;

  historias!: {
    id: number;
    texto: string;
    imagenUrl: string | null;
    orden: number;
  }[];

  // Personalización según query param ?invitado=
  saludoPersonalizado!: string | null;
  tieneConfirmacion!: boolean;    // si el servicio de confirmación está habilitado
  mostrarBotonConfirmar!: boolean; // true solo si ?invitado= está presente
  tieneGaleria!: boolean;          // si el servicio de galería está habilitado
  tieneCuentaRegresiva!: boolean;  // si el servicio de countdown está habilitado
  tieneMusica!: boolean;           // si el servicio de música está habilitado
}

/**
 * GET /invitaciones/:id/countdown — Datos de cuenta regresiva (público).
 */
export class CountdownResponseDto {
  fechaEvento!: Date;
  horaEvento!: string;
  diasRestantes!: number;
  horasRestantes!: number;
  minutosRestantes!: number;
  segundosRestantes!: number;
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