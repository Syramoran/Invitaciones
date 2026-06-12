import { IsString, IsObject, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDataDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id!: number;

  @ApiProperty({ example: 'admin' })
  @IsString()
  username!: string;

  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'ADMIN' })
  @IsString()
  role!: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Token JWT de acceso', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  access_token!: string; // El token JWT firmado [cite: 47, 67]

  @ApiProperty({ description: 'Datos del usuario autenticado', type: UserDataDto })
  @IsObject()
  user!: UserDataDto; // Datos básicos del administrador [cite: 67, 290]
}