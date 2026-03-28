import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitacion } from '../../entities/invitacion.entity';
import { Pedido } from '../../entities/pedido.entity';
import { FotoAnfitrion } from '../../entities/foto-anfitrion.entity';
import { LogEliminacion } from '../../entities/log-eliminacion.entity';

import { InvitacionesController } from './invitaciones.controller';
import { InvitacionesService } from './invitaciones.service';
import { InvitacionesPublicService } from './invitaciones-public.service';

import { TiposEventoModule } from '../tipos-evento/tipos-evento.module';
import { TemplatesModule } from '../templates/templates.module';
import { ServiciosModule } from '../servicios/servicios.module';
import { MusicaModule } from '../musica/musica.module';
// R2StorageModule y NotificacionesModule son @Global, no necesitan importarse

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invitacion,
      Pedido,
      FotoAnfitrion,
      LogEliminacion,
    ]),
    TiposEventoModule,
    TemplatesModule,
    ServiciosModule,
    forwardRef(() => MusicaModule),
  ],
  controllers: [InvitacionesController],
  providers: [InvitacionesService, InvitacionesPublicService],
  exports: [InvitacionesService, InvitacionesPublicService],
})
export class InvitacionesModule {}