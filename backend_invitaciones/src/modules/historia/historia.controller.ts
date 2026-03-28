import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { HistoriasService } from './historia.service';
import { CreateHistoriaSeccionDto, UpdateHistoriaSeccionDto } from './dto/historia.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('invitaciones/:id/historias')
export class HistoriasController {
  constructor(private readonly historiasService: HistoriasService) {}

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/historias — Listar secciones (público)
  // ═══════════════════════════════════════════

  @Public()
  @Get()
  async listar(@Param('id', ParseUUIDPipe) invitacionId: string) {
    return this.historiasService.listar(invitacionId);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/historias — Crear sección (admin, JWT)
  // multipart/form-data: texto + orden + imagen (opcional)
  // ═══════════════════════════════════════════

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB
      },
    }),
  )
  async crear(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Body() dto: CreateHistoriaSeccionDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.historiasService.crear(invitacionId, dto, imagen);
  }

  // ═══════════════════════════════════════════
  // PUT /invitaciones/:id/historias/:seccionId — Actualizar sección (admin, JWT)
  // multipart/form-data: texto? + orden? + imagen? (todos opcionales)
  // ═══════════════════════════════════════════

  @Put(':seccionId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: {
        fileSize: 15 * 1024 * 1024,
      },
    }),
  )
  async actualizar(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Param('seccionId', ParseIntPipe) seccionId: number,
    @Body() dto: UpdateHistoriaSeccionDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.historiasService.actualizar(invitacionId, seccionId, dto, imagen);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id/historias/:seccionId — Eliminar sección (admin, JWT)
  // ═══════════════════════════════════════════

  @Delete(':seccionId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Param('seccionId', ParseIntPipe) seccionId: number,
  ) {
    return this.historiasService.eliminar(invitacionId, seccionId);
  }
}