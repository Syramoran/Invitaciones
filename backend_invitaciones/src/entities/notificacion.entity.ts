import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum TipoNotificacion {
  NUEVO_PEDIDO = 'NUEVO_PEDIDO',
  EXPIRACION_PROXIMA = 'EXPIRACION_PROXIMA',
  AVISO_ELIMINACION = 'AVISO_ELIMINACION',
}

@Entity('notificacion')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 30 })
  tipo!: TipoNotificacion;

  @Column({ type: 'varchar', length: 255, name: 'destinatario_email' })
  destinatarioEmail!: string;

  @Column({ type: 'varchar', length: 255 })
  asunto!: string;

  @Column({ type: 'text' })
  mensaje!: string;

  @Column({ type: 'boolean', default: false })
  enviada!: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_envio' })
  fechaEnvio!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
