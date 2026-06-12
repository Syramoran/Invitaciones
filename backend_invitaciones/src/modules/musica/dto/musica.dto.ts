// ═══════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════

import { ApiProperty } from '@nestjs/swagger';

/**
 * GET /invitaciones/:id/musica
 * POST /invitaciones/:id/musica (201)
 * Datos del archivo MP3 asociado a la invitación.
 */
export class MusicaResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  invitacionId!: string;

  @ApiProperty({ example: 'https://storage.../musica.mp3' })
  archivoUrl!: string;

  @ApiProperty({ example: 4096000 })
  tamano!: number;

  @ApiProperty({ example: '3.91' })
  tamanoMB!: string;

  @ApiProperty({ example: 'audio/mpeg' })
  mimeType!: string;
}