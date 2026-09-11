import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from '../../entities/grupo.entity';
import { Invitado } from '../../entities/invitado.entity';
import { GruposController } from './grupos.controller';
import { GruposService } from './grupos.service';
import { InvitacionesModule } from '../invitaciones/invitaciones.module';
import { EventPasswordGuard } from '../invitados/guards/event-password.guard';

// No importa InvitadosModule a propósito: InvitadosModule importa GruposModule
// para el listado/export combinado, así que la dependencia inversa crearía un
// ciclo. EventPasswordGuard se registra acá también (misma clase, sin estado).
@Module({
  imports: [
    TypeOrmModule.forFeature([Grupo, Invitado]),
    InvitacionesModule,
  ],
  controllers: [GruposController],
  providers: [GruposService, EventPasswordGuard],
  exports: [GruposService],
})
export class GruposModule {}
