import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MaxLength(100, { message: 'El usuario no puede superar los 100 caracteres' })
  username!: string; // 

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MaxLength(255, { message: 'La contraseña no puede superar los 255 caracteres' })
  password!: string; // 
}