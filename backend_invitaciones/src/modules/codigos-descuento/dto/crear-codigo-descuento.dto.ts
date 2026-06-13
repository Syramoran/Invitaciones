import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CrearCodigoDescuentoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  codigo!: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  porcentaje!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaExpiracion?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limiteUsos?: number;
}
