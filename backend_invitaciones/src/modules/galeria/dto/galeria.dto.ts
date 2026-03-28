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

/**
 * Response de POST /invitaciones/:id/galeria (201).
 * También usado en GET /invitaciones/:id/galeria como item del array.
 */
export class FotoResponseDto {
  id!: number;
  invitacionId!: string;
  url!: string;
  tamano!: number;
  mimeType!: string; // Ej: image/jpeg, image/png, image/webp
  createdAt!: Date;
}

/**
 * GET /invitaciones/:id/galeria/stats (admin, JWT).
 * Estadísticas de almacenamiento de la galería.
 */
export class GaleriaStatsResponseDto {
  invitacionId!: string;
  totalFotos!: number;
  maxFotos!: number;
  tamanoTotalBytes!: number;
  tamanoTotalMB!: string;
  espacioUsadoPorcentaje!: number;
}