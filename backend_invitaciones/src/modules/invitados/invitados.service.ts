import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Invitado } from '../../entities/invitado.entity';
import { InvitacionesService } from '../invitaciones/invitaciones.service';

import {
  CargarInvitadosDto,
  ConfirmarAsistenciaDto,
  CargarInvitadosResponseDto,
  InvitadoResponseDto,
  ConfirmacionResponseDto,
  AsistentesResponseDto,
} from './dto/invitado.dto';

@Injectable()
export class InvitadosService {
  private readonly logger = new Logger(InvitadosService.name);

  constructor(
    @InjectRepository(Invitado)
    private readonly invitadoRepo: Repository<Invitado>,

    private readonly invitacionesService: InvitacionesService,
    private readonly configService: ConfigService,
  ) {}

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/invitados — Carga masiva (admin, JWT)
  // Genera URLs personalizadas por invitado
  // ═══════════════════════════════════════════

  async cargar(
    invitacionId: string,
    dto: CargarInvitadosDto,
  ): Promise<CargarInvitadosResponseDto> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const urlsGeneradas: { nombre: string; apellido: string; url: string }[] = [];
    const invitadosCreados: Invitado[] = [];

    for (const item of dto.invitados) {
      // Verificar duplicado (UNIQUE constraint: invitacionId + nombre + apellido)
      const existente = await this.invitadoRepo.findOne({
        where: {
          invitacionId,
          nombre: item.nombre,
          apellido: item.apellido,
        },
      });

      if (existente) {
        // Saltar duplicados sin lanzar error (carga parcial)
        this.logger.warn(
          `⚠️ Invitado duplicado, se omite: ${item.nombre} ${item.apellido}`,
        );
        // Igual generar la URL para el response
        urlsGeneradas.push({
          nombre: item.nombre,
          apellido: item.apellido,
          url: this.generarUrlPersonalizada(invitacionId, item.nombre, item.apellido),
        });
        continue;
      }

      const invitado = this.invitadoRepo.create({
        invitacionId,
        nombre: item.nombre,
        apellido: item.apellido,
        confirmado: false,
      });

      invitadosCreados.push(invitado);

      urlsGeneradas.push({
        nombre: item.nombre,
        apellido: item.apellido,
        url: this.generarUrlPersonalizada(invitacionId, item.nombre, item.apellido),
      });
    }

    // Guardar en batch
    if (invitadosCreados.length > 0) {
      await this.invitadoRepo.save(invitadosCreados);
    }

    this.logger.log(
      `👥 Invitados cargados — Invitación: ${invitacionId} | ` +
      `Nuevos: ${invitadosCreados.length} | ` +
      `Duplicados omitidos: ${dto.invitados.length - invitadosCreados.length}`,
    );

    return {
      totalInvitados: urlsGeneradas.length,
      urlsGeneradas,
    };
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/invitados — Listar invitados y estado (admin, JWT)
  // ═══════════════════════════════════════════

  async listar(invitacionId: string): Promise<InvitadoResponseDto[]> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const invitados = await this.invitadoRepo.find({
      where: { invitacionId },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });

    return invitados.map((inv) => ({
      id: inv.id,
      nombre: inv.nombre,
      apellido: inv.apellido,
      confirmado: inv.confirmado,
      fechaConfirmacion: inv.fechaConfirmacion ?? null,
      urlPersonalizada: this.generarUrlPersonalizada(
        invitacionId,
        inv.nombre,
        inv.apellido,
      ),
    }));
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/invitados/export — Exportar URLs CSV (admin, JWT)
  // ═══════════════════════════════════════════

  async exportarCsv(invitacionId: string): Promise<string> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const invitados = await this.invitadoRepo.find({
      where: { invitacionId },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });

    if (invitados.length === 0) {
      throw new NotFoundException(
        'No hay invitados cargados para esta invitación.',
      );
    }

    // Generar CSV: nombre, apellido, url, confirmado
    const header = 'Nombre,Apellido,URL,Confirmado';
    const filas = invitados.map((inv) => {
      const url = this.generarUrlPersonalizada(
        invitacionId,
        inv.nombre,
        inv.apellido,
      );
      return `"${inv.nombre}","${inv.apellido}","${url}","${inv.confirmado ? 'Sí' : 'No'}"`;
    });

    this.logger.log(
      `📄 CSV exportado — Invitación: ${invitacionId} | Invitados: ${invitados.length}`,
    );

    return [header, ...filas].join('\n');
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/confirmar — Confirmar asistencia (público)
  // Idempotente: solo la primera confirmación se registra
  // ═══════════════════════════════════════════

  async confirmar(
    invitacionId: string,
    dto: ConfirmarAsistenciaDto,
  ): Promise<ConfirmacionResponseDto> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    // Buscar invitado por nombre + apellido en esta invitación
    const invitado = await this.invitadoRepo.findOne({
      where: {
        invitacionId,
        nombre: dto.nombre,
        apellido: dto.apellido,
      },
    });

    if (!invitado) {
      throw new NotFoundException(
        `Invitado "${dto.nombre} ${dto.apellido}" no encontrado en esta invitación.`,
      );
    }

    // Si ya confirmó, retornar sin modificar (idempotente)
    if (invitado.confirmado) {
      return {
        mensaje: 'Ya habías confirmado tu asistencia anteriormente.',
        nombre: invitado.nombre,
        apellido: invitado.apellido,
        confirmado: true,
        fechaConfirmacion: invitado.fechaConfirmacion,
      };
    }

    // Registrar confirmación
    invitado.confirmado = true;
    invitado.fechaConfirmacion = new Date();
    await this.invitadoRepo.save(invitado);

    this.logger.log(
      `✅ Asistencia confirmada — Invitación: ${invitacionId} | ` +
      `Invitado: ${dto.nombre} ${dto.apellido}`,
    );

    return {
      mensaje: '¡Asistencia confirmada exitosamente!',
      nombre: invitado.nombre,
      apellido: invitado.apellido,
      confirmado: true,
      fechaConfirmacion: invitado.fechaConfirmacion,
    };
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/asistentes — Lista de asistentes (contraseña del evento)
  // Requiere header X-Event-Password
  // ═══════════════════════════════════════════

  async obtenerAsistentes(
    invitacionId: string,
    passwordRecibida: string,
  ): Promise<AsistentesResponseDto> {
    const invitacion =
      await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    // Validar contraseña del evento
    if (
      !invitacion.contrasenaAsistentes ||
      invitacion.contrasenaAsistentes !== passwordRecibida
    ) {
      throw new ForbiddenException('Contraseña del evento incorrecta.');
    }

    const invitados = await this.invitadoRepo.find({
      where: { invitacionId },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });

    const totalConfirmados = invitados.filter((i) => i.confirmado).length;

    return {
      totalEsperados: invitados.length,
      totalConfirmados,
      invitados: invitados.map((inv) => ({
        nombre: inv.nombre,
        apellido: inv.apellido,
        confirmado: inv.confirmado,
        fechaConfirmacion: inv.fechaConfirmacion ?? null,
      })),
    };
  }

  // ═══════════════════════════════════════════
  // Métodos privados
  // ═══════════════════════════════════════════

  /**
   * Genera la URL personalizada para un invitado.
   * Formato: https://dominio.com/{invitacionId}?invitado=nombre-apellido
   */
  private generarUrlPersonalizada(
    invitacionId: string,
    nombre: string,
    apellido: string,
  ): string {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'https://invitaciones.com',
    );

    const invitadoParam = `${nombre}-${apellido}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/\s+/g, '-');           // Espacios → guiones

    return `${baseUrl}/${invitacionId}?invitado=${encodeURIComponent(invitadoParam)}`;
  }
}