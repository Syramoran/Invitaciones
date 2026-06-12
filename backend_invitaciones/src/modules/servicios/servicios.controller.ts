// src/modules/servicios/servicios.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import {
  CreateServicioDto,
  UpdateServicioDto,
  ServicioQueryDto,
  ServicioResponseDto,
} from './dto/servicio.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RequireAdmin } from '../auth/decorators/require-admin.decorator';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  // ─────────────────────────────────────────
  // Endpoints públicos (sin JWT)
  // ─────────────────────────────────────────

  @Public()
  @Get()
  findAll(@Query() query: ServicioQueryDto): Promise<ServicioResponseDto[]> {
    return this.serviciosService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ServicioResponseDto> {
    return this.serviciosService.findById(id);
  }

  // ─────────────────────────────────────────
  // Endpoints admin (protegidos por JwtAuthGuard global)
  // ─────────────────────────────────────────

  @Post()
  @RequireAdmin()
  create(@Body() dto: CreateServicioDto): Promise<ServicioResponseDto> {
    return this.serviciosService.create(dto);
  }

  @Put(':id')
  @RequireAdmin()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicioDto,
  ): Promise<ServicioResponseDto> {
    return this.serviciosService.update(id, dto);
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  toggle(@Param('id', ParseIntPipe) id: number): Promise<{ id: number; activo: boolean }> {
    return this.serviciosService.toggle(id);
  }
}