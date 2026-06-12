import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';

@Entity('login_attempt')
@Index('idx_login_attempt_ip', ['ip'], { unique: true })
@Index('idx_login_attempt_locked_until', ['lockedUntil'])
export class LoginAttempt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 45 })
  ip!: string;

  @Column({ type: 'int', default: 1, name: 'attempt_count' })
  attemptCount!: number;

  @Column({ type: 'timestamp', nullable: true, name: 'locked_until' })
  lockedUntil!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
