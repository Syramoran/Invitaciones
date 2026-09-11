import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { EventPasswordGuard } from '../invitados/guards/event-password.guard';
import { GruposService } from './grupos.service';
import {
  CrearGrupoDto,
  ActualizarGrupoDto,
  AgregarIntegranteDto,
  ConfirmarGrupoDto,
} from './dto/grupo.dto';

// ═══════════════════════════════════════════
// /invitaciones/:id/asistentes/grupos — Gestión de grupos (contraseña del evento)
// /invitaciones/:id/grupos/confirmar — Confirmación pública (sin auth, vía slug)
// @Public() a nivel clase: todas las rutas acá saltean el JwtAuthGuard global,
// pero cada método admin lleva además EventPasswordGuard puntual (no se puede
// aplicar a nivel clase porque la ruta de confirmar es pública sin contraseña).
// ═══════════════════════════════════════════

@Controller('invitaciones/:id')
@Public()
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Post('asistentes/grupos')
  @UseGuards(EventPasswordGuard)
  @HttpCode(HttpStatus.CREATED)
  async crear(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Body() dto: CrearGrupoDto,
  ) {
    return this.gruposService.crear(invitacionId, dto);
  }

  @Patch('asistentes/grupos/:grupoId')
  @UseGuards(EventPasswordGuard)
  async actualizar(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Body() dto: ActualizarGrupoDto,
  ) {
    return this.gruposService.actualizar(invitacionId, grupoId, dto);
  }

  @Delete('asistentes/grupos/:grupoId')
  @UseGuards(EventPasswordGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Param('grupoId', ParseIntPipe) grupoId: number,
  ) {
    await this.gruposService.eliminar(invitacionId, grupoId);
  }

  @Post('asistentes/grupos/:grupoId/integrantes')
  @UseGuards(EventPasswordGuard)
  @HttpCode(HttpStatus.CREATED)
  async agregarIntegrante(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Body() dto: AgregarIntegranteDto,
  ) {
    return this.gruposService.agregarIntegrante(invitacionId, grupoId, dto);
  }

  @Delete('asistentes/grupos/:grupoId/integrantes/:invitadoId')
  @UseGuards(EventPasswordGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarIntegrante(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Param('invitadoId', ParseIntPipe) invitadoId: number,
  ) {
    await this.gruposService.eliminarIntegrante(invitacionId, grupoId, invitadoId);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/grupos/confirmar — Confirmar asistencia de grupo (público)
  // ═══════════════════════════════════════════

  @Post('grupos/confirmar')
  @HttpCode(HttpStatus.OK)
  async confirmar(
    @Param('id', ParseUUIDPipe) invitacionId: string,
    @Body() dto: ConfirmarGrupoDto,
  ) {
    return this.gruposService.confirmar(invitacionId, dto);
  }
}
