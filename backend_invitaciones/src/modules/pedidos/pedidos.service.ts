import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Pedido, EstadoPedido } from '../../entities/pedido.entity';
import { PedidoServicio } from '../../entities/pedido-servicio.entity';
import { TipoEvento } from '../../entities/tipo-evento.entity';
import { Template } from '../../entities/template.entity';
import { Servicio } from '../../entities/servicio.entity';

import {
  CreatePedidoDto,
  UpdateEstadoPedidoDto,
  PedidoQueryDto,
  PedidoResponseDto,
  PedidoResumenResponseDto,
  PedidoServicioResponseDto,
  PaginatedPedidosDto,
} from './dto/pedido.dto';

// ═══════════════════════════════════════════
// Mapa de transiciones válidas de estado
// PENDIENTE → CONTACTADO → COMPLETADO | CANCELADO
// ═══════════════════════════════════════════
const TRANSICIONES_VALIDAS: Record<EstadoPedido, EstadoPedido[]> = {
  [EstadoPedido.PENDIENTE]: [EstadoPedido.CONTACTADO],
  [EstadoPedido.CONTACTADO]: [EstadoPedido.COMPLETADO, EstadoPedido.CANCELADO],
  [EstadoPedido.COMPLETADO]: [],
  [EstadoPedido.CANCELADO]: [],
};

@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name);

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,

    @InjectRepository(TipoEvento)
    private readonly tipoEventoRepo: Repository<TipoEvento>,

    @InjectRepository(Template)
    private readonly templateRepo: Repository<Template>,

    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,

    // @InjectRepository(PedidoServicio)
    // private readonly pedidoServicioRepo: Repository<PedidoServicio>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  // ═══════════════════════════════════════════
  // POST /pedidos — Crear pedido (público)
  // ═══════════════════════════════════════════

  async crear(dto: CreatePedidoDto): Promise<PedidoResponseDto> {
    // 1. Validar que el tipo de evento exista y esté activo
    const tipoEvento = await this.tipoEventoRepo.findOneBy({
      id: dto.tipoEventoId,
    });
    if (!tipoEvento || !tipoEvento.activo) {
      throw new UnprocessableEntityException(
        'El tipo de evento seleccionado no existe o no está activo.',
      );
    }

    // 2. Validar que el template exista, esté activo y pertenezca al tipo de evento
    const template = await this.templateRepo.findOneBy({
      id: dto.templateId,
    });
    if (!template || !template.activo) {
      throw new UnprocessableEntityException(
        'El template seleccionado no existe o no está activo.',
      );
    }
    if (template.tipoEventoId !== dto.tipoEventoId) {
      throw new UnprocessableEntityException(
        'El template no corresponde al tipo de evento seleccionado.',
      );
    }

    // 3. Validar y obtener servicios seleccionados (si los hay)
    let servicios: Servicio[] = [];
    if (dto.serviciosIds && dto.serviciosIds.length > 0) {
      servicios = await this.servicioRepo.findBy({
        id: In(dto.serviciosIds),
      });

      const inactivos = servicios.filter((s) => !s.activo);
      if (inactivos.length > 0) {
        throw new UnprocessableEntityException(
          `Los siguientes servicios no están activos: ${inactivos.map((s) => s.nombre).join(', ')}`,
        );
      }

      if (servicios.length !== dto.serviciosIds.length) {
        throw new UnprocessableEntityException(
          'Uno o más servicios seleccionados no existen.',
        );
      }
    }

    // 4. Calcular precios
    //    precioBase = precio del template
    //    precioTotal = base + suma de servicios seleccionados
    const precioBase = 30000;
    const sumaServicios = servicios.reduce(
      (acc, s) => acc + (Number(s.precio) || 0),
      0,
    );
    const precioTotal = precioBase + sumaServicios;

    // 5. Transacción: crear pedido + pedido_servicios
    const pedido = await this.dataSource.transaction(async (manager) => {
      const nuevoPedido = manager.create(Pedido, {
        nombreCliente: dto.nombreCliente,
        telefono: dto.telefono,
        email: dto.email,
        tipoEventoId: dto.tipoEventoId,
        templateId: dto.templateId,
        precioBase,
        precioTotal,
        estado: EstadoPedido.PENDIENTE,
      });

      const pedidoGuardado = await manager.save(Pedido, nuevoPedido);

      // Crear registros en PedidoServicio con precio capturado al momentoñ
      if (servicios.length > 0) {
        const pedidoServicios = servicios.map((servicio) =>
          manager.create(PedidoServicio, {
            pedidoId: pedidoGuardado.id,
            servicioId: servicio.id,
            precioAlMomento: Number(servicio.precio),
          }),
        );
        await manager.save(PedidoServicio, pedidoServicios);
      }

      return pedidoGuardado;
    });

    // 6. Enviar notificación por email al propietario (fire-and-forget)
    this.enviarNotificacionNuevoPedido(pedido, tipoEvento.nombre, template.nombre)
      .catch((err) =>
        this.logger.error(`Error enviando email de nuevo pedido #${pedido.id}: ${err.message}`),
      );

    // 7. Mapear y retornar response
    return this.mapearPedidoResponse(
      pedido,
      tipoEvento.nombre,
      template.nombre,
      servicios.map((s) => ({
        servicioId: s.id,
        nombre: s.nombre,
        precioAlMomento: Number(s.precio),
      })),
    );
  }

  // ═══════════════════════════════════════════
  // GET /pedidos — Listar pedidos (admin, JWT)
  // ═══════════════════════════════════════════

  async listar(query: PedidoQueryDto): Promise<PaginatedPedidosDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.pedidoRepo
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.tipoEvento', 'tipoEvento')
      .leftJoinAndSelect('pedido.template', 'template')
      .leftJoinAndSelect('pedido.pedidoServicios', 'ps')
      .leftJoinAndSelect('ps.servicio', 'servicio')
      .orderBy('pedido.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.estado) {
      qb.andWhere('pedido.estado = :estado', { estado: query.estado });
    }

    const [pedidos, total] = await qb.getManyAndCount();

    const data = pedidos.map((p) =>
      this.mapearPedidoResponse(
        p,
        p.tipoEvento?.nombre ?? '',
        p.template?.nombre ?? '',
        (p.pedidoServicios ?? []).map((ps) => ({
          servicioId: ps.servicioId,
          nombre: ps.servicio?.nombre ?? '',
          precioAlMomento: Number(ps.precioAlMomento),
        })),
      ),
    );

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ═══════════════════════════════════════════
  // GET /pedidos/:id — Obtener pedido (admin, JWT)
  // ═══════════════════════════════════════════

  async obtenerPorId(id: number): Promise<PedidoResponseDto> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
      relations: [
        'tipoEvento',
        'template',
        'pedidoServicios',
        'pedidoServicios.servicio',
      ],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${id} no encontrado.`);
    }

    return this.mapearPedidoResponse(
      pedido,
      pedido.tipoEvento?.nombre ?? '',
      pedido.template?.nombre ?? '',
      (pedido.pedidoServicios ?? []).map((ps) => ({
        servicioId: ps.servicioId,
        nombre: ps.servicio?.nombre ?? '',
        precioAlMomento: Number(ps.precioAlMomento),
      })),
    );
  }

  // ═══════════════════════════════════════════
  // PATCH /pedidos/:id/estado — Cambiar estado (admin, JWT)
  // Transiciones: PENDIENTE → CONTACTADO → COMPLETADO | CANCELADO
  // ═══════════════════════════════════════════

  async cambiarEstado(
    id: number,
    dto: UpdateEstadoPedidoDto,
  ): Promise<PedidoResponseDto> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
      relations: [
        'tipoEvento',
        'template',
        'pedidoServicios',
        'pedidoServicios.servicio',
      ],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${id} no encontrado.`);
    }

    // Validar transición de estado
    const transicionesPermitidas = TRANSICIONES_VALIDAS[pedido.estado];
    if (!transicionesPermitidas.includes(dto.estado)) {
      throw new ConflictException(
        `No se puede cambiar de ${pedido.estado} a ${dto.estado}. ` +
        `Transiciones válidas desde ${pedido.estado}: ${transicionesPermitidas.length > 0 ? transicionesPermitidas.join(', ') : 'ninguna (estado final)'}.`,
      );
    }

    pedido.estado = dto.estado;
    const pedidoActualizado = await this.pedidoRepo.save(pedido);

    return this.mapearPedidoResponse(
      pedidoActualizado,
      pedido.tipoEvento?.nombre ?? '',
      pedido.template?.nombre ?? '',
      (pedido.pedidoServicios ?? []).map((ps) => ({
        servicioId: ps.servicioId,
        nombre: ps.servicio?.nombre ?? '',
        precioAlMomento: Number(ps.precioAlMomento),
      })),
    );
  }

  // ═══════════════════════════════════════════
  // GET /pedidos/:id/resumen — Resumen público
  // ═══════════════════════════════════════════

  async obtenerResumen(id: number): Promise<PedidoResumenResponseDto> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
      relations: [
        'tipoEvento',
        'template',
        'pedidoServicios',
        'pedidoServicios.servicio',
      ],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${id} no encontrado.`);
    }

    // Generar link de WhatsApp Business con datos del pedido
    const whatsappNumber = this.configService.get<string>('WHATSAPP_NUMBER', '');
    const mensaje = encodeURIComponent(
      `¡Hola! Soy ${pedido.nombreCliente}. Acabo de realizar el pedido #${pedido.id} ` +
      `para ${pedido.tipoEvento?.nombre ?? 'mi evento'}. ` +
      `Template: ${pedido.template?.nombre ?? ''}. ` +
      `Precio total: $${pedido.precioTotal}. ¡Quedo a la espera!`,
    );
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${mensaje}`;

    return {
      id: pedido.id,
      nombreCliente: pedido.nombreCliente,
      tipoEvento: pedido.tipoEvento?.nombre ?? '',
      template: pedido.template?.nombre ?? '',
      precioBase: Number(pedido.precioBase),
      precioTotal: Number(pedido.precioTotal),
      servicios: (pedido.pedidoServicios ?? []).map((ps) => ({
        nombre: ps.servicio?.nombre ?? '',
        precio: Number(ps.precioAlMomento),
      })),
      estado: pedido.estado,
      whatsappLink,
    };
  }

  // ═══════════════════════════════════════════
  // Métodos privados
  // ═══════════════════════════════════════════

  /**
   * Mapea una entidad Pedido a PedidoResponseDto.
   */
  private mapearPedidoResponse(
    pedido: Pedido,
    tipoEventoNombre: string,
    templateNombre: string,
    servicios: PedidoServicioResponseDto[],
  ): PedidoResponseDto {
    return {
      id: pedido.id,
      nombreCliente: pedido.nombreCliente,
      telefono: pedido.telefono,
      email: pedido.email,
      tipoEventoId: pedido.tipoEventoId,
      tipoEventoNombre,
      templateId: pedido.templateId,
      templateNombre,
      precioBase: Number(pedido.precioBase),
      precioTotal: Number(pedido.precioTotal),
      estado: pedido.estado,
      servicios,
      createdAt: pedido.createdAt,
    };
  }

  /**
   * Envía email de notificación al propietario cuando se crea un nuevo pedido.
   * Corresponde al paso "Envía notificación por email al propietario"
   * del Diagrama de Actividad #1.
   */
  private async enviarNotificacionNuevoPedido(
    pedido: Pedido,
    tipoEventoNombre: string,
    templateNombre: string,
  ): Promise<void> {
    // TODO: Implementar con nodemailer / servicio de email
    // Enviar a ADMIN_EMAIL con los datos del pedido:
    //   - Nombre del cliente, teléfono, email
    //   - Tipo de evento, template seleccionado
    //   - Precio base, precio total
    //   - Lista de servicios seleccionados
    this.logger.log(
      `📧 Notificación nuevo pedido #${pedido.id} — ` +
      `Cliente: ${pedido.nombreCliente} | Evento: ${tipoEventoNombre} | ` +
      `Template: ${templateNombre} | Total: $${pedido.precioTotal}`,
    );
  }
}