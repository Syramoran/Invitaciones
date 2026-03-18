// ═══════════════════════════════════════════
// Módulo: Música
//
// La subida del MP3 es multipart/form-data.
// El archivo se recibe con @UploadedFile() en el controller.
// El invitacionId viene del path param: POST /invitaciones/:id/musica
// No se necesita DTO de request — la validación de MIME (audio/mpeg)
// y tamaño (max 20MB) se hace con un FileInterceptor/Pipe.
// Solo un archivo por invitación (reemplaza el existente).
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

/**
 * Response de POST /invitaciones/:id/musica (201).
 * También usado en GET /invitaciones/:id/musica.
 */
export class MusicaResponseDto {
  id!: number;
  invitacionId!: string;
  archivoUrl!: string;
  tamano!: number;
  mimeType!: string; // audio/mpeg
}