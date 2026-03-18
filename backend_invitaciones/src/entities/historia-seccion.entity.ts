import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invitacion } from './invitacion.entity';

@Entity('historia_seccion')
export class HistoriaSeccion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', name: 'invitacion_id' })
  invitacionId!: string;

  @Column({ type: 'varchar', length: 3000 })
  texto!: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'imagen_url' })
  imagenUrl!: string;

  @Column({ type: 'smallint' })
  orden!  : number;

  // ── Relaciones ──

  @ManyToOne(() => Invitacion, (inv) => inv.historias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitacion_id' })
  invitacion!: Invitacion;
}
