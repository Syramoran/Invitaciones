import { Module } from '@nestjs/common';
import { Pedido, PedidoServicio, Servicio, Template, TipoEvento } from '../../entities';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      PedidoServicio,
      TipoEvento,
      Template,
      Servicio,
    ]),
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}