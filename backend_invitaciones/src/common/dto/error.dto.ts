import { IsNumber, IsString, IsOptional, IsArray } from 'class-validator';

/**
 * Estructura global para respuestas de error (400, 401, 403, 404, 500).
 * Sigue el estándar de NestJS para facilitar la integración con el frontend.
 */
export class ErrorDto {
  @IsNumber()
  statusCode!: number; // Ej: 400, 404, 500

  @IsString({ each: true })
  message!: string | string[]; // Puede ser un mensaje único o un array de validaciones de class-validator

  @IsString()
  error!: string; // Nombre del error (ej: "Bad Request", "Unauthorized")

  @IsString()
  @IsOptional()
  timestamp?: string; // ISO string generado por el filtro de excepciones

  @IsString()
  @IsOptional()
  path?: string; // La URL que originó el error para depuración rápida
}