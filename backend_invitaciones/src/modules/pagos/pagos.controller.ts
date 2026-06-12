import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Pagos / Webhooks')
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // ═══════════════════════════════════════════
  // POST /pagos/webhook — Webhook de Mercado Pago (público)
  // MP envía notificaciones de pago aquí.
  // La validación de autenticidad se hace consultando el pago directamente
  // a la API de MP (no confiamos en el payload crudamente).
  // ═══════════════════════════════════════════

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK) // MP espera 200 — si no responde 200, reintenta
  @ApiOperation({ summary: 'Webhook de notificaciones de Mercado Pago (público)' })
  @ApiResponse({ status: 200, description: 'Notificación recibida correctamente' })
  async webhook(@Body() body: Record<string, any>) {
    // Procesamos en fire-and-forget para responder 200 rápido a MP
    this.pagosService.procesarWebhook(body).catch(() => {});
    return { received: true };
  }
}
