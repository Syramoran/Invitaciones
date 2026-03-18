import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('log_eliminacion')
export class LogEliminacion {
  @PrimaryGeneratedColumn()
  id!: number;

  // Referencia blanda — la invitación ya fue eliminada (hard delete)
  @Column({ type: 'uuid', name: 'invitacion_id_ref' })
  invitacionIdRef!: string;

  @CreateDateColumn({ name: 'fecha_eliminacion', type: 'timestamp' })
  fechaEliminacion!: Date;

  @Column({ type: 'int', default: 0, name: 'fotos_eliminadas' })
  fotosEliminadas!: number;

  @Column({ type: 'text', nullable: true })
  detalles!: string;
}
