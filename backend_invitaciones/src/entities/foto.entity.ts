import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invitacion } from './invitacion.entity';

@Entity('foto')
export class Foto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', name: 'invitacion_id' })
  invitacionId!: string;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'int' })
  tamano!: number;

  @Column({ type: 'varchar', length: 50, name: 'mime_type' })
  mimeType!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  // ── Relaciones ──

  @ManyToOne(() => Invitacion, (inv) => inv.fotos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitacion_id' })
  invitacion!: Invitacion;
}
