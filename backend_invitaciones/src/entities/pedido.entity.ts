import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TipoEvento } from './tipo-evento.entity';
import { Template } from './template.entity';
import { PedidoServicio } from './pedido-servicio.entity';
import { Invitacion } from './invitacion.entity';

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  CONTACTADO = 'CONTACTADO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO',
}

@Entity('pedido')
export class Pedido {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'tipo_evento_id' })
  tipoEventoId!: number;

  @Column({ type: 'int', name: 'template_id' })
  templateId!: number;

  @Column({ type: 'varchar', length: 200, name: 'nombre_cliente' })
  nombreCliente!: string;

  @Column({ type: 'varchar', length: 30 })
  telefono!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'precio_base' })
  precioBase!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'precio_total' })
  precioTotal!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoPedido.PENDIENTE,
  })
  estado!: EstadoPedido;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  // ── Relaciones ──

  @ManyToOne(() => TipoEvento, (tipo) => tipo.pedidos)
  @JoinColumn({ name: 'tipo_evento_id' })
  tipoEvento!: TipoEvento;

  @ManyToOne(() => Template, (template) => template.pedidos)
  @JoinColumn({ name: 'template_id' })
  template!: Template;

  @OneToMany(() => PedidoServicio, (ps) => ps.pedido, { cascade: true })
  pedidoServicios!: PedidoServicio[];

  @OneToOne(() => Invitacion, (inv) => inv.pedido)
  invitacion!: Invitacion;
}
