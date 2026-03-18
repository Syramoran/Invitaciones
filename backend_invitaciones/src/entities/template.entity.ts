import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TipoEvento } from './tipo-evento.entity';
import { Pedido } from './pedido.entity';
import { Invitacion } from './invitacion.entity';

@Entity('template')
export class Template {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'tipo_evento_id' })
  tipoEventoId!: number;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'thumbnail_url' })
  thumbnailUrl!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string

  // ── Relaciones ──

  @ManyToOne(() => TipoEvento, (tipo) => tipo.templates)
  @JoinColumn({ name: 'tipo_evento_id' })
  tipoEvento!: TipoEvento;

  @OneToMany(() => Pedido, (pedido) => pedido.template)
  pedidos!: Pedido[];

  @OneToMany(() => Invitacion, (inv) => inv.template)
  invitaciones!: Invitacion[];
}
