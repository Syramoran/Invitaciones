// src/modules/servicios/precios.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';
import { ServiciosService } from '../servicios/servicios.service';
import { Public } from '../auth/decorators/public.decorator';

class CalcularPrecioDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Debe seleccionar al menos un servicio' })
  @IsInt({ each: true, message: 'Cada id debe ser un número entero' })
  servicioIds!: number[];
}

@Controller('precios')
export class PreciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Public()
  @Post('calcular')
  @HttpCode(HttpStatus.OK)
  calcular(@Body() dto: CalcularPrecioDto) {
    return this.serviciosService.calcularPrecio(dto.servicioIds);
  }
}