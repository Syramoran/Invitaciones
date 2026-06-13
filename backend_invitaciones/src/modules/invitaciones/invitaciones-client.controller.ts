import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { InvitacionesService } from './invitaciones.service';
import {
  CreateInvitacionDto,
  UpdateInvitacionDto,
} from './dto/invitacion.dto';

@Controller('client/invitaciones')
@UseGuards(JwtAuthGuard)
export class InvitacionesClientController {
  constructor(private readonly invitacionesService: InvitacionesService) {}

  // ═══════════════════════════════════════════
  // GET /client/invitaciones — Listar invitaciones del usuario (JWT)
  // ═══════════════════════════════════════════

  @Get()
  async listarMias(@Req() req: Request) {
    const usuario = req.user as AuthenticatedUser;
    return this.invitacionesService.listarPorUsuario(usuario.id);
  }

  // ═══════════════════════════════════════════
  // GET /client/invitaciones/:id — Obtener invitación (JWT)
  // ═══════════════════════════════════════════

  @Get(':id')
  async obtenerPorId(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const usuario = req.user as AuthenticatedUser;
    await this.invitacionesService.verificarPropiedad(id, usuario.id);
    return this.invitacionesService.obtenerPorId(id);
  }

  // ═══════════════════════════════════════════
  // POST /client/invitaciones — Crear invitación (JWT)
  // multipart/form-data: campos del DTO + fotos[] + musica
  // ═══════════════════════════════════════════

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'fotos', maxCount: 5 },
        { name: 'musica', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 },
      },
    ),
  )
  async crear(
    @Body() dto: CreateInvitacionDto,
    @Req() req: Request,
    @UploadedFiles()
    archivos: {
      fotos?: Express.Multer.File[];
      musica?: Express.Multer.File[];
    },
  ) {
    const usuario = req.user as AuthenticatedUser;
    return this.invitacionesService.crear(
      dto,
      archivos?.fotos,
      archivos?.musica?.[0],
      usuario.id,
    );
  }

  // ═══════════════════════════════════════════
  // PUT /client/invitaciones/:id — Actualizar invitación (JWT)
  // ═══════════════════════════════════════════

  @Put(':id')
  async actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvitacionDto,
    @Req() req: Request,
  ) {
    const usuario = req.user as AuthenticatedUser;
    await this.invitacionesService.verificarPropiedad(id, usuario.id);
    return this.invitacionesService.actualizar(id, dto);
  }

  // ═══════════════════════════════════════════
  // DELETE /client/invitaciones/:id — Eliminar invitación propia (JWT)
  // ═══════════════════════════════════════════

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const usuario = req.user as AuthenticatedUser;
    await this.invitacionesService.verificarPropiedad(id, usuario.id);
    await this.invitacionesService.eliminar(id);
  }

  // ═══════════════════════════════════════════
  // POST /client/invitaciones/:id/fotos-anfitrion — Agregar fotos (JWT + ownership)
  // ═══════════════════════════════════════════

  @Post(':id/fotos-anfitrion')
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
    @Req() req: Request,
    @UploadedFiles() archivos: { fotos?: Express.Multer.File[] },
  ) {
    const usuario = req.user as AuthenticatedUser;
    await this.invitacionesService.verificarPropiedad(id, usuario.id);
    await this.invitacionesService.agregarFotosAnfitrion(id, archivos?.fotos ?? []);
    return { mensaje: 'Fotos agregadas correctamente' };
  }

  // ═══════════════════════════════════════════
  // DELETE /client/invitaciones/:id/fotos-anfitrion/:fotoId — Eliminar foto (JWT + ownership)
  // ═══════════════════════════════════════════

  @Delete(':id/fotos-anfitrion/:fotoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarFotoAnfitrion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fotoId', ParseIntPipe) fotoId: number,
    @Req() req: Request,
  ) {
    const usuario = req.user as AuthenticatedUser;
    await this.invitacionesService.verificarPropiedad(id, usuario.id);
    await this.invitacionesService.eliminarFotoAnfitrion(id, fotoId);
  }
}
