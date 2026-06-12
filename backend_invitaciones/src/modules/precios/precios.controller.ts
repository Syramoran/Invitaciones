// src/modules/servicios/precios.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsArray, IsInt } from 'class-validator';
import { ServiciosService } from '../servicios/servicios.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';

class CalcularPrecioDto {
  @ApiProperty({ example: [1, 2], description: 'IDs de los servicios opcionales' })
  @IsArray()
  // @ArrayNotEmpty({ message: 'Debe seleccionar al menos un servicio' })
  @IsInt({ each: true, message: 'Cada id debe ser un número entero' })
  servicioIds!: number[];
}

@ApiTags('Precios')

@Controller('precios')
export class PreciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Public()
  @Post('calcular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calcular precio en tiempo real (público)' })
  @ApiResponse({ status: 200, description: 'Precio calculado' })
  calcular(@Body() dto: CalcularPrecioDto) {
    return this.serviciosService.calcularPrecio(dto.servicioIds);
  }
}