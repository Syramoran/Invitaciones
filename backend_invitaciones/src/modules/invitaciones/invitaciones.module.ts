import { Module } from '@nestjs/common';
import { Invitacion, InvitacionServicio, Pedido, Template, TipoEvento, FotoAnfitrion, Musica } from '../../entities';
import { InvitacionesController } from './invitaciones.controller';
import { InvitacionesService } from './invitaciones.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Invitacion,
        InvitacionServicio,
        Pedido,
        Template,
        TipoEvento,
        FotoAnfitrion,
        Musica
      ]),
    ],
  controllers: [InvitacionesController],
  providers: [InvitacionesService]
})
export class InvitacionesModule {}
