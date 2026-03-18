import { Module } from '@nestjs/common';
import { TipoEvento } from '../../entities';
import { TiposEventoController } from './tipos-evento.controller';
import { TiposEventoService } from './tipos-evento.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        TipoEvento
      ]),
    ],
  controllers: [TiposEventoController],
  providers: [TiposEventoService]
})
export class TiposEventoModule {}
