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

@Controller('tipos-evento')
export class TipoEventoController {
  constructor(private readonly tipoEventoService: TipoEventoService) {}

  // ─────────────────────────────────────────
  // Endpoints públicos (sin JWT)
  // ─────────────────────────────────────────

  @Public()
  @Get()
  findAll() {
    return this.tipoEventoService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoEventoService.findById(id);
  }

  // ─────────────────────────────────────────
  // Endpoints admin (protegidos por JwtAuthGuard global)
  // ─────────────────────────────────────────

  @Post()
  create(@Body() dto: CreateTipoEventoDto) {
    return this.tipoEventoService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoEventoDto,
  ) {
    return this.tipoEventoService.update(id, dto);
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.tipoEventoService.toggle(id);
  }
}