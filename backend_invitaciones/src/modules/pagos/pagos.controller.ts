import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PagosService } from './pagos.service';
import { InvitacionesService } from '../invitaciones/invitaciones.service';
import { Public } from '../auth/decorators/public.decorator';

class CrearPreferenciaDto {
  @IsString()
  title!: string;

  @IsNumber()
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsString()
  codigoDescuento?: string;
}

@Controller('pagos')
export class PagosController {
  constructor(
    private readonly pagosService: PagosService,
    private readonly invitacionesService: InvitacionesService,
  ) {}

  // ═══════════════════════════════════════════════════════════════
  // POST /pagos/crear-preferencia/:id — Crear preferencia MP (JWT)
  // ═══════════════════════════════════════════════════════════════
  @Post('crear-preferencia/:id')
  @HttpCode(HttpStatus.OK)
  async crearPreferencia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CrearPreferenciaDto,
    @Req() req: any,
  ) {
    return this.pagosService.crearPreferencia(
      id,
      body.title,
      body.price,
      req.user.id,
      req.user.role,
      body.codigoDescuento,
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // POST /pagos/webhook — Webhook MercadoPago (Público)
  // ═══════════════════════════════════════════════════════════════
  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Query('type') tipo: string,
    @Query('id') paymentId: string,
    @Body() body: any,
  ) {
    const tipoFinal = tipo || body?.type || '';
    const idFinal = paymentId || body?.data?.id || '';
    await this.pagosService.procesarWebhook(tipoFinal, String(idFinal));
    return { ok: true };
  }

  // ═══════════════════════════════════════════════════════════════
  // POST /pagos/simular-pago-exitoso/:id — Simular pago (Admin)
  // ═══════════════════════════════════════════════════════════════
  @Post('simular-pago-exitoso/:id')
  @HttpCode(HttpStatus.OK)
  async simularPagoExitoso(@Param('id', ParseUUIDPipe) id: string) {
    return this.invitacionesService.actualizarEstadoPago(id, 'PAGADO');
  }
}
