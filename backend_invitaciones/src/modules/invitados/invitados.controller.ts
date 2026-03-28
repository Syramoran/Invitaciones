import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { InvitadosService } from './invitados.service';
import { CargarInvitadosDto, ConfirmarAsistenciaDto } from './dto/invitado.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('invitaciones/:id')
export class InvitadosController {
  constructor(private readonly invitadosService: InvitadosService) {}

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/invitados — Carga masiva JSON (admin, JWT)
  // ═══════════════════════════════════════════

  @Post('invitados')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async cargar(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Body() dto: CargarInvitadosDto,
  ) {
    return this.invitadosService.cargar(invitacionId, dto);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/invitados — Listar invitados y estado (admin, JWT)
  // ═══════════════════════════════════════════

  @Get('invitados')
  @UseGuards(JwtAuthGuard)
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

  async obtenerAsistentes(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Headers('x-event-password') password: string,
  ) {
    return this.invitadosService.obtenerAsistentes(invitacionId, password);
  }
}