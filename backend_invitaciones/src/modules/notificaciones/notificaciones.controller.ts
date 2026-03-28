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
  async listar(@Query() query: NotificacionQueryDto) {
    return this.notificacionesService.listar(query);
  }

  // ═══════════════════════════════════════════
  // POST /notificaciones/test — Enviar notificación de prueba (admin, JWT)
  // ═══════════════════════════════════════════

  @Post('test')
  @HttpCode(HttpStatus.CREATED)
  async enviarPrueba() {
    return this.notificacionesService.enviarPrueba();
  }
}