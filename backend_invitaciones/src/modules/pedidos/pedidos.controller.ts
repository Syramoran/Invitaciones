import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

import { PedidosService } from './pedidos.service';
import {
  CreatePedidoDto,
  UpdateEstadoPedidoDto,
  PedidoQueryDto,
  PedidoResponseDto,
  PedidoResumenResponseDto,
  PaginatedPedidosDto,
} from './dto/pedido.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  // ═══════════════════════════════════════════
  // POST /pedidos — Crear pedido desde landing (público, sin auth)
  // Diagrama de Actividad #1: "Presiona Solicitar"
  // ═══════════════════════════════════════════

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear pedido desde la landing (público)' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente' })
  async crear(@Body() dto: CreatePedidoDto): Promise<PedidoResponseDto> {
    return this.pedidosService.crear(dto);
  }

  // ═══════════════════════════════════════════
  // GET /pedidos — Listar pedidos con paginación y filtro (admin, JWT)
  // Query: ?page=1&limit=20&estado=PENDIENTE
  // ═══════════════════════════════════════════

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar pedidos (admin)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de pedidos' })
  async listar(@Query() query: PedidoQueryDto): Promise<PaginatedPedidosDto> {
    return this.pedidosService.listar(query);
  }

  // ═══════════════════════════════════════════
  // GET /pedidos/:id — Obtener pedido por ID (admin, JWT)
  // ═══════════════════════════════════════════

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener pedido por ID (admin)' })
  @ApiResponse({ status: 200, description: 'Detalle del pedido' })
  async obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PedidoResponseDto> {
    return this.pedidosService.obtenerPorId(id);
  }

  // ═══════════════════════════════════════════
  // PATCH /pedidos/:id/estado — Cambiar estado del pedido (admin, JWT)
  // Transiciones: PENDIENTE → CONTACTADO → COMPLETADO | CANCELADO
  // ═══════════════════════════════════════════

  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar estado del pedido (admin)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoPedidoDto,
  ): Promise<PedidoResponseDto> {
    return this.pedidosService.cambiarEstado(id, dto);
  }

  // ═══════════════════════════════════════════
  // GET /pedidos/:id/resumen — Resumen público del pedido
  // Incluye link a WhatsApp Business (wa.me/)
  // ═══════════════════════════════════════════

  @Get(':id/resumen')
  @Public()
  @ApiOperation({ summary: 'Obtener resumen del pedido para el cliente (público)' })
  @ApiResponse({ status: 200, description: 'Resumen del pedido' })
  async obtenerResumen(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PedidoResumenResponseDto> {
    return this.pedidosService.obtenerResumen(id);
  }
}