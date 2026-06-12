import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  ParseIntPipe,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities';
import { ClientService } from './client.service';
import { CreateInvitacionClienteDto, UpdateInvitacionClienteDto } from './dto/client.dto';
import { HistoriasService } from '../historia/historia.service';
import { InvitacionesService } from '../invitaciones/invitaciones.service';
import { MusicaService } from '../musica/musica.service';
import { CreateHistoriaSeccionDto, UpdateHistoriaSeccionDto } from '../historia/dto/historia.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Client Invitaciones')
@ApiBearerAuth()
@Controller('client/invitaciones')
@Roles(UserRole.CLIENTE)
export class ClientInvitacionesController {
  constructor(
    private readonly clientService: ClientService,
    private readonly historiasService: HistoriasService,
    private readonly invitacionesService: InvitacionesService,
    private readonly musicaService: MusicaService,
  ) { }

  // ═══════════════════════════════════════════
  // POST /client/invitaciones — Crear borrador
  // ═══════════════════════════════════════════

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear borrador de invitación' })
  @ApiResponse({ status: 201, description: 'Invitación creada' })
  async crear(@Req() req: any, @Body() dto: CreateInvitacionClienteDto) {
    return this.clientService.crearInvitacion(req.user.id, dto);
  }

  // ═══════════════════════════════════════════
  // GET /client/invitaciones — Listar mis invitaciones
  // ═══════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: 'Listar mis invitaciones' })
  @ApiResponse({ status: 200, description: 'Lista de invitaciones del cliente' })
  async listar(@Req() req: any) {
    return this.clientService.listarInvitaciones(req.user.id);
  }

  // ═══════════════════════════════════════════
  // GET /client/invitaciones/:id — Ver mi invitación
  // ═══════════════════════════════════════════

  @Get(':id')
  @ApiOperation({ summary: 'Ver mi invitación' })
  @ApiResponse({ status: 200, description: 'Detalle de la invitación' })
  async obtener(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.clientService.obtenerInvitacion(id, req.user.id);
  }

  // ═══════════════════════════════════════════
  // PUT /client/invitaciones/:id — Actualizar datos
  // ═══════════════════════════════════════════

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos del borrador' })
  @ApiResponse({ status: 200, description: 'Invitación actualizada' })
  async actualizar(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvitacionClienteDto,
  ) {
    return this.clientService.actualizarInvitacion(id, req.user.id, dto);
  }

  // ═══════════════════════════════════════════
  // PATCH /client/invitaciones/:id/desactivar — Soft delete
  // Solo desactiva (activa = false). No elimina datos ni archivos.
  // ═══════════════════════════════════════════

  @Patch(':id/desactivar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar invitación (soft delete)' })
  @ApiResponse({ status: 204, description: 'Invitación desactivada' })
  async desactivar(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.clientService.desactivarInvitacion(id, req.user.id);
  }

  // ═══════════════════════════════════════════
  // Fotos del anfitrión — usan InvitacionesService con verificación de ownership
  // POST  /client/invitaciones/:id/fotos-anfitrion
  // DELETE /client/invitaciones/:id/fotos-anfitrion/:fotoId
  // ═══════════════════════════════════════════

  @Post(':id/fotos-anfitrion')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subir fotos del anfitrión' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Fotos subidas' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'fotos', maxCount: 5 }], {
      storage: memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  async subirFotoAnfitrion(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @UploadedFiles() archivos: { fotos?: Express.Multer.File[] },
  ) {
    // Verificar ownership
    await this.clientService.obtenerInvitacion(invitacionId, req.user.id);
    await this.invitacionesService.agregarFotosAnfitrion(invitacionId, archivos?.fotos ?? []);
    return { mensaje: 'Fotos agregadas correctamente' };
  }

  @Delete(':id/fotos-anfitrion/:fotoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarFotoAnfitrion(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Param('fotoId', ParseIntPipe) fotoId: number,
  ) {
    await this.clientService.obtenerInvitacion(invitacionId, req.user.id);
    return this.invitacionesService.eliminarFotoAnfitrion(invitacionId, fotoId);
  }

  // ═══════════════════════════════════════════
  // Historia — todos con verificación de ownership
  // ═══════════════════════════════════════════

  @Get(':id/historias')
  async listarHistorias(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.clientService.obtenerInvitacion(id, req.user.id);
    return this.historiasService.listar(id);
  }

  @Post(':id/historias')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagen', { storage: memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }),
  )
  async crearHistoria(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateHistoriaSeccionDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    await this.clientService.obtenerInvitacion(id, req.user.id);
    return this.historiasService.crear(id, dto, imagen);
  }

  @Put(':id/historias/:seccionId')
  @UseInterceptors(
    FileInterceptor('imagen', { storage: memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }),
  )
  async actualizarHistoria(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) invId: string,
    @Param('seccionId', ParseIntPipe) seccionId: number,
    @Body() dto: UpdateHistoriaSeccionDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    await this.clientService.obtenerInvitacion(invId, req.user.id);
    return this.historiasService.actualizar(invId, seccionId, dto, imagen);
  }

  @Delete(':id/historias/:seccionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarHistoria(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) invId: string,
    @Param('seccionId', ParseIntPipe) seccionId: number,
  ) {
    await this.clientService.obtenerInvitacion(invId, req.user.id);
    return this.historiasService.eliminar(invId, seccionId);
  }

  // ═══════════════════════════════════════════
  // Música
  // ═══════════════════════════════════════════

  @Get(':id/musica')
  async obtenerMusica(@Req() req: any, @Param('id', ParseUUIDPipe) invId: string) {
    await this.clientService.obtenerInvitacion(invId, req.user.id);
    return this.musicaService.obtener(invId);
  }

  @Post(':id/musica')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('archivo', { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }),
  )
  async subirMusica(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) invId: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    await this.clientService.obtenerInvitacion(invId, req.user.id);
    return this.musicaService.subir(invId, archivo);
  }

  @Delete(':id/musica')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarMusica(@Req() req: any, @Param('id', ParseUUIDPipe) invId: string) {
    await this.clientService.obtenerInvitacion(invId, req.user.id);
    return this.musicaService.eliminar(invId);
  }
}
