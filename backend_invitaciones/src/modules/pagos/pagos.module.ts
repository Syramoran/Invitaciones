import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { InvitacionesModule } from '../invitaciones/invitaciones.module';
import { CodigosDescuentoModule } from '../codigos-descuento/codigos-descuento.module';

@Module({
  imports: [ConfigModule, InvitacionesModule, CodigosDescuentoModule],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
