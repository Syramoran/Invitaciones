import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';

@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'pedido_id' })
  pedidoId!: number;

  @Column({ type: 'varchar', length: 255, name: 'mp_payment_id' })
  mpPaymentId!: string;

  @Column({ type: 'varchar', length: 50, name: 'mp_status' })
  mpStatus!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto!: number;

  /** Payload completo del webhook — para auditoría y debugging */
  @Column({ type: 'jsonb', nullable: true, name: 'raw_data' })
  rawData!: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  // ── Relaciones ──

  @ManyToOne(() => Pedido, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido!: Pedido;
}
