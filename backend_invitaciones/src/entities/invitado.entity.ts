import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Invitacion } from './invitacion.entity';

@Entity('invitado')
@Unique('uq_invitado_inv_nombre', ['invitacionId', 'nombre', 'apellido'])
export class Invitado {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', name: 'invitacion_id' })
  invitacionId!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100 })
  apellido!: string;

  @Column({ type: 'boolean', default: false })
  confirmado!: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_confirmacion' })
  fechaConfirmacion!: Date;

  // ── Relaciones ──

  @ManyToOne(() => Invitacion, (inv) => inv.invitados, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitacion_id' })
  invitacion!: Invitacion;
}
