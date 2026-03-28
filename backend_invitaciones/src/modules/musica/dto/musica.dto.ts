// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

/**
 * GET /invitaciones/:id/musica
 * POST /invitaciones/:id/musica (201)
 * Datos del archivo MP3 asociado a la invitación.
 */
export class MusicaResponseDto {
  id!: number;
  invitacionId!: string;
  archivoUrl!: string;
  tamano!: number;
  tamanoMB!: string;
  mimeType!: string;
}