import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEmail,
  IsEnum,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPedido } from '../../../entities/pedido.entity';

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
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombreCliente!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  telefono!: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsInt()
  tipoEventoId!: number;

  @IsInt()
  templateId!: number;

  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  serviciosIds?: number[];
}

/**
 * PATCH /pedidos/:id/estado
 * Cambiar estado del pedido (admin, JWT).
 * Transiciones válidas: PENDIENTE → CONTACTADO → COMPLETADO | CANCELADO
 */
export class UpdateEstadoPedidoDto {
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
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;

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
  servicioId!: number;
  nombre!: string;
  precioAlMomento!: number;
}

/**
 * Response completo de un pedido (admin).
 * Usado en GET /pedidos, GET /pedidos/:id y POST /pedidos (201).
 */
export class PedidoResponseDto {
  id!: number;
  nombreCliente!: string;
  telefono!: string;
  email!: string;
  tipoEventoId!: number;
  tipoEventoNombre!: string;
  templateId!: number;
  templateNombre!: string;
  precioBase!: number;
  precioTotal!: number;
  estado!: string;
  servicios!: PedidoServicioResponseDto[];
  createdAt!: Date;
}

/**
 * GET /pedidos/:id/resumen
 * Resumen público que ve el anfitrión tras crear el pedido.
 * Incluye link a WhatsApp Business.
 */
export class PedidoResumenResponseDto {
  id!: number;
  nombreCliente!: string;
  tipoEvento!: string;
  template!: string;
  precioBase!: number;
  precioTotal!: number;
  servicios!: { nombre: string; precio: number }[];
  estado!: string;
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