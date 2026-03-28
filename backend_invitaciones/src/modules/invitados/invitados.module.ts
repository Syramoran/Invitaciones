import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitado } from '../../entities/invitado.entity';
import { InvitadosController } from './invitados.controller';
import { InvitadosService } from './invitados.service';
import { InvitacionesModule } from '../invitaciones/invitaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitado]),
    InvitacionesModule,
  ],
  controllers: [InvitadosController],
  providers: [InvitadosService],
  exports: [InvitadosService],
})
export class InvitadosModule {}