import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Base')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Endpoint base de prueba' })
  @ApiResponse({ status: 200, description: 'Responde Hello World' })
  getHello(): string {
    return this.appService.getHello();
  }
}
