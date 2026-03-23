import { Module } from '@nestjs/common';
import { Template, TipoEvento } from '../../entities';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { TipoEventoService } from '../tipos-evento/tipos-evento.service';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Template, TipoEvento
      ]),
    ],
  controllers: [TemplatesController],
  providers: [TemplatesService, TipoEventoService]
})
export class TemplatesModule {}
