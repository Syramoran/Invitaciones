import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEmail,
  IsEnum,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPedido } from '../../../entities/pedido.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * POST /pedidos
 * Crear pedido desde la landing page (público, sin auth).
 * El anfitrión selecciona tipo de evento, template y servicios,
 * completa sus datos de contacto y envía el pedido.
 */
export class CreatePedidoDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombreCliente!: string;

  @ApiProperty({ example: '+5491112345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  telefono!: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  tipoEventoId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  templateId!: number;

  @ApiPropertyOptional({ example: [1, 2] })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  serviciosIds?: number[];

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  segundaTarjeta?: boolean;
}

/**
 * PATCH /pedidos/:id/estado
 * Cambiar estado del pedido (admin, JWT).
 * Transiciones válidas: PENDIENTE → CONTACTADO → COMPLETADO | CANCELADO
 */
export class UpdateEstadoPedidoDto {
  @ApiProperty({ enum: EstadoPedido })
  @IsEnum(EstadoPedido, {
    message: 'Estado debe ser: CONTACTADO, COMPLETADO o CANCELADO',
  })
  estado!: EstadoPedido;
}

/**
 * GET /pedidos?page=1&limit=20&estado=PENDIENTE
 * Query params para listar pedidos con filtro y paginación (admin).
 */
export class PedidoQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: EstadoPedido })
  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

/**
 * Detalle de un servicio dentro del pedido.
 * Incluye el precio capturado al momento de la solicitud.
 */
export class PedidoServicioResponseDto {
  @ApiProperty({ example: 1 })
  servicioId!: number;

  @ApiProperty({ example: 'Confirmación de asistencia' })
  nombre!: string;

  @ApiProperty({ example: 1500.5 })
  precioAlMomento!: number;
}

/**
 * Response completo de un pedido (admin).
 * Usado en GET /pedidos, GET /pedidos/:id y POST /pedidos (201).
 */
export class PedidoResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Juan Pérez' })
  nombreCliente!: string;

  @ApiProperty({ example: '+5491112345678' })
  telefono!: string;

  @ApiProperty({ example: 'juan@example.com' })
  email!: string;

  @ApiProperty({ example: 1 })
  tipoEventoId!: number;

  @ApiProperty({ example: 'Boda' })
  tipoEventoNombre!: string;

  @ApiProperty({ example: 2 })
  templateId!: number;

  @ApiProperty({ example: 'Elegance' })
  templateNombre!: string;

  @ApiProperty({ example: 10000 })
  precioBase!: number;

  @ApiProperty({ example: 11500.5 })
  precioTotal!: number;

  @ApiProperty({ example: 'PENDIENTE' })
  estado!: string;

  @ApiProperty({ type: [PedidoServicioResponseDto] })
  servicios!: PedidoServicioResponseDto[];

  @ApiProperty({ example: '2026-10-01T10:00:00Z' })
  createdAt!: Date;
}

/**
 * GET /pedidos/:id/resumen
 * Resumen público que ve el anfitrión tras crear el pedido.
 * Incluye link a WhatsApp Business.
 */
export class PedidoResumenResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Juan Pérez' })
  nombreCliente!: string;

  @ApiProperty({ example: 'Boda' })
  tipoEvento!: string;

  @ApiProperty({ example: 'Elegance' })
  template!: string;

  @ApiProperty({ example: 10000 })
  precioBase!: number;

  @ApiProperty({ example: 11500.5 })
  precioTotal!: number;

  @ApiProperty({ example: [{ nombre: 'Asistencia', precio: 1500.5 }] })
  servicios!: { nombre: string; precio: number }[];

  @ApiProperty({ example: 'PENDIENTE' })
  estado!: string;

  @ApiProperty({ example: 'https://wa.me/...' })
  whatsappLink!: string;
}

/**
 * Response paginado para listado de pedidos (admin).
 */
export class PaginatedPedidosDto {
  data!: PedidoResponseDto[];
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}