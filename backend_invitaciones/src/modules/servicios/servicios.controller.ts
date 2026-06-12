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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Servicios')
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  // ─────────────────────────────────────────
  // Endpoints públicos (sin JWT)
  // ─────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar servicios (público)' })
  @ApiResponse({ status: 200, description: 'Lista de servicios' })
  findAll(@Query() query: ServicioQueryDto): Promise<ServicioResponseDto[]> {
    return this.serviciosService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID (público)' })
  @ApiResponse({ status: 200, description: 'Detalle del servicio' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ServicioResponseDto> {
    return this.serviciosService.findById(id);
  }

  // ─────────────────────────────────────────
  // Endpoints admin (protegidos por JwtAuthGuard global)
  // ─────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear servicio (admin)' })
  @ApiResponse({ status: 201, description: 'Servicio creado' })
  create(@Body() dto: CreateServicioDto): Promise<ServicioResponseDto> {
    return this.serviciosService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar servicio (admin)' })
  @ApiResponse({ status: 200, description: 'Servicio actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicioDto,
  ): Promise<ServicioResponseDto> {
    return this.serviciosService.update(id, dto);
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar/desactivar servicio (admin)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  toggle(@Param('id', ParseIntPipe) id: number): Promise<{ id: number; activo: boolean }> {
    return this.serviciosService.toggle(id);
  }
}