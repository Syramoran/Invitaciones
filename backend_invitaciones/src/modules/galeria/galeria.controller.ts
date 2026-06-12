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
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { GaleriaService } from './galeria.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiHeader } from '@nestjs/swagger';

// JwtAuthGuard se mantiene importado para el endpoint de stats

@ApiTags('Galería')
@Controller('invitaciones/:id/galeria')
export class GaleriaController {
  constructor(private readonly galeriaService: GaleriaService) {}

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/galeria — Listar fotos (público)
  // ═══════════════════════════════════════════

  // ═══════════════════════════════════════════

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar fotos de la galería (público)' })
  @ApiResponse({ status: 200, description: 'Lista de fotos' })
  async listar(@Param('id', ParseUUIDPipe) invitacionId: string) {
    return this.galeriaService.listar(invitacionId);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/galeria — Subir foto (público, sin auth en MVP)
  // ═══════════════════════════════════════════

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subir foto a la galería (público)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Foto subida correctamente' })
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
  // DELETE /invitaciones/:id/galeria/:fotoId — Eliminar foto (contraseña del evento)
  // Requiere header X-Event-Password
  // ═══════════════════════════════════════════

  @Delete(':fotoId')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar foto de la galería' })
  @ApiHeader({ name: 'x-event-password', description: 'Contraseña del evento (si está configurada)' })
  @ApiResponse({ status: 204, description: 'Foto eliminada' })
  async eliminar(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Param('fotoId', ParseIntPipe) fotoId: number,
    @Headers('x-event-password') password: string,
  ) {
    return this.galeriaService.eliminar(invitacionId, fotoId, password);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/galeria/download — Descargar ZIP (público)
  // ═══════════════════════════════════════════

   @Public()
  @Get('download')
  @ApiOperation({ summary: 'Descargar todas las fotos en un archivo ZIP (público)' })
  @ApiResponse({ status: 200, description: 'Archivo ZIP con las fotos' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estadísticas de almacenamiento de la galería (admin/cliente)' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  async obtenerStats(@Param('id', ParseUUIDPipe) invitacionId: string) {
    return this.galeriaService.obtenerStats(invitacionId);
  }
}