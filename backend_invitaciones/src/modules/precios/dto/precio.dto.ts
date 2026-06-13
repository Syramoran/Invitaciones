import { IsArray, IsBoolean, IsInt, IsOptional } from 'class-validator';

// ═══════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════

/**
 * POST /precios/calcular
 * Cálculo dinámico de precio en tiempo real (público, sin auth).
 * Usado por la landing page mientras el anfitrión selecciona servicios.
 * Debe responder en menos de 100ms.
 *
 * El precioBase es la suma de servicios con incluidoEnBase=true.
 * Servicios adicionales se suman al total.
 */
export class CalcularPrecioDto {
  @IsArray()
  @IsInt({ each: true })
  serviciosIds!: number[];

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
  id!: number;
  nombre!: string;
  precio!: number;
  incluidoEnBase!: boolean;
}

/**
 * Response de POST /precios/calcular (200).
 */
export class PrecioCalculadoResponseDto {
  precioBase!: number; // Suma de servicios con incluidoEnBase=true
  servicios!: DetalleServicioDto[]; // Desglose de cada servicio
  descuento!: number; // Monto del descuento (50% de segunda tarjeta, o 0)
  precioTotal!: number; // precioBase + servicios - descuento
}