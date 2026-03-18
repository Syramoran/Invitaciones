import { Module } from '@nestjs/common';
import { Servicio } from '../../entities';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Servicio
      ]),
    ],
  controllers: [ServiciosController],
  providers: [ServiciosService]
})
export class ServiciosModule {}
