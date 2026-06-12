import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionQueryDto } from './dto/notificacion.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notificaciones')
@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(
    private readonly notificacionesService: NotificacionesService,
  ) {}

  // ═══════════════════════════════════════════
  // GET /notificaciones — Listar notificaciones enviadas (admin, JWT)
  // ═══════════════════════════════════════════

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar notificaciones (admin)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de notificaciones' })
  async listar(@Query() query: NotificacionQueryDto) {
    return this.notificacionesService.listar(query);
  }

  // ═══════════════════════════════════════════
  // POST /notificaciones/test — Enviar notificación de prueba (admin, JWT)
  // ═══════════════════════════════════════════

  @Post('test')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar notificación de prueba (admin)' })
  @ApiResponse({ status: 201, description: 'Notificación de prueba enviada' })
  async enviarPrueba() {
    return this.notificacionesService.enviarPrueba();
  }
}