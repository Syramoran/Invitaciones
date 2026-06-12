import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * POST /auth/register
 * Registro de nuevos clientes (role: CLIENTE).
 */
export class RegisterDto {
  /** Nombre de usuario único para login */
  @ApiProperty({ example: 'juan_perez', description: 'Nombre de usuario único para login' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'El username solo puede contener letras, números, puntos, guiones y guiones bajos.',
  })
  username!: string;

  @ApiProperty({ example: 'juan@example.com', description: 'Correo electrónico del usuario' })
  @IsEmail({}, { message: 'Debe ser un email válido.' })
  @IsNotEmpty()
  email!: string;

  /** Mínimo 8 caracteres */
  @ApiProperty({ example: 'contraseñaSegura123', description: 'Contraseña (mínimo 8 caracteres)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(72, { message: 'La contraseña no puede superar 72 caracteres.' })
  password!: string;

  /** Nombre real del cliente (opcional, para personalizar comunicaciones) */
  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Nombre real del cliente' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nombreCompleto?: string;
}
