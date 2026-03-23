import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Servicio } from 'src/entities/servicio.entity';
import { Repository } from 'typeorm';
import { CreateServicioDto, ServicioQueryDto, ServicioResponseDto, UpdateServicioDto } from './dto/servicio.dto';
import { FindOptionsWhere, In } from 'typeorm';

@Injectable()
export class ServiciosService {
    constructor(
        @InjectRepository(Servicio)
        private readonly servicioRepository: Repository<Servicio>
    ) { }

    async findAll(query: ServicioQueryDto): Promise<ServicioResponseDto[]> {
        const where: any = {};

        if (query.incluidoEnBase !== undefined) {
            where.incluidoEnBase = query.incluidoEnBase;
        }

        if (query.activo !== undefined) {
            where.activo = query.activo;
        } //?activo da los servicios inactivos, ?activo=true o cualquier texto da los activos porque el query se parsea a booleano

        const servicios = await this.servicioRepository.find({
            where,
            order: { nombre: 'ASC' },
        });
        return servicios.map((servicio) => ({
            id: servicio.id,
            nombre: servicio.nombre,
            precio: servicio.precio,
            incluidoEnBase: servicio.incluidoEnBase,
            descripcion: servicio.descripcion,
            activo: servicio.activo
        }));
    }

    async findById(id: number): Promise<ServicioResponseDto> {
        const servicio = await this.servicioRepository.findOne({
            where: { id },
        });
        if (!servicio) {
            throw new Error('Servicio not found');
        }
        return {
            id: servicio.id,
            nombre: servicio.nombre,
            precio: servicio.precio,
            incluidoEnBase: servicio.incluidoEnBase,
            descripcion: servicio.descripcion,
            activo: servicio.activo
        };
    }

    async create(data: CreateServicioDto): Promise<ServicioResponseDto> {
        const servicioExiste = await this.servicioRepository.findOne({
            where: { nombre: data.nombre },
        });
        if (servicioExiste) {
            throw new ConflictException('Servicio already exists');
        }
        const servicio = this.servicioRepository.create(data);
        const savedServicio = await this.servicioRepository.save(servicio);
        return {
            id: savedServicio.id,
            nombre: savedServicio.nombre,
            precio: savedServicio.precio,
            incluidoEnBase: savedServicio.incluidoEnBase,
            descripcion: savedServicio.descripcion,
            activo: savedServicio.activo
        };
    }

    async update(id: number, data: UpdateServicioDto): Promise<ServicioResponseDto> {
        const servicio = await this.servicioRepository.findOne({
            where: { id },
        });
        if (!servicio) {
            throw new Error('Servicio not found');
        }

        Object.assign(servicio, data);
        const updatedServicio = await this.servicioRepository.save(servicio);
        return {
            id: updatedServicio.id,
            nombre: updatedServicio.nombre,
            precio: updatedServicio.precio,
            incluidoEnBase: updatedServicio.incluidoEnBase,
            descripcion: updatedServicio.descripcion,
            activo: updatedServicio.activo
        };
    }

    async toggle(id: number) {
        const servicio = await this.servicioRepository.findOne({
            where: { id },
        });
        if (!servicio) {
            throw new Error('Servicio not found');
        }
        servicio.activo = !servicio.activo;
        await this.servicioRepository.save(servicio);
        return {
            id: servicio.id,
            activo: servicio.activo
        };

    }


    async calcularPrecio(ids: number[]): Promise<{ total: number; desglose: { id: number; nombre: string; precio: number }[] }> {
        const servicios = await this.servicioRepository.findBy({
            id: In(ids) as FindOptionsWhere<Servicio>['id'],
            activo: true,
        });

        // Si no encontró todos los ids, alguno no existe o está inactivo
        if (servicios.length !== ids.length) {
            const encontrados = servicios.map(s => s.id);
            const faltantes = ids.filter(id => !encontrados.includes(id));
            throw new NotFoundException(
                `Servicios no encontrados o inactivos: ${faltantes.join(', ')}`,
            );
        }

        const desglose = servicios.map(s => ({
            id: s.id,
            nombre: s.nombre,
            precio: Number(s.precio), // DECIMAL de postgres llega como string
        }));

        const total = desglose.reduce((suma, s) => suma + s.precio, 0);

        return { total, desglose };

        /*
            * calcularPrecio(ids)
            * ─────────────────────────────────────────────────────────────
            * 1. Una sola query: WHERE id IN (...ids) AND activo = true
            * 2. Valida que todos los ids existan y estén activos.
            *    Si falta alguno → 404 con los ids fallantes especificados.
            * 3. Convierte precio a Number() porque PostgreSQL retorna
            *    DECIMAL como string y rompería la suma.
            * 4. Retorna { total, desglose } — total para mostrar,
            *    desglose para listar cada servicio con su precio.
            */
    }


}
