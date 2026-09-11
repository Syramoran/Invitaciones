import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invitacion } from '../../entities/invitacion.entity';
import { Invitado } from '../../entities/invitado.entity';
import { Grupo } from '../../entities/grupo.entity';
import { toSlug } from '../../common/utils/slug.util';

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

    @InjectRepository(Invitado)
    private readonly invitadoRepo: Repository<Invitado>,

    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
  ) { }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/public — Vista pública del invitado o grupo
  // Query: ?invitado=slug  o  ?grupo=slug (namespaces separados)
  // ═══════════════════════════════════════════

  async obtenerPublica(
    id: string,
    invitadoParam?: string,
    grupoParam?: string,
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

    let invitadoEncontrado: Invitado | null = null;
    let plusOneEncontrado: Invitado | null = null;
    if (invitadoParam) {
      invitadoEncontrado = await this.invitadoRepo.findOne({
        where: { invitacionId: id, slug: toSlug(invitadoParam) },
      });
      if (invitadoEncontrado) {
        plusOneEncontrado = await this.invitadoRepo.findOne({
          where: { invitacionId: id, invitadoPrincipalId: invitadoEncontrado.id },
        });
      }
    }

    let grupoEncontrado: Grupo | null = null;
    let integrantesGrupo: Invitado[] = [];
    if (grupoParam) {
      grupoEncontrado = await this.grupoRepo.findOne({
        where: { invitacionId: id, slug: toSlug(grupoParam) },
      });
      if (!grupoEncontrado) {
        throw new NotFoundException('Grupo no encontrado.');
      }
      integrantesGrupo = await this.invitadoRepo.find({
        where: { invitacionId: id, grupoId: grupoEncontrado.id },
        order: { apellido: 'ASC', nombre: 'ASC' },
      });
    }

    return mapearInvitacionPublica(invitacion, {
      invitadoParam,
      invitadoEncontrado,
      plusOneEncontrado,
      grupoParam,
      grupoEncontrado,
      integrantesGrupo,
    });
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