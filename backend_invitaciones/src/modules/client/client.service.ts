import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';

import { Pedido, EstadoPedido } from '../../entities/pedido.entity';
import { PedidoServicio } from '../../entities/pedido-servicio.entity';
import { Invitacion } from '../../entities/invitacion.entity';
import { InvitacionServicio } from '../../entities/invitacion-servicio.entity';
import { Servicio } from '../../entities/servicio.entity';
import { TipoEvento } from '../../entities/tipo-evento.entity';
import { Template } from '../../entities/template.entity';
import { PagosService } from '../pagos/pagos.service';
import { CreatePedidoClienteDto, CreateInvitacionClienteDto, UpdateInvitacionClienteDto } from './dto/client.dto';
import { calcularFechaExpiracion } from '../invitaciones/helpers/invitacion.mapper';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,

    @InjectRepository(Invitacion)
    private readonly invitacionRepo: Repository<Invitacion>,

    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,

    @InjectRepository(TipoEvento)
    private readonly tipoEventoRepo: Repository<TipoEvento>,

    @InjectRepository(Template)
    private readonly templateRepo: Repository<Template>,

    private readonly pagosService: PagosService,
    private readonly dataSource: DataSource,
  ) {}

  // ═══════════════════════════════════════════
  // PEDIDOS
  // ═══════════════════════════════════════════

  async crearPedido(usuarioId: number, dto: CreatePedidoClienteDto) {
    // 1. Validar tipo evento
    const tipoEvento = await this.tipoEventoRepo.findOneBy({ id: dto.tipoEventoId });
    if (!tipoEvento || !tipoEvento.activo) {
      throw new UnprocessableEntityException('El tipo de evento no existe o no está activo.');
    }

    // 2. Validar template
    const template = await this.templateRepo.findOneBy({ id: dto.templateId });
    if (!template || !template.activo) {
      throw new UnprocessableEntityException('El template no existe o no está activo.');
    }
    if (template.tipoEventoId !== dto.tipoEventoId) {
      throw new UnprocessableEntityException('El template no corresponde al tipo de evento.');
    }

    // 3. Validar servicios
    let servicios: Servicio[] = [];
    if (dto.serviciosIds && dto.serviciosIds.length > 0) {
      servicios = await this.servicioRepo.findBy({ id: In(dto.serviciosIds) });
      const inactivos = servicios.filter((s) => !s.activo);
      if (inactivos.length > 0) {
        throw new UnprocessableEntityException(
          `Servicios inactivos: ${inactivos.map((s) => s.nombre).join(', ')}`,
        );
      }
      if (servicios.length !== dto.serviciosIds.length) {
        throw new UnprocessableEntityException('Uno o más servicios seleccionados no existen.');
      }
    }

    // 4. Calcular precio
    const serviciosBase = servicios.filter((s) => s.incluidoEnBase);
    const serviciosOpcionales = servicios.filter((s) => !s.incluidoEnBase);
    const precioBase = serviciosBase.reduce((acc, s) => acc + Number(s.precio), 0);
    const sumaOpcionales = serviciosOpcionales.reduce((acc, s) => acc + Number(s.precio), 0);
    const subtotal = precioBase + sumaOpcionales;
    const precioTotal = dto.segundaTarjeta ? Math.round(subtotal * 1.5) : subtotal;

    // 5. Transacción: crear pedido + pedido_servicios
    const pedido = await this.dataSource.transaction(async (manager) => {
      const nuevoPedido = manager.create(Pedido, {
        usuarioId,
        tipoEventoId: dto.tipoEventoId,
        templateId: dto.templateId,
        // Los datos de contacto se toman del usuario autenticado en el controller
        nombreCliente: '', // se rellenará con el nombre del usuario
        telefono: '',
        email: '',
        precioBase,
        precioTotal,
        estado: EstadoPedido.PENDIENTE,
      });
      const guardado = await manager.save(Pedido, nuevoPedido);

      if (servicios.length > 0) {
        // Guardamos en PedidoServicio con precio capturado al momento
        const pedidoServicios = servicios.map((s) =>
          manager.create(PedidoServicio, {
            pedidoId: guardado.id,
            servicioId: s.id,
            precioAlMomento: Number(s.precio),
          }),
        );
        await manager.save(PedidoServicio, pedidoServicios);
      }

      return guardado;
    });

    this.logger.log(`📋 Pedido creado — ID: #${pedido.id} | Cliente: ${usuarioId}`);

    return {
      id: pedido.id,
      tipoEventoId: pedido.tipoEventoId,
      tipoEventoNombre: tipoEvento.nombre,
      templateId: pedido.templateId,
      templateNombre: template.nombre,
      precioBase,
      precioTotal,
      estado: pedido.estado,
      createdAt: pedido.createdAt,
    };
  }

  async listarPedidos(usuarioId: number) {
    const pedidos = await this.pedidoRepo.find({
      where: { usuarioId },
      relations: ['tipoEvento', 'template', 'pedidoServicios', 'pedidoServicios.servicio'],
      order: { createdAt: 'DESC' },
    });

    return pedidos.map((p) => ({
      id: p.id,
      tipoEventoNombre: p.tipoEvento?.nombre ?? '',
      templateNombre: p.template?.nombre ?? '',
      precioBase: Number(p.precioBase),
      precioTotal: Number(p.precioTotal),
      estado: p.estado,
      createdAt: p.createdAt,
    }));
  }

  async obtenerPedido(pedidoId: number, usuarioId: number) {
    const pedido = await this.pedidoRepo.findOne({
      where: { id: pedidoId, usuarioId },
      relations: ['tipoEvento', 'template', 'pedidoServicios', 'pedidoServicios.servicio'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${pedidoId} no encontrado.`);
    }

    return {
      id: pedido.id,
      tipoEventoNombre: pedido.tipoEvento?.nombre ?? '',
      templateNombre: pedido.template?.nombre ?? '',
      precioBase: Number(pedido.precioBase),
      precioTotal: Number(pedido.precioTotal),
      estado: pedido.estado,
      mpPreferenceId: pedido.mpPreferenceId,
      servicios: (pedido.pedidoServicios ?? []).map((ps) => ({
        nombre: ps.servicio?.nombre ?? '',
        precio: Number(ps.precioAlMomento),
      })),
      createdAt: pedido.createdAt,
    };
  }

  async generarCheckout(pedidoId: number, usuarioId: number) {
    return this.pagosService.crearPreferencia(pedidoId, usuarioId);
  }

  async obtenerEstadoPago(pedidoId: number, usuarioId: number) {
    return this.pagosService.obtenerEstadoPago(pedidoId, usuarioId);
  }

  // ═══════════════════════════════════════════
  // INVITACIONES — CRUD autogestionado
  // ═══════════════════════════════════════════

  async crearInvitacion(usuarioId: number, dto: CreateInvitacionClienteDto) {
    // Verificar que el pedido pertenece al usuario
    const pedido = await this.pedidoRepo.findOne({
      where: { id: dto.pedidoId, usuarioId },
      relations: ['pedidoServicios'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${dto.pedidoId} no encontrado.`);
    }

    if (pedido.estado === EstadoPedido.CANCELADO) {
      throw new BadRequestException('No podés crear una invitación para un pedido cancelado.');
    }

    // No permitir duplicados (un pedido = una invitación)
    const existente = await this.invitacionRepo.findOne({ where: { pedidoId: dto.pedidoId } });
    if (existente) {
      throw new BadRequestException(
        'Ya existe una invitación para este pedido. Editá la existente.',
      );
    }

    const invitacion = await this.dataSource.transaction(async (manager) => {
      const nueva = manager.create(Invitacion, {
        pedidoId: dto.pedidoId,
        usuarioId,
        templateId: pedido.templateId,
        tipoEventoId: pedido.tipoEventoId,
        titulo: dto.titulo,
        fechaEvento: dto.fechaEvento as any,
        horaEvento: dto.horaEvento,
        ubicacion: dto.ubicacion,
        direccion: dto.direccion,
        latitud: dto.latitud ?? 0,
        longitud: dto.longitud ?? 0,
        colorPrimario: dto.colorPrimario ?? null,
        contrasenaAsistentes: dto.contrasenaAsistentes ?? null,
        maxFotos: dto.maxFotos ?? 1000,
        camposEspecificos: dto.camposEspecificos ?? null,
        fechaExpiracion: calcularFechaExpiracion(dto.fechaEvento),
        activa: false, // Se activa solo al confirmar el pago
      } as Partial<Invitacion>);

      const guardada = await manager.save(Invitacion, nueva);

      // Crear InvitacionServicios desde los pedidoServicios
      const serviciosIds = (pedido.pedidoServicios ?? []).map((ps) => ps.servicioId);
      if (serviciosIds.length > 0) {
        const registros = serviciosIds.map((sId) =>
          manager.create(InvitacionServicio, {
            invitacionId: guardada.id,
            servicioId: sId,
            habilitado: true,
          }),
        );
        await manager.save(InvitacionServicio, registros);
      }

      return guardada;
    });

    this.logger.log(`📝 Invitación borrador creada — ID: ${invitacion.id} | Usuario: ${usuarioId}`);

    return { id: invitacion.id, activa: invitacion.activa, pedidoId: invitacion.pedidoId };
  }

  async listarInvitaciones(usuarioId: number) {
    const invitaciones = await this.invitacionRepo.find({
      where: { usuarioId },
      relations: ['tipoEvento', 'template'],
      order: { createdAt: 'DESC' },
    });

    return invitaciones.map((inv) => ({
      id: inv.id,
      titulo: inv.titulo,
      fechaEvento: inv.fechaEvento,
      tipoEventoNombre: inv.tipoEvento?.nombre ?? '',
      templateNombre: inv.template?.nombre ?? '',
      activa: inv.activa,
      fechaExpiracion: inv.fechaExpiracion,
      createdAt: inv.createdAt,
    }));
  }

  async obtenerInvitacion(invitacionId: string, usuarioId: number) {
    const invitacion = await this.invitacionRepo.findOne({
      where: { id: invitacionId, usuarioId },
      relations: [
        'tipoEvento', 'template',
        'invitacionServicios', 'invitacionServicios.servicio',
        'fotosAnfitrion', 'musica', 'historias',
      ],
    });

    if (!invitacion) {
      throw new NotFoundException(`Invitación ${invitacionId} no encontrada.`);
    }

    return invitacion;
  }

  async actualizarInvitacion(invitacionId: string, usuarioId: number, dto: UpdateInvitacionClienteDto) {
    const invitacion = await this.invitacionRepo.findOne({
      where: { id: invitacionId, usuarioId },
    });

    if (!invitacion) {
      throw new NotFoundException(`Invitación ${invitacionId} no encontrada.`);
    }

    // Recalcular expiración si cambia la fecha
    if (dto.fechaEvento && dto.fechaEvento !== String(invitacion.fechaEvento)) {
      invitacion.fechaExpiracion = calcularFechaExpiracion(dto.fechaEvento);
    }

    Object.assign(invitacion, dto);
    await this.invitacionRepo.save(invitacion);

    return { id: invitacion.id, activa: invitacion.activa };
  }

  /**
   * Soft-delete: el cliente solo puede desactivar su invitación.
   * Los archivos en R2 y los datos permanecen intactos.
   * El admin puede reactivarla si es necesario.
   */
  async desactivarInvitacion(invitacionId: string, usuarioId: number): Promise<void> {
    const invitacion = await this.invitacionRepo.findOne({
      where: { id: invitacionId, usuarioId },
    });

    if (!invitacion) {
      throw new NotFoundException(`Invitación ${invitacionId} no encontrada.`);
    }

    if (!invitacion.activa) {
      throw new BadRequestException('La invitación ya estaba inactiva.');
    }

    await this.invitacionRepo.update(invitacionId, { activa: false });

    this.logger.log(`🔕 Invitación desactivada — ID: ${invitacionId} | Usuario: ${usuarioId}`);
  }
}
