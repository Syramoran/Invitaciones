import { Module } from '@nestjs/common';
import { Template, TipoEvento } from '../../entities';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Template,
        TipoEvento
      ]),
    ],
  controllers: [TemplatesController],
  providers: [TemplatesService]
})
export class TemplatesModule {}
