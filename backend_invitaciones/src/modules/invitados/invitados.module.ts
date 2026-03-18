import { Module } from '@nestjs/common';
import { Invitado, Invitacion } from '../../entities';
import { InvitadosController } from './invitados.controller';
import { InvitadosService } from './invitados.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Invitado,
        Invitacion
      ]),
    ],
  controllers: [InvitadosController],
  providers: [InvitadosService]
})
export class InvitadosModule {}
