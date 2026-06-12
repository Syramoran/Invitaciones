import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Payload del webhook de Mercado Pago (notificación tipo "payment").
 * MP envía: { action, api_version, data: { id }, date_created, id, live_mode, type, user_id }
 */
export class WebhookMpDto {
  @ApiProperty({ example: 'payment.created' })
  @IsString()
  @IsNotEmpty()
  action!: string; // 'payment.created' | 'payment.updated'

  @ApiPropertyOptional({ example: 'payment' })
  @IsString()
  @IsOptional()
  type?: string; // 'payment'

  @ApiProperty({ example: { id: '123456789' } })
  data!: { id: string }; // id del pago en MP

  @ApiPropertyOptional({ example: '987654321' })
  @IsOptional()
  id?: string | number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  live_mode?: boolean;
}
