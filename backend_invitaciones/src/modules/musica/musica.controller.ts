import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { MusicaService } from './musica.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Música')
@Controller('invitaciones/:id/musica')
export class MusicaController {
  constructor(private readonly musicaService: MusicaService) {}

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/musica — Obtener datos de la música (público)
  // ═══════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: 'Obtener música de la invitación (público)' })
  @ApiResponse({ status: 200, description: 'Detalles de la música' })
  async obtener(@Param('id', ParseUUIDPipe) invitacionId: string) {
    return this.musicaService.obtener(invitacionId);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/musica — Subir MP3 (admin, JWT)
  // multipart/form-data: archivo (MP3, máx 20 MB)
  // Si ya existe música, reemplaza la anterior.
  // ═══════════════════════════════════════════

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subir archivo de música (admin/cliente)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Música subida exitosamente' })
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB — primera línea de defensa (Multer)
      },
    }),
  )
  async subir(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    return this.musicaService.subir(invitacionId, archivo);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id/musica — Eliminar música (admin, JWT)
  // ═══════════════════════════════════════════

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar música de la invitación (admin/cliente)' })
  @ApiResponse({ status: 204, description: 'Música eliminada' })
  async eliminar(@Param('id', ParseUUIDPipe) invitacionId: string) {
    return this.musicaService.eliminar(invitacionId);
  }
}