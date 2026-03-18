import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invitacion } from './invitacion.entity';

@Entity('foto_anfitrion')
export class FotoAnfitrion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', name: 'invitacion_id' })
  invitacionId!: string;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'smallint' })
  orden!: number;

  @Column({ type: 'int' })
  tamano!: number;

  // ── Relaciones ──

  @ManyToOne(() => Invitacion, (inv) => inv.fotosAnfitrion, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitacion_id' })
  invitacion!: Invitacion;
}
