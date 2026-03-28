import { Module } from '@nestjs/common';
import { GaleriaController } from './galeria.controller';
import { GaleriaService } from './galeria.service';
import { Foto } from '../../entities';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { InvitacionesModule } from '../invitaciones/invitaciones.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Foto,
      ]),
      InvitacionesModule
    ],
  controllers: [GaleriaController],
  providers: [GaleriaService]
})
export class GaleriaModule {}
