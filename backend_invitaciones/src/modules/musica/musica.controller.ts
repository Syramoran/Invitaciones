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

@Controller('invitaciones/:id/musica')
export class MusicaController {
  constructor(private readonly musicaService: MusicaService) {}

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/musica — Obtener datos de la música (público)
  // ═══════════════════════════════════════════

  @Get()
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
  async eliminar(@Param('id', ParseUUIDPipe) invitacionId: string) {
    return this.musicaService.eliminar(invitacionId);
  }
}