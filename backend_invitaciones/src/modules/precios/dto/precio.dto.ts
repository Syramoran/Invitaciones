import { IsArray, IsBoolean, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * POST /precios/calcular
 * Cálculo dinámico de precio en tiempo real (público, sin auth).
 * Usado por la landing page mientras el anfitrión selecciona servicios.
 * Debe responder en menos de 100ms.
 *
 * El precioBase es fijo ($30.000) — no depende del tipo de evento
 * ni del template. Solo los servicios opcionales suman al total.
 */
export class CalcularPrecioDto {
  @ApiProperty({ example: [1, 2], description: 'IDs de los servicios opcionales' })
  @IsArray()
  @IsInt({ each: true })
  serviciosIds!: number[];

  @ApiPropertyOptional({ example: false, description: 'Aplica 50% descuento en segunda tarjeta' })
  @IsBoolean()
  @IsOptional()
  segundaTarjeta?: boolean = false; // Aplica 50% descuento en segunda tarjeta
}

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

/**
 * Desglose individual de un servicio en el cálculo.
 */
export class DetalleServicioDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Confirmación de asistencia' })
  nombre!: string;

  @ApiProperty({ example: 1500.5 })
  precio!: number;

  @ApiProperty({ example: false })
  incluidoEnBase!: boolean;
}

/**
 * Response de POST /precios/calcular (200).
 */
export class PrecioCalculadoResponseDto {
  @ApiProperty({ example: 30000, description: 'Precio base fijo' })
  precioBase!: number; // Fijo: $30.000

  @ApiProperty({ type: [DetalleServicioDto], description: 'Desglose de cada servicio' })
  servicios!: DetalleServicioDto[]; // Desglose de cada servicio

  @ApiProperty({ example: 0, description: 'Monto del descuento' })
  descuento!: number; // Monto del descuento (50% de segunda tarjeta, o 0)

  @ApiProperty({ example: 31500.5, description: 'Precio final' })
  precioTotal!: number; // precioBase + servicios - descuento
}