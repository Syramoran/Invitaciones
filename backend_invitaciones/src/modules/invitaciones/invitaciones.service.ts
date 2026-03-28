import {
  Injectable,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Invitacion } from '../../entities/invitacion.entity';
import { Pedido, EstadoPedido } from '../../entities/pedido.entity';
import { InvitacionServicio } from '../../entities/invitacion-servicio.entity';
import { FotoAnfitrion } from '../../entities/foto-anfitrion.entity';
import { LogEliminacion } from '../../entities/log-eliminacion.entity';

import { TipoEventoService } from '../tipos-evento/tipos-evento.service';
import { TemplatesService } from '../templates/templates.service';
import { ServiciosService } from '../servicios/servicios.service';
import { MusicaService } from '../musica/musica.service';
import { R2StorageService } from '../../common/r2/r2-storage.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

import {
  CreateInvitacionDto,
  UpdateInvitacionDto,
  InvitacionQueryDto,
  InvitacionResponseDto,
  PaginatedInvitacionesDto,
} from './dto/invitacion.dto';

import {
  mapearInvitacionResponse,
  extraerServicios,
  calcularFechaExpiracion,
} from './helpers/invitacion.mapper';

@Injectable()
export class InvitacionesService {
  private readonly logger = new Logger(InvitacionesService.name);

  constructor(
    @InjectRepository(Invitacion)
    private readonly invitacionRepo: Repository<Invitacion>,

    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,

    @InjectRepository(FotoAnfitrion)
    private readonly fotoAnfitrionRepo: Repository<FotoAnfitrion>,

    @InjectRepository(LogEliminacion)
    private readonly logEliminacionRepo: Repository<LogEliminacion>,

    private readonly dataSource: DataSource,

    private readonly tipoEventoService: TipoEventoService,
    private readonly templatesService: TemplatesService,
    private readonly serviciosService: ServiciosService,
    private readonly r2StorageService: R2StorageService,
    private readonly notificacionesService: NotificacionesService,

    @Inject(forwardRef(() => MusicaService))
    private readonly musicaService: MusicaService,
  ) {}

  // ═══════════════════════════════════════════
  // POST /invitaciones — Crear invitación (admin, JWT)
  // ═══════════════════════════════════════════

  async crear(
    dto: CreateInvitacionDto,
    fotosAnfitrion?: Express.Multer.File[],
    archivoMusica?: Express.Multer.File,
  ): Promise<InvitacionResponseDto> {
    // 1. Validar entidades relacionadas
    const pedido = await this.validarPedido(dto.pedidoId);
    const tipoEvento = await this.validarTipoEvento(dto.tipoEventoId);
    const template = await this.validarTemplate(dto.templateId, dto.tipoEventoId);
    const serviciosValidados = await this.validarServicios(dto.serviciosIds);

    // 2. Transacción: crear invitación + servicios + actualizar pedido
    const invitacion = await this.dataSource.transaction(async (manager) => {
      const nueva = manager.create(Invitacion, {
        pedidoId: dto.pedidoId,
        templateId: dto.templateId,
        tipoEventoId: dto.tipoEventoId,
        titulo: dto.titulo,
        fechaEvento: dto.fechaEvento,
        horaEvento: dto.horaEvento,
        ubicacion: dto.ubicacion,
        direccion: dto.direccion,
        latitud: dto.latitud,
        longitud: dto.longitud,
        colorPrimario: dto.colorPrimario,
        contrasenaAsistentes: dto.contrasenaAsistentes,
        maxFotos: dto.maxFotos ?? 1000,
        camposEspecificos: dto.camposEspecificos,
        fechaExpiracion: calcularFechaExpiracion(dto.fechaEvento),
        activa: true,
      } as Partial<Invitacion>);

      const guardada = await manager.save(Invitacion, nueva);

      if (serviciosValidados.length > 0) {
        const registros = serviciosValidados.map((s) =>
          manager.create(InvitacionServicio, {
            invitacionId: guardada.id,
            servicioId: s.id,
            habilitado: true,
          }),
        );
        await manager.save(InvitacionServicio, registros);
      }

      pedido.estado = EstadoPedido.COMPLETADO;
      await manager.save(Pedido, pedido);

      return guardada;
    });

    // 3. Subir archivos (fuera de la transacción)
    if (fotosAnfitrion && fotosAnfitrion.length > 0) {
      await this.subirFotosAnfitrion(invitacion.id, fotosAnfitrion);
    }

    if (archivoMusica) {
      await this.musicaService.subir(invitacion.id, archivoMusica);
    }

    this.logger.log(
      `✅ Invitación creada — ID: ${invitacion.id} | ` +
      `Pedido: #${dto.pedidoId} | Evento: ${tipoEvento.nombre} | ` +
      `Template: ${template.nombre}`,
    );

    return mapearInvitacionResponse(
      invitacion,
      tipoEvento.nombre,
      template.nombre,
      serviciosValidados.map((s) => ({ servicioId: s.id, nombre: s.nombre, habilitado: true })),
    );
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones — Listar invitaciones (admin, JWT)
  // ═══════════════════════════════════════════

  async listar(query: InvitacionQueryDto): Promise<PaginatedInvitacionesDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.invitacionRepo
      .createQueryBuilder('invitacion')
      .leftJoinAndSelect('invitacion.tipoEvento', 'tipoEvento')
      .leftJoinAndSelect('invitacion.template', 'template')
      .leftJoinAndSelect('invitacion.invitacionServicios', 'is')
      .leftJoinAndSelect('is.servicio', 'servicio')
      .orderBy('invitacion.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.activa !== undefined) {
      qb.andWhere('invitacion.activa = :activa', { activa: query.activa });
    }
    if (query.tipoEventoId) {
      qb.andWhere('invitacion.tipoEventoId = :tipoEventoId', {
        tipoEventoId: query.tipoEventoId,
      });
    }

    const [invitaciones, total] = await qb.getManyAndCount();

    return {
      data: invitaciones.map((inv) =>
        mapearInvitacionResponse(
          inv,
          inv.tipoEvento?.nombre ?? '',
          inv.template?.nombre ?? '',
          extraerServicios(inv),
        ),
      ),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id — Obtener invitación completa (admin, JWT)
  // ═══════════════════════════════════════════

  async obtenerPorId(id: string): Promise<InvitacionResponseDto> {
    const invitacion = await this.invitacionRepo.findOne({
      where: { id },
      relations: [
        'tipoEvento',
        'template',
        'invitacionServicios',
        'invitacionServicios.servicio',
        'historias',
        'fotosAnfitrion',
        'musica',
        'invitados',
      ],
    });

    if (!invitacion) {
      throw new NotFoundException(`Invitación ${id} no encontrada.`);
    }

    return mapearInvitacionResponse(
      invitacion,
      invitacion.tipoEvento?.nombre ?? '',
      invitacion.template?.nombre ?? '',
      extraerServicios(invitacion),
    );
  }

  // ═══════════════════════════════════════════
  // PUT /invitaciones/:id — Actualizar invitación (admin, JWT)
  // ═══════════════════════════════════════════

  async actualizar(
    id: string,
    dto: UpdateInvitacionDto,
  ): Promise<InvitacionResponseDto> {
    const invitacion = await this.invitacionRepo.findOne({
      where: { id },
    });

    if (!invitacion) {
      throw new NotFoundException(`Invitación ${id} no encontrada.`);
    }

    // Validar template si se cambia
    if (dto.templateId && dto.templateId !== invitacion.templateId) {
      await this.validarTemplate(
        dto.templateId,
        dto.tipoEventoId ?? invitacion.tipoEventoId,
      );
    }

    // Validar tipo de evento si se cambia
    if (dto.tipoEventoId && dto.tipoEventoId !== invitacion.tipoEventoId) {
      await this.validarTipoEvento(dto.tipoEventoId);
    }

    // Recalcular expiración si cambia la fecha
    if (dto.fechaEvento && dto.fechaEvento !== invitacion.fechaEvento) {
      invitacion.fechaExpiracion = calcularFechaExpiracion(dto.fechaEvento);
    }

    // Actualizar servicios si se envían
    if (dto.serviciosIds) {
      await this.actualizarServicios(id, dto.serviciosIds);
    }

    const { serviciosIds, ...campos } = dto;
    Object.assign(invitacion, campos);
    await this.invitacionRepo.save(invitacion);

    return this.obtenerPorId(id);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id — Eliminar invitación (admin, JWT)
  // ═══════════════════════════════════════════

  async eliminar(id: string): Promise<void> {
    const invitacion = await this.invitacionRepo.findOne({
      where: { id },
      relations: ['fotos', 'fotosAnfitrion', 'musica'],
    });

    if (!invitacion) {
      throw new NotFoundException(`Invitación ${id} no encontrada.`);
    }

    const fotosGaleria = invitacion.fotos?.length ?? 0;
    const fotosAnfitrion = invitacion.fotosAnfitrion?.length ?? 0;
    const fotosEliminadas = fotosGaleria + fotosAnfitrion;

    // 1. Eliminar archivos de R2
    await this.r2StorageService.eliminarCarpetaInvitacion(invitacion.id);

    // 2. Log de auditoría
    await this.logEliminacionRepo.save(
      this.logEliminacionRepo.create({
        invitacionIdRef: invitacion.id,
        fotosEliminadas,
        detalles:
          `Eliminación manual — Título: ${invitacion.titulo} | ` +
          `Galería: ${fotosGaleria} | Anfitrión: ${fotosAnfitrion} | ` +
          `Música: ${invitacion.musica ? 'sí' : 'no'}`,
      }),
    );

    // 3. Notificación (fire-and-forget)
    this.notificacionesService
      .registrarEliminacion({
        invitacionId: invitacion.id,
        titulo: invitacion.titulo,
        fotosEliminadas,
      })
      .catch((err) =>
        this.logger.error(`Error en notificación de eliminación: ${err.message}`),
      );

    // 4. Hard delete (CASCADE elimina tablas hijas)
    await this.invitacionRepo.remove(invitacion);

    this.logger.log(
      `🗑️ Invitación eliminada — ID: ${id} | Fotos: ${fotosEliminadas}`,
    );
  }

  // ═══════════════════════════════════════════
  // Método público — Usado por sub-módulos
  // ═══════════════════════════════════════════

  async buscarInvitacionOFail(id: string): Promise<Invitacion> {
    const invitacion = await this.invitacionRepo.findOne({ where: { id } });

    if (!invitacion) {
      throw new NotFoundException(`Invitación ${id} no encontrada.`);
    }

    return invitacion;
  }

  // ═══════════════════════════════════════════
  // Validaciones privadas
  // ═══════════════════════════════════════════

  private async validarPedido(pedidoId: number): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOneBy({ id: pedidoId });
    if (!pedido) {
      throw new UnprocessableEntityException(`Pedido #${pedidoId} no encontrado.`);
    }
    return pedido;
  }

  private async validarTipoEvento(tipoEventoId: number) {
    const tipoEvento = await this.tipoEventoService.findById(tipoEventoId);
    if (!tipoEvento.activo) {
      throw new UnprocessableEntityException(
        'El tipo de evento seleccionado no está activo.',
      );
    }
    return tipoEvento;
  }

  private async validarTemplate(templateId: number, tipoEventoId: number) {
    const template = await this.templatesService.findById(templateId);
    if (!template.activo) {
      throw new UnprocessableEntityException(
        'El template seleccionado no está activo.',
      );
    }
    if (template.tipoEventoId !== tipoEventoId) {
      throw new UnprocessableEntityException(
        'El template no corresponde al tipo de evento seleccionado.',
      );
    }
    return template;
  }

  private async validarServicios(ids?: number[]) {
    if (!ids || ids.length === 0) return [];
    const { desglose } = await this.serviciosService.calcularPrecio(ids);
    return desglose;
  }

  // ═══════════════════════════════════════════
  // Operaciones privadas
  // ═══════════════════════════════════════════

  private async subirFotosAnfitrion(
    invitacionId: string,
    archivos: Express.Multer.File[],
  ): Promise<void> {
    const fotosASubir = archivos.slice(0, 5); // máx 5

    for (let i = 0; i < fotosASubir.length; i++) {
      const resultado = await this.r2StorageService.subirFotoAnfitrion(
        invitacionId,
        fotosASubir[i],
        i + 1,
      );

      await this.fotoAnfitrionRepo.save(
        this.fotoAnfitrionRepo.create({
          invitacionId,
          url: resultado.url,
          orden: i + 1,
          tamano: resultado.tamano,
        }),
      );
    }

    this.logger.log(
      `📷 ${fotosASubir.length} fotos del anfitrión subidas — Invitación: ${invitacionId}`,
    );
  }

  private async actualizarServicios(
    invitacionId: string,
    serviciosIds: number[],
  ): Promise<void> {
    const validados = await this.validarServicios(serviciosIds);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(InvitacionServicio, { invitacionId });

      if (validados.length > 0) {
        const nuevos = validados.map((s) =>
          manager.create(InvitacionServicio, {
            invitacionId,
            servicioId: s.id,
            habilitado: true,
          }),
        );
        await manager.save(InvitacionServicio, nuevos);
      }
    });
  }
}