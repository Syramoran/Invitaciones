// ═══════════════════════════════════════════
// Módulo: Galería de Fotos
//
// La subida de fotos es multipart/form-data.
// El archivo se recibe con @UploadedFile() en el controller.
// El invitacionId viene del path param: POST /invitaciones/:id/galeria
// No se necesita DTO de request — la validación de MIME (image/*)
// y tamaño (max 15MB) se hace con un FileInterceptor/Pipe.
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════
import { ApiProperty } from '@nestjs/swagger';

/**
 * Response de POST /invitaciones/:id/galeria (201).
 * También usado en GET /invitaciones/:id/galeria como item del array.
 */
export class FotoResponseDto {
  @ApiProperty({ example: 1, description: 'ID de la foto' })
  id!: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID de la invitación' })
  invitacionId!: string;

  @ApiProperty({ example: 'https://storage.../foto.jpg', description: 'URL pública de la foto' })
  url!: string;

  @ApiProperty({ example: 1024000, description: 'Tamaño en bytes' })
  tamano!: number;

  @ApiProperty({ example: 'image/jpeg', description: 'Tipo MIME de la imagen' })
  mimeType!: string; // Ej: image/jpeg, image/png, image/webp

  @ApiProperty({ example: '2026-10-15T18:30:00Z', description: 'Fecha de subida' })
  createdAt!: Date;
}

/**
 * GET /invitaciones/:id/galeria/stats (admin, JWT).
 * Estadísticas de almacenamiento de la galería.
 */
export class GaleriaStatsResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  invitacionId!: string;

  @ApiProperty({ example: 25, description: 'Cantidad total de fotos subidas' })
  totalFotos!: number;

  @ApiProperty({ example: 100, description: 'Límite máximo de fotos permitidas' })
  maxFotos!: number;

  @ApiProperty({ example: 52428800, description: 'Tamaño total en bytes ocupado' })
  tamanoTotalBytes!: number;

  @ApiProperty({ example: '50.00', description: 'Tamaño total en MB ocupado' })
  tamanoTotalMB!: string;

  @ApiProperty({ example: 25.5, description: 'Porcentaje del límite máximo de fotos ocupado' })
  espacioUsadoPorcentaje!: number;
}