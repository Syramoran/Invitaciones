// src/modules/tipos-evento/tipos-evento.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TipoEventoService } from './tipos-evento.service';
import { CreateTipoEventoDto, UpdateTipoEventoDto } from './dto/tipo-evento.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tipos de Evento')
@Controller('tipos-evento')
export class TipoEventoController {
  constructor(private readonly tipoEventoService: TipoEventoService) {}

  // ─────────────────────────────────────────
  // Endpoints públicos (sin JWT)
  // ─────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar tipos de evento (público)' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de evento' })
  findAll() {
    return this.tipoEventoService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de evento por ID (público)' })
  @ApiResponse({ status: 200, description: 'Detalle del tipo de evento' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoEventoService.findById(id);
  }

  // ─────────────────────────────────────────
  // Endpoints admin (protegidos por JwtAuthGuard global)
  // ─────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear tipo de evento (admin)' })
  @ApiResponse({ status: 201, description: 'Tipo de evento creado' })
  create(@Body() dto: CreateTipoEventoDto) {
    return this.tipoEventoService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar tipo de evento (admin)' })
  @ApiResponse({ status: 200, description: 'Tipo de evento actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoEventoDto,
  ) {
    return this.tipoEventoService.update(id, dto);
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar/desactivar tipo de evento (admin)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.tipoEventoService.toggle(id);
  }
}