import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities';
import { ClientService } from './client.service';
import { CreatePedidoClienteDto } from './dto/client.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Client Pedidos')
@ApiBearerAuth()
@Controller('client/pedidos')
@Roles(UserRole.CLIENTE)
export class ClientPedidosController {
  constructor(private readonly clientService: ClientService) {}

  // ═══════════════════════════════════════════
  // POST /client/pedidos — Crear pedido
  // ═══════════════════════════════════════════

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear pedido' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente' })
  async crear(@Req() req: any, @Body() dto: CreatePedidoClienteDto) {
    const usuario = req.user;
    // Complementar con datos del usuario autenticado
    return this.clientService.crearPedido(usuario.id, dto);
  }

  // ═══════════════════════════════════════════
  // GET /client/pedidos — Listar mis pedidos
  // ═══════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: 'Listar mis pedidos' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos del cliente' })
  async listar(@Req() req: any) {
    return this.clientService.listarPedidos(req.user.id);
  }

  // ═══════════════════════════════════════════
  // GET /client/pedidos/:id — Ver un pedido
  // ═══════════════════════════════════════════

  @Get(':id')
  @ApiOperation({ summary: 'Ver un pedido' })
  @ApiResponse({ status: 200, description: 'Detalle del pedido' })
  async obtener(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.clientService.obtenerPedido(id, req.user.id);
  }

  // ═══════════════════════════════════════════
  // POST /client/pedidos/:id/checkout — Generar URL de pago MP
  // ═══════════════════════════════════════════

  @Post(':id/checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar URL de pago MP' })
  @ApiResponse({ status: 200, description: 'URL de pago generada' })
  async checkout(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.clientService.generarCheckout(id, req.user.id);
  }

  // ═══════════════════════════════════════════
  // GET /client/pedidos/:id/pago — Estado del pago
  // ═══════════════════════════════════════════

  @Get(':id/pago')
  @ApiOperation({ summary: 'Obtener estado del pago' })
  @ApiResponse({ status: 200, description: 'Estado del pago devuelto' })
  async estadoPago(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.clientService.obtenerEstadoPago(id, req.user.id);
  }
}
