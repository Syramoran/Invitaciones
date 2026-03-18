import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Invitacion } from './invitacion.entity';
import { Servicio } from './servicio.entity';

@Entity('invitacion_servicio')
export class InvitacionServicio {
  @PrimaryColumn({ type: 'uuid', name: 'invitacion_id' })
  invitacionId!: string;

  @PrimaryColumn({ type: 'int', name: 'servicio_id' })
  servicioId!: number;

  @Column({ type: 'boolean', default: true })
  habilitado!: boolean;

  // ── Relaciones ──

  @ManyToOne(() => Invitacion, (inv) => inv.invitacionServicios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitacion_id' })
  invitacion!: Invitacion;

  @ManyToOne(() => Servicio, (serv) => serv.invitacionServicios)
  @JoinColumn({ name: 'servicio_id' })
  servicio!: Servicio;
}
