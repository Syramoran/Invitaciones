import { Module } from '@nestjs/common';
import { Notificacion, LogEliminacion, Invitacion } from '../../entities';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Notificacion,
        LogEliminacion,
        Invitacion
      ]),
    ],
  controllers: [NotificacionesController],
  providers: [NotificacionesService]
})
export class NotificacionesModule {}
