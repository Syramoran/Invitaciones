import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Musica } from '../../entities/musica.entity';
import { MusicaController } from './musica.controller';
import { MusicaService } from './musica.service';
import { InvitacionesModule } from '../invitaciones/invitaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Musica]),
    forwardRef(() => InvitacionesModule), // Rompe dependencia circular
  ],
  controllers: [MusicaController],
  providers: [MusicaService],
  exports: [MusicaService],
})
export class MusicaModule {}