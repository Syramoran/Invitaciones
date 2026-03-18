import { IsString, IsObject, IsEmail, IsNumber } from 'class-validator';

export class UserDataDto {
  @IsNumber()
  id!: number;

  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  role!: string;
}

export class LoginResponseDto {
  @IsString()
  access_token!: string; // El token JWT firmado [cite: 47, 67]

  @IsObject()
  user!: UserDataDto; // Datos básicos del administrador [cite: 67, 290]
}