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
import { Pedido } from './pedido.entity';
import { InvitacionServicio } from './invitacion-servicio.entity';
import { Invitado } from './invitado.entity';
import { HistoriaSeccion } from './historia-seccion.entity';
import { FotoAnfitrion } from './foto-anfitrion.entity';
import { Foto } from './foto.entity';
import { Musica } from './musica.entity';

@Entity('invitacion')
export class Invitacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', nullable: true, name: 'pedido_id' })
  pedidoId!: number;

  @Column({ type: 'int', name: 'template_id' })
  templateId!: number;

  @Column({ type: 'int', name: 'tipo_evento_id' })
  tipoEventoId!: number;

  @Column({ type: 'varchar', length: 200 })
  titulo!: string;

  @Column({ type: 'date', name: 'fecha_evento' })
  fechaEvento!: Date;

  @Column({ type: 'time', name: 'hora_evento' })
  horaEvento!: string;

  @Column({ type: 'varchar', length: 300 })
  ubicacion!: string;

  @Column({ type: 'varchar', length: 500 })
  direccion!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitud!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitud!: number;

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'color_primario' })
  colorPrimario!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'contrasena_asistentes',
  })
  contrasenaAsistentes!: string;

  @Column({ type: 'int', default: 1000, name: 'max_fotos' })
  maxFotos!: number;

  @Column({ type: 'jsonb', nullable: true, name: 'campos_especificos' })
  camposEspecificos!: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  activa!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ type: 'date', name: 'fecha_expiracion' })
  fechaExpiracion!: Date;

  // ── Relaciones ──

  @ManyToOne(() => Pedido, (pedido) => pedido.invitacion)
  @JoinColumn({ name: 'pedido_id' })
  pedido!: Pedido;

  @ManyToOne(() => Template, (template) => template.invitaciones)
  @JoinColumn({ name: 'template_id' })
  template!: Template;

  @ManyToOne(() => TipoEvento, (tipo) => tipo.invitaciones)
  @JoinColumn({ name: 'tipo_evento_id' })
  tipoEvento!: TipoEvento;

  @OneToMany(() => InvitacionServicio, (is) => is.invitacion, { cascade: true })
  invitacionServicios!: InvitacionServicio[];

  @OneToMany(() => Invitado, (inv) => inv.invitacion, { cascade: true })
  invitados!: Invitado[];

  @OneToMany(() => HistoriaSeccion, (hs) => hs.invitacion, { cascade: true })
  historias!: HistoriaSeccion[];

  @OneToMany(() => FotoAnfitrion, (fa) => fa.invitacion, { cascade: true })
  fotosAnfitrion!: FotoAnfitrion[];

  @OneToMany(() => Foto, (f) => f.invitacion)
  fotos!: Foto[];

  @OneToOne(() => Musica, (m) => m.invitacion, { cascade: true })
  musica!: Musica;
}
