import { IsString, MaxLength } from 'class-validator';

export class ValidarCodigoDto {
  @IsString()
  @MaxLength(50)
  codigo!: string;
}
