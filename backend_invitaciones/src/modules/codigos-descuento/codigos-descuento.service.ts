import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodigoDescuento } from '../../entities/codigo-descuento.entity';
import { CrearCodigoDescuentoDto } from './dto/crear-codigo-descuento.dto';

export interface ValidarCodigoResult {
  valido: boolean;
  porcentaje: number;
  mensaje: string;
}

@Injectable()
export class CodigosDescuentoService {
  constructor(
    @InjectRepository(CodigoDescuento)
    private readonly repo: Repository<CodigoDescuento>,
  ) {}

  listar(): Promise<CodigoDescuento[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async crear(dto: CrearCodigoDescuentoDto): Promise<CodigoDescuento> {
    const codigoUppercase = dto.codigo.toUpperCase();
    const existe = await this.repo.findOne({ where: { codigo: codigoUppercase } });
    if (existe) {
      throw new ConflictException(`Ya existe un código con el nombre "${codigoUppercase}"`);
    }

    const nuevo = this.repo.create({
      codigo: codigoUppercase,
      porcentaje: dto.porcentaje,
      descripcion: dto.descripcion ?? null,
      fechaExpiracion: dto.fechaExpiracion ? new Date(dto.fechaExpiracion) : null,
      limiteUsos: dto.limiteUsos ?? null,
    });

    return this.repo.save(nuevo);
  }

  async toggle(id: number): Promise<CodigoDescuento> {
    const codigo = await this.repo.findOne({ where: { id } });
    if (!codigo) throw new NotFoundException(`Código con id ${id} no encontrado`);
    codigo.activo = !codigo.activo;
    return this.repo.save(codigo);
  }

  async eliminar(id: number): Promise<void> {
    const codigo = await this.repo.findOne({ where: { id } });
    if (!codigo) throw new NotFoundException(`Código con id ${id} no encontrado`);
    await this.repo.remove(codigo);
  }

  async validar(codigoStr: string): Promise<ValidarCodigoResult> {
    const codigo = await this.repo.findOne({
      where: { codigo: codigoStr.toUpperCase() },
    });

    if (!codigo) {
      return { valido: false, porcentaje: 0, mensaje: 'Código de descuento inválido' };
    }

    if (!codigo.activo) {
      return { valido: false, porcentaje: 0, mensaje: 'Este código ya no está activo' };
    }

    if (codigo.fechaExpiracion && new Date() > new Date(codigo.fechaExpiracion)) {
      return { valido: false, porcentaje: 0, mensaje: 'Este código ha vencido' };
    }

    if (codigo.limiteUsos !== null && codigo.usosActuales >= codigo.limiteUsos) {
      return { valido: false, porcentaje: 0, mensaje: 'Este código ha alcanzado su límite de usos' };
    }

    return {
      valido: true,
      porcentaje: Number(codigo.porcentaje),
      mensaje: `Descuento del ${codigo.porcentaje}% aplicado`,
    };
  }

  async aplicar(codigoStr: string): Promise<void> {
    await this.repo.increment(
      { codigo: codigoStr.toUpperCase() },
      'usosActuales',
      1,
    );
  }
}
