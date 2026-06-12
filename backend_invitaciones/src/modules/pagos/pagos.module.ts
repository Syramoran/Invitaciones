import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido, Invitacion, Pago } from '../../entities';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, Invitacion, Pago]),
    NotificacionesModule,
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService], // exportado para que ClientModule lo pueda usar
})
export class PagosModule {}
