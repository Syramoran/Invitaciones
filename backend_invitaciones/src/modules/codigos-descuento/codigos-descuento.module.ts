import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodigoDescuento } from '../../entities/codigo-descuento.entity';
import { CodigosDescuentoService } from './codigos-descuento.service';
import { CodigosDescuentoController } from './codigos-descuento.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CodigoDescuento])],
  controllers: [CodigosDescuentoController],
  providers: [CodigosDescuentoService],
  exports: [CodigosDescuentoService],
})
export class CodigosDescuentoModule {}
