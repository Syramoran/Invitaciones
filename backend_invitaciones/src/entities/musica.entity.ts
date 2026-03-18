import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Invitacion } from './invitacion.entity';

@Entity('musica')
export class Musica {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true, name: 'invitacion_id' })
  invitacionId!: string;

  @Column({ type: 'varchar', length: 500, name: 'archivo_url' })
  archivoUrl!: string;

  @Column({ type: 'int' })
  tamano!: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'audio/mpeg',
    name: 'mime_type',
  })
  mimeType!: string;

  // ── Relaciones ──

  @OneToOne(() => Invitacion, (inv) => inv.musica, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitacion_id' })
  invitacion!: Invitacion;
}
