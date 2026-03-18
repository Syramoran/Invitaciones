import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { PedidoServicio } from './pedido-servicio.entity';
import { InvitacionServicio } from './invitacion-servicio.entity';

@Entity('servicio')
export class Servicio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precio!: number;

  @Column({ type: 'boolean', default: false, name: 'incluido_en_base' })
  incluidoEnBase!: boolean;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  // ── Relaciones ──

  @OneToMany(() => PedidoServicio, (ps) => ps.servicio)
  pedidoServicios!: PedidoServicio[];

  @OneToMany(() => InvitacionServicio, (is) => is.servicio)
  invitacionServicios!: InvitacionServicio[];
}
