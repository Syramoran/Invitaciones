import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Grupo } from '../../entities/grupo.entity';
import { Invitado } from '../../entities/invitado.entity';
import { toSlug, generarSlugUnico } from '../../common/utils/slug.util';

import {
  CrearGrupoDto,
  ActualizarGrupoDto,
  IntegranteGrupoDto,
  GrupoResponseDto,
  IntegranteResponseDto,
  ConfirmarGrupoDto,
  ConfirmacionGrupoResponseDto,
} from './dto/grupo.dto';

@Injectable()
export class GruposService {
  private readonly logger = new Logger(GruposService.name);

  constructor(
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,

    @InjectRepository(Invitado)
    private readonly invitadoRepo: Repository<Invitado>,

    private readonly configService: ConfigService,
  ) {}

  // ═══════════════════════════════════════════
  // GET — Listado de grupos de una invitación (uso interno, ver InvitadosService)
  // ═══════════════════════════════════════════

  async listarPorInvitacion(invitacionId: string): Promise<GrupoResponseDto[]> {
    const grupos = await this.grupoRepo.find({
      where: { invitacionId },
      order: { nombre: 'ASC' },
    });

    const integrantesPorGrupo = await this.invitadoRepo.find({
      where: { invitacionId },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });

    return grupos.map((g) =>
      this.mapearResponse(
        g,
        integrantesPorGrupo.filter((i) => i.grupoId === g.id),
      ),
    );
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/asistentes/grupos — Crear grupo (contraseña del evento)
  // ═══════════════════════════════════════════

  async crear(invitacionId: string, dto: CrearGrupoDto): Promise<GrupoResponseDto> {
    const maxEfectivo = dto.maxIntegrantes ?? null;
    if (dto.integrantes?.length && maxEfectivo !== null && dto.integrantes.length > maxEfectivo) {
      throw new BadRequestException(
        `El grupo no puede tener más de ${maxEfectivo} integrantes.`,
      );
    }

    const yaUsados = await this.slugsUsadosGrupo(invitacionId);
    const slug = generarSlugUnico(dto.nombre, yaUsados);

    const grupo = this.grupoRepo.create({
      invitacionId,
      nombre: dto.nombre,
      slug,
      maxIntegrantes: dto.maxIntegrantes ?? null,
    });
    const grupoGuardado = await this.grupoRepo.save(grupo);

    let integrantes: Invitado[] = [];
    if (dto.integrantes?.length) {
      const nuevos = dto.integrantes.map((item) =>
        this.invitadoRepo.create({
          invitacionId,
          nombre: item.nombre,
          apellido: item.apellido,
          grupoId: grupoGuardado.id,
          confirmado: false,
        }),
      );
      integrantes = await this.invitadoRepo.save(nuevos);
    }

    this.logger.log(
      `👨‍👩‍👧 Grupo creado — Invitación: ${invitacionId} | Grupo: ${grupoGuardado.nombre} | ` +
      `Integrantes iniciales: ${integrantes.length}`,
    );

    return this.mapearResponse(grupoGuardado, integrantes);
  }

  // ═══════════════════════════════════════════
  // PATCH /invitaciones/:id/asistentes/grupos/:grupoId — Actualizar grupo
  // ═══════════════════════════════════════════

  async actualizar(
    invitacionId: string,
    grupoId: number,
    dto: ActualizarGrupoDto,
  ): Promise<GrupoResponseDto> {
    const grupo = await this.buscarGrupoOFail(invitacionId, grupoId);

    if (dto.maxIntegrantes !== undefined) {
      const cantidadActual = await this.invitadoRepo.count({ where: { grupoId } });
      if (cantidadActual > dto.maxIntegrantes) {
        throw new BadRequestException(
          `El grupo ya tiene ${cantidadActual} integrantes, no se puede bajar el máximo a ${dto.maxIntegrantes}.`,
        );
      }
      grupo.maxIntegrantes = dto.maxIntegrantes;
    }
    if (dto.nombre !== undefined) grupo.nombre = dto.nombre;
    if (dto.invitacionEnviada !== undefined) grupo.invitacionEnviada = dto.invitacionEnviada;
    if (dto.restriccionAlimentaria !== undefined) {
      grupo.restriccionAlimentaria = dto.restriccionAlimentaria;
    }

    const grupoActualizado = await this.grupoRepo.save(grupo);
    const integrantes = await this.invitadoRepo.find({
      where: { grupoId },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });

    this.logger.log(`📝 Grupo actualizado — Invitación: ${invitacionId} | Grupo: #${grupoId}`);

    return this.mapearResponse(grupoActualizado, integrantes);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id/asistentes/grupos/:grupoId — Eliminar grupo
  // Cascada: borra sus integrantes (invitado.grupo_id ON DELETE CASCADE)
  // ═══════════════════════════════════════════

  async eliminar(invitacionId: string, grupoId: number): Promise<void> {
    const grupo = await this.buscarGrupoOFail(invitacionId, grupoId);
    await this.grupoRepo.remove(grupo);

    this.logger.log(`🗑️ Grupo eliminado — Invitación: ${invitacionId} | Grupo: #${grupoId}`);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/asistentes/grupos/:grupoId/integrantes — Agregar integrante
  // ═══════════════════════════════════════════

  async agregarIntegrante(
    invitacionId: string,
    grupoId: number,
    dto: IntegranteGrupoDto,
  ): Promise<IntegranteResponseDto> {
    const grupo = await this.buscarGrupoOFail(invitacionId, grupoId);

    const maxEfectivo = grupo.maxIntegrantes ?? null;
    const cantidadActual = await this.invitadoRepo.count({ where: { grupoId } });

    if (maxEfectivo !== null && cantidadActual >= maxEfectivo) {
      throw new BadRequestException(
        `El grupo ya alcanzó el máximo de ${maxEfectivo} integrantes.`,
      );
    }

    const integrante = this.invitadoRepo.create({
      invitacionId,
      nombre: dto.nombre,
      apellido: dto.apellido,
      grupoId,
      confirmado: false,
    });
    const integranteGuardado = await this.invitadoRepo.save(integrante);

    this.logger.log(
      `➕ Integrante agregado — Invitación: ${invitacionId} | Grupo: #${grupoId} | ` +
      `${integranteGuardado.nombre} ${integranteGuardado.apellido}`,
    );

    return this.mapearIntegrante(integranteGuardado);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id/asistentes/grupos/:grupoId/integrantes/:invitadoId
  // ═══════════════════════════════════════════

  async eliminarIntegrante(
    invitacionId: string,
    grupoId: number,
    invitadoId: number,
  ): Promise<void> {
    await this.buscarGrupoOFail(invitacionId, grupoId);

    const integrante = await this.invitadoRepo.findOne({
      where: { id: invitadoId, grupoId },
    });

    if (!integrante) {
      throw new NotFoundException(
        `Integrante #${invitadoId} no encontrado en el grupo #${grupoId}.`,
      );
    }

    await this.invitadoRepo.remove(integrante);

    this.logger.log(
      `➖ Integrante eliminado — Invitación: ${invitacionId} | Grupo: #${grupoId} | Invitado: #${invitadoId}`,
    );
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/grupos/confirmar — Confirmar asistencia de grupo (público)
  // ═══════════════════════════════════════════

  async confirmar(
    invitacionId: string,
    dto: ConfirmarGrupoDto,
  ): Promise<ConfirmacionGrupoResponseDto> {
    const grupo = await this.grupoRepo.findOne({
      where: { invitacionId, slug: toSlug(dto.grupoSlug) },
    });
    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado.');
    }

    const integrantesActuales = await this.invitadoRepo.find({
      where: { invitacionId, grupoId: grupo.id },
    });

    const idsConfirmar = new Set(dto.integrantesConfirmados ?? []);
    const nuevos = dto.integrantesNuevos ?? [];

    // Validar TODO antes de persistir nada.
    for (const id of idsConfirmar) {
      if (!integrantesActuales.some((i) => i.id === id)) {
        throw new BadRequestException(
          `El integrante #${id} no pertenece a este grupo.`,
        );
      }
    }

    const maxEfectivo = grupo.maxIntegrantes ?? null;
    const totalFinal = integrantesActuales.length + nuevos.length;
    if (maxEfectivo !== null && totalFinal > maxEfectivo) {
      throw new BadRequestException(
        `El grupo no puede tener más de ${maxEfectivo} integrantes.`,
      );
    }

    // Marcar confirmados a los precargados seleccionados.
    const paraConfirmar = integrantesActuales.filter((i) => idsConfirmar.has(i.id));
    for (const integrante of paraConfirmar) {
      integrante.confirmado = true;
      integrante.fechaConfirmacion ??= new Date();
    }
    if (paraConfirmar.length > 0) {
      await this.invitadoRepo.save(paraConfirmar);
    }

    // Crear los nuevos, ya confirmados.
    if (nuevos.length > 0) {
      await this.invitadoRepo.save(
        nuevos.map((item) =>
          this.invitadoRepo.create({
            invitacionId,
            nombre: item.nombre,
            apellido: item.apellido,
            grupoId: grupo.id,
            confirmado: true,
            fechaConfirmacion: new Date(),
          }),
        ),
      );
    }

    // Restricción alimentaria: un solo campo para todo el grupo.
    if (dto.restriccionAlimentaria !== undefined) {
      grupo.restriccionAlimentaria = dto.restriccionAlimentaria;
      await this.grupoRepo.save(grupo);
    }

    const integrantesFinales = await this.invitadoRepo.find({
      where: { invitacionId, grupoId: grupo.id },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });

    this.logger.log(
      `✅ Grupo confirmado — Invitación: ${invitacionId} | Grupo: ${grupo.nombre} | ` +
      `Confirmados: ${paraConfirmar.length} | Nuevos: ${nuevos.length}`,
    );

    return {
      mensaje: '¡Asistencia del grupo confirmada exitosamente!',
      grupo: this.mapearResponse(grupo, integrantesFinales),
    };
  }

  // ═══════════════════════════════════════════
  // Métodos privados
  // ═══════════════════════════════════════════

  private async buscarGrupoOFail(invitacionId: string, grupoId: number): Promise<Grupo> {
    const grupo = await this.grupoRepo.findOne({ where: { id: grupoId, invitacionId } });

    if (!grupo) {
      throw new NotFoundException(
        `Grupo #${grupoId} no encontrado para la invitación ${invitacionId}.`,
      );
    }

    return grupo;
  }

  private async slugsUsadosGrupo(invitacionId: string): Promise<Set<string>> {
    const grupos = await this.grupoRepo.find({
      where: { invitacionId },
      select: ['slug'],
    });
    return new Set(grupos.map((g) => g.slug));
  }

  private mapearResponse(grupo: Grupo, integrantes: Invitado[]): GrupoResponseDto {
    return {
      id: grupo.id,
      nombre: grupo.nombre,
      slug: grupo.slug,
      maxIntegrantes: grupo.maxIntegrantes,
      restriccionAlimentaria: grupo.restriccionAlimentaria,
      invitacionEnviada: grupo.invitacionEnviada,
      urlPersonalizada: this.generarUrlPersonalizada(grupo.invitacionId, grupo.slug),
      integrantes: integrantes.map((i) => this.mapearIntegrante(i)),
    };
  }

  /**
   * URL pública del grupo (?grupo=slug) — mismo formato que
   * InvitadosService.generarUrlPersonalizada para individuales (?invitado=slug).
   */
  private generarUrlPersonalizada(invitacionId: string, slug: string): string {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'https://invitaciones.com',
    );
    return `${baseUrl}/${invitacionId}?grupo=${encodeURIComponent(slug)}`;
  }

  private mapearIntegrante(invitado: Invitado): IntegranteResponseDto {
    return {
      id: invitado.id,
      nombre: invitado.nombre,
      apellido: invitado.apellido,
      confirmado: invitado.confirmado,
    };
  }
}
