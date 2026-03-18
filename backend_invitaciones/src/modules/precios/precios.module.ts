import { Module } from '@nestjs/common';
import { Servicio, Template } from '../../entities';
import { PreciosController } from './precios.controller';
import { PreciosService } from './precios.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Servicio,
        Template
      ]),
    ],
  controllers: [PreciosController],
  providers: [PreciosService]
})
export class PreciosModule {}
