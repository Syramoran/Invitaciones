import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Template } from 'src/entities/template.entity';
import { Repository } from 'typeorm';
import { CreateTemplateDto, TemplatePublicDto, TemplateQueryDto, TemplateResponseDto, UpdateTemplateDto } from './dto/template.dto';
import { TipoEventoService } from '../tipos-evento/tipos-evento.service';

@Injectable()
export class TemplatesService {
    constructor(
        @InjectRepository(Template)
        private readonly templateRepository: Repository<Template>,
        private readonly tipoEventoService: TipoEventoService,
    ) { }

    // Lectura (públicos)

    async findAll(query: TemplateQueryDto): Promise<TemplateResponseDto[]> {
        const where: any = {};

        where.activo = query.activo ?? true;

        if (query.tipoEventoId) {
            where.tipoEventoId = query.tipoEventoId;
        }

        const templates = await this.templateRepository.find({
            where,
            order: { nombre: 'ASC' },
        });

        return templates.map((template) => ({
            id: template.id,
            tipoEventoId: template.tipoEventoId,
            nombre: template.nombre,
            slug: template.slug,
            thumbnailUrl: template.thumbnailUrl,
            descripcion: template.descripcion,
            activo: template.activo,
        }));
    }

    async findById(id: number): Promise<TemplateResponseDto> {
        const template = await this.templateRepository.findOne({
            where: { id },
        });

        if (!template) {
            throw new NotFoundException(`Template con id ${id} no encontrado`);
        }

        return {
            id: template.id,
            tipoEventoId: template.tipoEventoId,
            nombre: template.nombre,
            slug: template.slug,
            thumbnailUrl: template.thumbnailUrl,
            descripcion: template.descripcion,
            activo: template.activo,
        };
    }

    async findPreview(id: number): Promise<TemplatePublicDto> {
        const template = await this.findById(id);
        return {
            id: template.id,
            nombre: template.nombre,
            slug: template.slug,
            thumbnailUrl: template.thumbnailUrl,
            descripcion: template.descripcion,
        };
    }

    // Crear y actualizar (admin JWT)

    async create(dto: CreateTemplateDto): Promise<Template> {
        const tipoEventoId = dto.tipoEventoId;
        const existe = await this.tipoEventoService.findById(tipoEventoId);

        if (!existe) {
            throw new NotFoundException(`Tipo de evento con id ${tipoEventoId} no encontrado`);
        }

        const slugExistente = await this.templateRepository.findOne({
            where: { slug: dto.slug },
        });

        if (slugExistente) {
            throw new ConflictException(`Template con slug ${dto.slug} ya existe`);
        }

        const nuevo = this.templateRepository.create(dto);
        return this.templateRepository.save(nuevo);
    }

    async update(id: number, dto: UpdateTemplateDto): Promise<TemplateResponseDto> {
        const template = await this.templateRepository.findOne({
            where: { id },
        });
        if (!template) {
            throw new NotFoundException(`Template con id ${id} no encontrado`);
        }

        if (dto.slug && dto.slug !== template.slug) {
            const slugExistente = await this.templateRepository.findOne({
                where: { slug: dto.slug },
            });
            if (slugExistente) {
                throw new ConflictException(`Template con slug "${dto.slug}" ya existe`);
            }
        }

        Object.assign(template, dto);
        const updated = await this.templateRepository.save(template);
        return {
            id: updated.id,
            tipoEventoId: updated.tipoEventoId,
            nombre: updated.nombre,
            slug: updated.slug,
            thumbnailUrl: updated.thumbnailUrl,
            descripcion: updated.descripcion,
            activo: updated.activo,
        };
    }

    async toggle(id: number): Promise<{ id: number; activo: boolean }> {
        const template = await this.templateRepository.findOne({
            where: { id },
        });
        if (!template) {
            throw new NotFoundException(`Template con id ${id} no encontrado`);
        }
        template.activo = !template.activo;
        await this.templateRepository.save(template);
        return { id: template.id, activo: template.activo };
    }

}    
