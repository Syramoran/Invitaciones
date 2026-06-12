import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Pedido ───────────────────────────────────────────────────────────────

/**
 * POST /client/pedidos
 * El cliente selecciona el tipo de evento, template y servicios.
 * Los datos de contacto se toman del usuario autenticado.
 */
export class CreatePedidoClienteDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de evento' })
  @IsInt()
  tipoEventoId!: number;

  @ApiProperty({ example: 2, description: 'ID del template a utilizar' })
  @IsInt()
  templateId!: number;

  @ApiPropertyOptional({ type: [Number], example: [1, 2, 3], description: 'IDs de servicios extra' })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  serviciosIds?: number[];

  /** Si quiere segunda tarjeta (descuento 50%) */
  @ApiPropertyOptional({ example: false, description: 'Si quiere segunda tarjeta (descuento 50%)' })
  @IsBoolean()
  @IsOptional()
  segundaTarjeta?: boolean;
}

// ─── Invitación ──────────────────────────────────────────────────────────

/**
 * POST /client/invitaciones
 * El cliente crea el borrador de su invitación con todos los datos del evento.
 * La invitación queda inactiva (activa=false) hasta que el pago sea confirmado.
 */
export class CreateInvitacionClienteDto {
  /** ID del pedido al que corresponde esta invitación */
  @ApiProperty({ example: 1, description: 'ID del pedido asociado' })
  @IsInt()
  pedidoId!: number;

  @ApiProperty({ example: 'Boda de Juan y Ana', description: 'Título de la invitación' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo!: string;

  @ApiProperty({ example: '2026-10-15', description: 'Fecha del evento' })
  @IsString()
  @IsNotEmpty()
  fechaEvento!: string; // 'YYYY-MM-DD'

  @ApiProperty({ example: '18:30', description: 'Hora del evento' })
  @IsString()
  @IsNotEmpty()
  horaEvento!: string; // 'HH:mm'

  @ApiProperty({ example: 'Salón Los Pinos', description: 'Nombre de la ubicación' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  ubicacion!: string;

  @ApiProperty({ example: 'Av. Libertador 123', description: 'Dirección física' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  direccion!: string;

  @ApiPropertyOptional({ example: -34.6037, description: 'Latitud de la ubicación' })
  @Type(() => Number)
  @IsOptional()
  latitud?: number;

  @ApiPropertyOptional({ example: -58.3816, description: 'Longitud de la ubicación' })
  @Type(() => Number)
  @IsOptional()
  longitud?: number;

  @ApiPropertyOptional({ example: '#ff0000', description: 'Color principal (Hex)' })
  @IsString()
  @IsOptional()
  @MaxLength(7)
  colorPrimario?: string;

  /** Contraseña que los invitados usan para la galería */
  @ApiPropertyOptional({ example: 'boda2026', description: 'Contraseña para la galería de fotos' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  contrasenaAsistentes?: string;

  @ApiPropertyOptional({ example: 50, description: 'Límite de fotos permitidas en la galería' })
  @IsInt()
  @IsOptional()
  maxFotos?: number;

  /** Campos personalizados según tipo de evento (JSONB) */
  @ApiPropertyOptional({ description: 'Datos extra configurables del evento' })
  @IsOptional()
  camposEspecificos?: Record<string, any>;
}

/**
 * PUT /client/invitaciones/:id
 * Actualizar datos del borrador antes de pagar.
 * Todos los campos son opcionales.
 */
export class UpdateInvitacionClienteDto {
  @ApiPropertyOptional({ example: 'Boda de Juan y Ana' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  titulo?: string;

  @ApiPropertyOptional({ example: '2026-10-15' })
  @IsString()
  @IsOptional()
  fechaEvento?: string;

  @ApiPropertyOptional({ example: '18:30' })
  @IsString()
  @IsOptional()
  horaEvento?: string;

  @ApiPropertyOptional({ example: 'Salón Los Pinos' })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  ubicacion?: string;

  @ApiPropertyOptional({ example: 'Av. Libertador 123' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  direccion?: string;

  @ApiPropertyOptional({ example: -34.6037 })
  @Type(() => Number)
  @IsOptional()
  latitud?: number;

  @ApiPropertyOptional({ example: -58.3816 })
  @Type(() => Number)
  @IsOptional()
  longitud?: number;

  @ApiPropertyOptional({ example: '#ff0000' })
  @IsString()
  @IsOptional()
  @MaxLength(7)
  colorPrimario?: string;

  @ApiPropertyOptional({ example: 'boda2026' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  contrasenaAsistentes?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsInt()
  @IsOptional()
  maxFotos?: number;

  @ApiPropertyOptional()
  @IsOptional()
  camposEspecificos?: Record<string, any>;
}
