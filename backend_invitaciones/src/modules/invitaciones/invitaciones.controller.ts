import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RequireAdmin } from '../auth/decorators/require-admin.decorator';

import { InvitacionesService } from './invitaciones.service';
import { InvitacionesPublicService } from './invitaciones-public.service';
import {
  CreateInvitacionDto,
  UpdateInvitacionDto,
  InvitacionQueryDto,
} from './dto/invitacion.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('invitaciones')
export class InvitacionesController {
  constructor(
    private readonly invitacionesService: InvitacionesService,
    private readonly invitacionesPublicService: InvitacionesPublicService,
  ) {}

  // ═══════════════════════════════════════════
  // POST /invitaciones — Crear invitación (admin, JWT)
  // multipart/form-data: campos del DTO + fotos[] + musica
  // ═══════════════════════════════════════════

  @Post()
  @UseGuards(JwtAuthGuard)
  @RequireAdmin()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'fotos', maxCount: 5 },
        { name: 'musica', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB (el MP3 es el más grande)
      },
    ),
  )
  async crear(
    @Body() dto: CreateInvitacionDto,
    @UploadedFiles()
    archivos: {
      fotos?: Express.Multer.File[];
      musica?: Express.Multer.File[];
    },
  ) {
    return this.invitacionesService.crear(
      dto,
      archivos?.fotos,
      archivos?.musica?.[0],
    );
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones — Listar invitaciones (admin, JWT)
  // ═══════════════════════════════════════════

  @Get()
  @UseGuards(JwtAuthGuard)
  @RequireAdmin()
  async listar(@Query() query: InvitacionQueryDto) {
    return this.invitacionesService.listar(query);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id — Obtener invitación completa (admin, JWT)
  // ═══════════════════════════════════════════

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @RequireAdmin()
  async obtenerPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.invitacionesService.obtenerPorId(id);
  }

  // ═══════════════════════════════════════════
  // PUT /invitaciones/:id — Actualizar invitación (admin, JWT)
  // ═══════════════════════════════════════════

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @RequireAdmin()
  async actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvitacionDto,
  ) {
    return this.invitacionesService.actualizar(id, dto);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id — Eliminar invitación (admin, JWT)
  // ═══════════════════════════════════════════

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequireAdmin()
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.invitacionesService.eliminar(id);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/fotos-anfitrion — Agregar fotos del anfitrión (admin, JWT)
  // ═══════════════════════════════════════════

  @Post(':id/fotos-anfitrion')
  @UseGuards(JwtAuthGuard)
  @RequireAdmin()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'fotos', maxCount: 5 }],
      {
        storage: memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 },
      },
    ),
  )
  async agregarFotosAnfitrion(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() archivos: { fotos?: Express.Multer.File[] },
  ) {
    await this.invitacionesService.agregarFotosAnfitrion(id, archivos?.fotos ?? []);
    return { mensaje: 'Fotos agregadas correctamente' };
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id/fotos-anfitrion/:fotoId — Eliminar foto (admin, JWT)
  // ═══════════════════════════════════════════

  @Delete(':id/fotos-anfitrion/:fotoId')
  @UseGuards(JwtAuthGuard)
  @RequireAdmin()
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarFotoAnfitrion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fotoId', ParseIntPipe) fotoId: number,
  ) {
    return this.invitacionesService.eliminarFotoAnfitrion(id, fotoId);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/public — Vista pública del invitado (sin auth)
  // Query: ?invitado=nombre-apellido
  // ═══════════════════════════════════════════
  @Public()
  @Get(':id/public')
  async obtenerPublica(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('invitado') invitado?: string,
  ) {
    return this.invitacionesPublicService.obtenerPublica(id, invitado);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/countdown — Cuenta regresiva (sin auth)
  // ═══════════════════════════════════════════

  @Public()
  @Get(':id/countdown')
  async obtenerCountdown(@Param('id', ParseUUIDPipe) id: string) {
    return this.invitacionesPublicService.obtenerCountdown(id);
  }
}