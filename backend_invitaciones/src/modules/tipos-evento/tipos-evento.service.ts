// src/modules/tipo-evento/tipo-evento.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoEvento } from '../../entities';
import {
  CreateTipoEventoDto,
  UpdateTipoEventoDto,
} from './dto/tipo-evento.dto';

@Injectable()
export class TipoEventoService {
  constructor(
    @InjectRepository(TipoEvento)
    private readonly tipoEventoRepository: Repository<TipoEvento>,
  ) {}

  // ─────────────────────────────────────────
  // Lectura (públicos)
  // ─────────────────────────────────────────

  async findAll(): Promise<TipoEvento[]> {
    return this.tipoEventoRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findById(id: number): Promise<TipoEvento> {
    const tipoEvento = await this.tipoEventoRepository.findOne({
      where: { id },
    });

    if (!tipoEvento) {
      throw new NotFoundException(`Tipo de evento con id ${id} no encontrado`);
    }

    return tipoEvento;
  }

  // ─────────────────────────────────────────
  // Escritura (admin JWT)
  // ─────────────────────────────────────────

  async create(dto: CreateTipoEventoDto): Promise<TipoEvento> {
    const existe = await this.tipoEventoRepository.findOne({
      where: { nombre: dto.nombre },
    });

    if (existe) {
      throw new ConflictException(
        `Ya existe un tipo de evento con el nombre "${dto.nombre}"`,
      );
    }

    const nuevo = this.tipoEventoRepository.create(dto);
    return this.tipoEventoRepository.save(nuevo);
  }

  async update(id: number, dto: UpdateTipoEventoDto): Promise<TipoEvento> {
    const tipoEvento = await this.findById(id);

    if (dto.nombre && dto.nombre !== tipoEvento.nombre) {
      const nombreOcupado = await this.tipoEventoRepository.findOne({
        where: { nombre: dto.nombre },
      });

      if (nombreOcupado) {
        throw new ConflictException(
          `Ya existe un tipo de evento con el nombre "${dto.nombre}"`,
        );
      }
    }

    Object.assign(tipoEvento, dto);
    return this.tipoEventoRepository.save(tipoEvento);
  }

  async toggle(id: number): Promise<{ id: number; activo: boolean }> {
    const tipoEvento = await this.findById(id);

    tipoEvento.activo = !tipoEvento.activo;
    await this.tipoEventoRepository.save(tipoEvento);

    return { id: tipoEvento.id, activo: tipoEvento.activo };
  }
}