import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  ForeignKey,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('password_reset')
@Index('idx_password_reset_usuario_id', ['usuarioId'])
@Index('idx_password_reset_token', ['token'])
export class PasswordReset {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'usuario_id' })
  @ForeignKey(() => Usuario)
  usuarioId!: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ type: 'varchar', length: 255, unique: true })
  token!: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false })
  used!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
