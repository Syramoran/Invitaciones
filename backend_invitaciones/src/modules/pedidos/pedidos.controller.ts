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
  async crear(@Body() dto: CreatePedidoDto): Promise<PedidoResponseDto> {
    return this.pedidosService.crear(dto);
  }

  // ═══════════════════════════════════════════
  // GET /pedidos — Listar pedidos con paginación y filtro (admin, JWT)
  // Query: ?page=1&limit=20&estado=PENDIENTE
  // ═══════════════════════════════════════════

  @Get()
  @UseGuards(JwtAuthGuard)
  async listar(@Query() query: PedidoQueryDto): Promise<PaginatedPedidosDto> {
    return this.pedidosService.listar(query);
  }

  // ═══════════════════════════════════════════
  // GET /pedidos/:id — Obtener pedido por ID (admin, JWT)
  // ═══════════════════════════════════════════

  @Get(':id')
  @UseGuards(JwtAuthGuard)
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
  async obtenerResumen(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PedidoResumenResponseDto> {
    return this.pedidosService.obtenerResumen(id);
  }
}