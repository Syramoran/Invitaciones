import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('codigos_descuento')
export class CodigoDescuento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 50 })
  codigo!: string;

  @Column('decimal', { precision: 5, scale: 2 })
  porcentaje!: number;

  @Column({ default: true })
  activo!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion!: string | null;

  @Column({ name: 'fecha_expiracion', type: 'date', nullable: true })
  fechaExpiracion!: Date | null;

  @Column({ name: 'limite_usos', type: 'int', nullable: true })
  limiteUsos!: number | null;

  @Column({ name: 'usos_actuales', type: 'int', default: 0 })
  usosActuales!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
