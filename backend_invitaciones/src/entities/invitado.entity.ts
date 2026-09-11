import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Invitacion } from './invitacion.entity';
import { Grupo } from './grupo.entity';

@Entity('invitado')
@Unique('uq_invitado_inv_slug', ['invitacionId', 'slug'])
@Index('idx_invitado_grupo', ['grupoId'])
@Index('idx_invitado_principal', ['invitadoPrincipalId'])
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

  @Column({ type: 'varchar', length: 150, nullable: true })
  slug!: string | null;

  @Column({ type: 'int', nullable: true, name: 'grupo_id' })
  grupoId!: number | null;

  @Column({ type: 'int', nullable: true, name: 'invitado_principal_id' })
  invitadoPrincipalId!: number | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'restriccion_alimentaria',
  })
  restriccionAlimentaria!: string | null;

  @Column({ type: 'boolean', nullable: true, name: 'puede_agregar_plus_one' })
  puedeAgregarPlusOne!: boolean | null;

  @Column({ type: 'boolean', default: false, name: 'invitacion_enviada' })
  invitacionEnviada!: boolean;

  // ── Relaciones ──

  @ManyToOne(() => Invitacion, (inv) => inv.invitados, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitacion_id' })
  invitacion!: Invitacion;

  @ManyToOne(() => Grupo, (g) => g.integrantes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grupo_id' })
  grupo!: Grupo | null;

  @OneToOne(() => Invitado, (inv) => inv.plusOne, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invitado_principal_id' })
  invitadoPrincipal!: Invitado | null;

  @OneToOne(() => Invitado, (inv) => inv.invitadoPrincipal)
  plusOne!: Invitado | null;
}
