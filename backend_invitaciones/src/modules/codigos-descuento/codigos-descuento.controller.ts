import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CodigosDescuentoService } from './codigos-descuento.service';
import { CrearCodigoDescuentoDto } from './dto/crear-codigo-descuento.dto';
import { ValidarCodigoDto } from './dto/validar-codigo.dto';
import { RequireAdmin } from '../auth/decorators/require-admin.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('codigos-descuento')
export class CodigosDescuentoController {
  constructor(private readonly service: CodigosDescuentoService) {}

  // ── GET /codigos-descuento — Admin only ──────────────────────────────────
  @Get()
  @RequireAdmin()
  listar() {
    return this.service.listar();
  }

  // ── POST /codigos-descuento — Admin only ─────────────────────────────────
  @Post()
  @RequireAdmin()
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() dto: CrearCodigoDescuentoDto) {
    return this.service.crear(dto);
  }

  // ── POST /codigos-descuento/validar — Public ─────────────────────────────
  @Post('validar')
  @Public()
  @HttpCode(HttpStatus.OK)
  validar(@Body() dto: ValidarCodigoDto) {
    return this.service.validar(dto.codigo);
  }

  // ── PATCH /codigos-descuento/:id/toggle — Admin only ─────────────────────
  @Patch(':id/toggle')
  @RequireAdmin()
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.service.toggle(id);
  }

  // ── DELETE /codigos-descuento/:id — Admin only ────────────────────────────
  @Delete(':id')
  @RequireAdmin()
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
