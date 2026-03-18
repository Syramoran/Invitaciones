import { Module } from '@nestjs/common';
import { GaleriaController } from './galeria.controller';
import { GaleriaService } from './galeria.service';
import { Foto, Invitacion } from '../../entities';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Foto,
        Invitacion
      ]),
    ],
  controllers: [GaleriaController],
  providers: [GaleriaService]
})
export class GaleriaModule {}
