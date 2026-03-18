import { Module } from '@nestjs/common';
import { HistoriaSeccion, Invitacion } from '../../entities';
import { HistoriaController } from './historia.controller';
import { HistoriaService } from './historia.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        HistoriaSeccion,
        Invitacion
      ]),
    ],
  controllers: [HistoriaController],
  providers: [HistoriaService]
})
export class HistoriaModule {}
