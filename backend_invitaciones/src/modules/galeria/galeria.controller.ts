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
  ParseIntPipe,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { GaleriaService } from './galeria.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('invitaciones/:id/galeria')
export class GaleriaController {
  constructor(private readonly galeriaService: GaleriaService) {}

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/galeria — Listar fotos (público)
  // ═══════════════════════════════════════════

 
  @Get()
  @Public()
  async listar(@Param('id', ParseUUIDPipe) invitacionId: string) {
    return this.galeriaService.listar(invitacionId);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/galeria — Subir foto (público, sin auth en MVP)
  // ═══════════════════════════════════════════

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
      limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB — primera línea de defensa (Multer)
      },
    }),
  )
  async subir(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @UploadedFile() foto: Express.Multer.File,
  ) {
    return this.galeriaService.subir(invitacionId, foto);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id/galeria/:fotoId — Eliminar foto (admin, JWT)
  // ═══════════════════════════════════════════

  @Delete(':fotoId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Param('fotoId', ParseIntPipe) fotoId: number,
  ) {
    return this.galeriaService.eliminar(invitacionId, fotoId);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/galeria/download — Descargar ZIP (público)
  // ═══════════════════════════════════════════

   @Public()
  @Get('download')
  async descargarZip(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, filename } =
      await this.galeriaService.descargarZip(invitacionId);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return stream;
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/galeria/stats — Stats almacenamiento (admin, JWT)
  // ═══════════════════════════════════════════

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async obtenerStats(@Param('id', ParseUUIDPipe) invitacionId: string) {
    return this.galeriaService.obtenerStats(invitacionId);
  }
}