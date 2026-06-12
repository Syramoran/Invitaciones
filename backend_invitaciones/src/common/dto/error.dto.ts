import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Estructura global para respuestas de error (400, 401, 403, 404, 500).
 * Sigue el estándar de NestJS para facilitar la integración con el frontend.
 */
export class ErrorDto {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  @IsNumber()
  statusCode!: number; // Ej: 400, 404, 500

  @ApiProperty({ example: ['El campo nombre es obligatorio'], description: 'Mensaje de error o array de mensajes de validación' })
  @IsString({ each: true })
  message!: string | string[]; // Puede ser un mensaje único o un array de validaciones de class-validator

  @ApiProperty({ example: 'Bad Request', description: 'Nombre del error' })
  @IsString()
  error!: string; // Nombre del error (ej: "Bad Request", "Unauthorized")

  @ApiPropertyOptional({ example: '2026-10-01T10:00:00.000Z', description: 'Timestamp del error' })
  @IsString()
  @IsOptional()
  timestamp?: string; // ISO string generado por el filtro de excepciones

  @ApiPropertyOptional({ example: '/api/v1/invitaciones', description: 'URL que originó el error' })
  @IsString()
  @IsOptional()
  path?: string; // La URL que originó el error para depuración rápida
}