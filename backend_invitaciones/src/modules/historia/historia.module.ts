import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriaSeccion } from '../../entities/historia-seccion.entity';
import { HistoriasController } from './historia.controller';
import { HistoriasService } from './historia.service';
import { InvitacionesModule } from '../invitaciones/invitaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistoriaSeccion]),
    InvitacionesModule,
  ],
  controllers: [HistoriasController],
  providers: [HistoriasService],
  exports: [HistoriasService],
})
export class HistoriasModule {}