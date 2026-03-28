import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invitacion } from '../../entities/invitacion.entity';

import {
  InvitacionPublicDto,
  CountdownResponseDto,
} from './dto/invitacion.dto';

import { mapearInvitacionPublica } from './helpers/invitacion.mapper';

@Injectable()
export class InvitacionesPublicService {

  constructor(
    @InjectRepository(Invitacion)
    private readonly invitacionRepo: Repository<Invitacion>,
  ) { }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/public — Vista pública del invitado
  // ═══════════════════════════════════════════

  async obtenerPublica(
    id: string,
    invitadoParam?: string,
  ): Promise<InvitacionPublicDto> {
    const invitacion = await this.invitacionRepo.findOne({
      where: { id, activa: true },
      relations: [
        'template',
        'tipoEvento',
        'invitacionServicios',
        'invitacionServicios.servicio',
        'fotosAnfitrion',
        'musica',
        'historias',
      ],
    });

    if (!invitacion) {
      throw new NotFoundException('Invitación no encontrada o no está activa.');
    }

    return mapearInvitacionPublica(invitacion, invitadoParam);
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/countdown — Cuenta regresiva
  // ═══════════════════════════════════════════

  async obtenerCountdown(id: string): Promise<CountdownResponseDto> {
  const invitacion = await this.invitacionRepo.findOne({
    where: { id, activa: true },
    select: ['id', 'fechaEvento', 'horaEvento', 'titulo'],
  });

  if (!invitacion) {
    throw new NotFoundException('Invitación no encontrada o no está activa.');
  }

  const fechaStr = invitacion.fechaEvento instanceof Date
    ? invitacion.fechaEvento.toISOString().split('T')[0]
    : String(invitacion.fechaEvento);

  const hora = invitacion.horaEvento.length === 5
    ? `${invitacion.horaEvento}:00`
    : invitacion.horaEvento;

  // Retornar el timestamp ISO completo — el frontend calcula el countdown
  const fechaHoraEventoISO = `${fechaStr}T${hora}-03:00`;

  return {
    titulo: invitacion.titulo,
    fechaEvento: invitacion.fechaEvento,
    horaEvento: invitacion.horaEvento,
    fechaHoraEventoISO,
    eventoFinalizado: new Date(fechaHoraEventoISO).getTime() <= Date.now(),
  };
}
}