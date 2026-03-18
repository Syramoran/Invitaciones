import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Template } from './template.entity';
import { Pedido } from './pedido.entity';
import { Invitacion } from './invitacion.entity';

@Entity('tipo_evento')
export class TipoEvento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'jsonb', nullable: true, name: 'campos_especificos' })
  camposEspecificos!: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  // ── Relaciones ──

  @OneToMany(() => Template, (template) => template.tipoEvento)
  templates!: Template[];

  @OneToMany(() => Pedido, (pedido) => pedido.tipoEvento)
  pedidos!: Pedido[];

  @OneToMany(() => Invitacion, (invitacion) => invitacion.tipoEvento)
  invitaciones!: Invitacion[];
}
