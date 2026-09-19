import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Invitacion } from './invitacion.entity';
import { Invitado } from './invitado.entity';

@Entity('grupo')
@Unique('uq_grupo_inv_slug', ['invitacionId', 'slug'])
@Index('idx_grupo_invitacion', ['invitacionId'])
export class Grupo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', name: 'invitacion_id' })
  invitacionId!: string;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'varchar', length: 150 })
  slug!: string;

  @Column({ type: 'int', nullable: true, name: 'max_integrantes' })
  maxIntegrantes!: number | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'restriccion_alimentaria',
  })
  restriccionAlimentaria!: string | null;

  @Column({ type: 'boolean', default: false, name: 'invitacion_enviada' })
  invitacionEnviada!: boolean;

  // ── Relaciones ──

  @ManyToOne(() => Invitacion, (inv) => inv.grupos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invitacion_id' })
  invitacion!: Invitacion;

  @OneToMany(() => Invitado, (inv) => inv.grupo)
  integrantes!: Invitado[];
}
