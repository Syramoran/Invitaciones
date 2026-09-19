import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitado } from '../../entities/invitado.entity';
import { Grupo } from '../../entities/grupo.entity';
import { InvitadosController } from './invitados.controller';
import { InvitadosService } from './invitados.service';
import { InvitacionesModule } from '../invitaciones/invitaciones.module';
import { GruposModule } from '../grupos/grupos.module';
import { EventPasswordGuard } from './guards/event-password.guard';
import { InvitacionOwnerOrAdminGuard } from './guards/invitacion-owner-or-admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitado, Grupo]),
    InvitacionesModule,
    GruposModule,
  ],
  controllers: [InvitadosController],
  providers: [InvitadosService, EventPasswordGuard, InvitacionOwnerOrAdminGuard],
  exports: [InvitadosService, EventPasswordGuard],
})
export class InvitadosModule {}