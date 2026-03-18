import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Servicio } from './servicio.entity';

@Entity('pedido_servicio')
export class PedidoServicio {
  @PrimaryColumn({ type: 'int', name: 'pedido_id' })
  pedidoId!: number;

  @PrimaryColumn({ type: 'int', name: 'servicio_id' })
  servicioId!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'precio_al_momento',
  })
  precioAlMomento!: number;

  // ── Relaciones ──

  @ManyToOne(() => Pedido, (pedido) => pedido.pedidoServicios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedido_id' })
  pedido!: Pedido;

  @ManyToOne(() => Servicio, (servicio) => servicio.pedidoServicios)
  @JoinColumn({ name: 'servicio_id' })
  servicio!: Servicio;
}
