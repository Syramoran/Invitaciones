import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitacion } from '../../entities/invitacion.entity';
import { LogEliminacion } from '../../entities/log-eliminacion.entity';
import { CronJobsService } from './cron-jobs.service';
// R2StorageModule y NotificacionesModule son @Global, no necesitan importarse

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitacion, LogEliminacion]),
  ],
  providers: [CronJobsService],
})
export class CronJobsModule {}