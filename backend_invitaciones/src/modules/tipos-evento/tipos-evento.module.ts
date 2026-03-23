import { Module } from '@nestjs/common';
import { TipoEvento } from '../../entities';
import { TipoEventoController } from './tipos-evento.controller';
import { TipoEventoService } from './tipos-evento.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        TipoEvento
      ]),
    ],
  controllers: [TipoEventoController],
  providers: [TipoEventoService]
})
export class TiposEventoModule {}
