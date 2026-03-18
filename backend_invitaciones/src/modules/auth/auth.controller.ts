import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // La ruta será localhost:3000/v1/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('test-db')
  async test() {
    return await this.authService.testQuery();
  }
}