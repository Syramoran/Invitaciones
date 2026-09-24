import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  async check() {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new HttpException(
        { status: 'error', db: 'error' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'ok',
      uptime: process.uptime(),
      db: 'ok',
    };
  }
}
