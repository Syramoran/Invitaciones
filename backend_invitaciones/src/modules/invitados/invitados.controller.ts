import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { InvitadosService } from './invitados.service';
import {
  CargarInvitadosDto,
  ConfirmarAsistenciaDto,
  CrearInvitadoAsistenteDto,
  ActualizarInvitadoAsistenteDto,
  ActualizarSettingsDto,
} from './dto/invitado.dto';
import { Public } from '../auth/decorators/public.decorator';
import { EventPasswordGuard } from './guards/event-password.guard';
import { InvitacionOwnerOrAdminGuard } from './guards/invitacion-owner-or-admin.guard';

@Controller('invitaciones/:id')
export class InvitadosController {
  constructor(private readonly invitadosService: InvitadosService) {}

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/invitados — Carga masiva JSON (admin o dueño, JWT)
  // ═══════════════════════════════════════════

  @Post('invitados')
  @UseGuards(JwtAuthGuard, InvitacionOwnerOrAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async cargar(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Body() dto: CargarInvitadosDto,
  ) {
    return this.invitadosService.cargar(invitacionId, dto);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/invitados/importar — Carga masiva por archivo (admin o dueño, JWT)
  // multipart/form-data: campo "archivo" (.xlsx/.csv)
  // ═══════════════════════════════════════════

  @Post('invitados/importar')
  @UseGuards(JwtAuthGuard, InvitacionOwnerOrAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async importar(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    if (!archivo) {
      throw new BadRequestException('Debe adjuntar un archivo .xlsx o .csv.');
    }
    return this.invitadosService.importar(invitacionId, archivo);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/invitados — Listar invitados y estado (admin o dueño, JWT)
  // ═══════════════════════════════════════════

  @Get('invitados')
  @UseGuards(JwtAuthGuard, InvitacionOwnerOrAdminGuard)
  async listar(@Param('id', ParseUUIDPipe) invitacionId: string) {
    return this.invitadosService.listar(invitacionId);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/invitados/export — Exportar URLs CSV (admin, JWT)
  // ═══════════════════════════════════════════

  @Get('invitados/export')
  @UseGuards(JwtAuthGuard)
  async exportarCsv(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const csv = await this.invitadosService.exportarCsv(invitacionId);

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="invitados-${invitacionId.substring(0, 8)}.csv"`,
    });

    return csv;
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/confirmar — Confirmar asistencia (público)
  // ═══════════════════════════════════════════

  @Post('confirmar')
  @Public()
  @HttpCode(HttpStatus.OK)
  async confirmar(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Body() dto: ConfirmarAsistenciaDto,
  ) {
    return this.invitadosService.confirmar(invitacionId, dto);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/asistentes — Lista de asistentes (contraseña del evento)
  // Requiere header X-Event-Password
  // ═══════════════════════════════════════════

  @Get('asistentes')
  @Public()
  @UseGuards(EventPasswordGuard)
  async obtenerAsistentes(@Param('id', ParseUUIDPipe) invitacionId: string) {
    return this.invitadosService.obtenerAsistentes(invitacionId);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/asistentes/export — Único export XLSX del sistema
  // Requiere header X-Event-Password
  // ═══════════════════════════════════════════

  @Get('asistentes/export')
  @Public()
  @UseGuards(EventPasswordGuard)
  async exportarAsistentesXlsx(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.invitadosService.exportarXlsx(invitacionId);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="asistentes-${invitacionId.substring(0, 8)}.xlsx"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/asistentes/invitados — Alta manual (contraseña del evento)
  // ═══════════════════════════════════════════

  @Post('asistentes/invitados')
  @Public()
  @UseGuards(EventPasswordGuard)
  @HttpCode(HttpStatus.CREATED)
  async crearInvitadoAsistente(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Body() dto: CrearInvitadoAsistenteDto,
  ) {
    return this.invitadosService.crearIndividualAsistente(invitacionId, dto);
  }

  // ═══════════════════════════════════════════
  // PATCH /invitaciones/:id/asistentes/invitados/:invitadoId
  // ═══════════════════════════════════════════

  @Patch('asistentes/invitados/:invitadoId')
  @Public()
  @UseGuards(EventPasswordGuard)
  async actualizarInvitadoAsistente(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Param('invitadoId', ParseIntPipe) invitadoId: number,
    @Body() dto: ActualizarInvitadoAsistenteDto,
  ) {
    return this.invitadosService.actualizarIndividualAsistente(invitacionId, invitadoId, dto);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id/asistentes/invitados/:invitadoId
  // ═══════════════════════════════════════════

  @Delete('asistentes/invitados/:invitadoId')
  @Public()
  @UseGuards(EventPasswordGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarInvitadoAsistente(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Param('invitadoId', ParseIntPipe) invitadoId: number,
  ) {
    await this.invitadosService.eliminarIndividualAsistente(invitacionId, invitadoId);
  }

  // ═══════════════════════════════════════════
  // PATCH /invitaciones/:id/asistentes/settings
  // ═══════════════════════════════════════════

  @Patch('asistentes/settings')
  @Public()
  @UseGuards(EventPasswordGuard)
  async actualizarSettings(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Body() dto: ActualizarSettingsDto,
  ) {
    return this.invitadosService.actualizarSettings(invitacionId, dto);
  }
}