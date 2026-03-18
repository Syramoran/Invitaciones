import { Module } from '@nestjs/common';
import { Musica, Invitacion } from '../../entities';
import { MusicaController } from './musica.controller';
import { MusicaService } from './musica.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Musica,
        Invitacion
      ]),
    ],
  controllers: [MusicaController],
  providers: [MusicaService]
})
export class MusicaModule {}
