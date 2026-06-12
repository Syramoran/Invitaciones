import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientPedidosController } from './client-pedidos.controller';
import { ClientInvitacionesController } from './client-invitaciones.controller';
import { ClientService } from './client.service';

import { Pedido } from '../../entities/pedido.entity';
import { Invitacion } from '../../entities/invitacion.entity';
import { InvitacionServicio } from '../../entities/invitacion-servicio.entity';
import { Servicio } from '../../entities/servicio.entity';
import { TipoEvento } from '../../entities/tipo-evento.entity';
import { Template } from '../../entities/template.entity';

import { PagosModule } from '../pagos/pagos.module';
import { InvitacionesModule } from '../invitaciones/invitaciones.module';
import { HistoriasModule } from '../historia/historia.module';
import { MusicaModule } from '../musica/musica.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      Invitacion,
      InvitacionServicio,
      Servicio,
      TipoEvento,
      Template,
    ]),
    PagosModule,
    InvitacionesModule,
    HistoriasModule,
    MusicaModule,
  ],
  controllers: [ClientPedidosController, ClientInvitacionesController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
