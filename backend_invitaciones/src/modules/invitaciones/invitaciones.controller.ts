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

import { InvitacionesService } from './invitaciones.service';
import { InvitacionesPublicService } from './invitaciones-public.service';
import {
  CreateInvitacionDto,
  UpdateInvitacionDto,
  InvitacionQueryDto,
} from './dto/invitacion.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Invitaciones')
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
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear invitación (admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Invitación creada' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar invitaciones (admin)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de invitaciones' })
  async listar(@Query() query: InvitacionQueryDto) {
    return this.invitacionesService.listar(query);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id — Obtener invitación completa (admin, JWT)
  // ═══════════════════════════════════════════

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener invitación por ID (admin)' })
  @ApiResponse({ status: 200, description: 'Detalle de la invitación' })
  async obtenerPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.invitacionesService.obtenerPorId(id);
  }

  // ═══════════════════════════════════════════
  // PUT /invitaciones/:id — Actualizar invitación (admin, JWT)
  // ═══════════════════════════════════════════

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar invitación (admin)' })
  @ApiResponse({ status: 200, description: 'Invitación actualizada' })
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar invitación (admin)' })
  @ApiResponse({ status: 204, description: 'Invitación eliminada' })
  async eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.invitacionesService.eliminar(id);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/fotos-anfitrion — Agregar fotos del anfitrión (admin, JWT)
  // ═══════════════════════════════════════════

  @Post(':id/fotos-anfitrion')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar fotos del anfitrión (admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Fotos agregadas correctamente' })
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar foto del anfitrión (admin)' })
  @ApiResponse({ status: 204, description: 'Foto eliminada' })
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
  @ApiOperation({ summary: 'Vista pública de la invitación para el invitado (público)' })
  @ApiResponse({ status: 200, description: 'Datos completos de la invitación' })
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
  @ApiOperation({ summary: 'Obtener datos de cuenta regresiva (público)' })
  @ApiResponse({ status: 200, description: 'Datos de la cuenta regresiva devueltos' })
  async obtenerCountdown(@Param('id', ParseUUIDPipe) id: string) {
    return this.invitacionesPublicService.obtenerCountdown(id);
  }
}