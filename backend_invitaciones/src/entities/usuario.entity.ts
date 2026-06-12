import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Invitacion } from './invitacion.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE',
}

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.ADMIN,
  })
  role!: UserRole;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'nombre_completo' })
  nombreCompleto!: string;

  @Column({ type: 'boolean', default: false })
  verificado!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'token_verificacion' })
  tokenVerificacion!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'token_recuperacion' })
  tokenRecuperacion!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  // ── Relaciones ──
  @OneToMany(() => Pedido, (p) => p.usuario)
  pedidos!: Pedido[];

  @OneToMany(() => Invitacion, (i) => i.usuario)
  invitaciones!: Invitacion[];
}
