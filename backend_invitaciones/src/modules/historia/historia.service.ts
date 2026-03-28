import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HistoriaSeccion } from '../../entities/historia-seccion.entity';
import { InvitacionesService } from '../invitaciones/invitaciones.service';
import { R2StorageService } from '../../common/r2/r2-storage.service';

import {
  CreateHistoriaSeccionDto,
  UpdateHistoriaSeccionDto,
  HistoriaSeccionResponseDto,
} from './dto/historia.dto';

// ── Constantes ──
const MAX_SECCIONES_POR_INVITACION = 3;

@Injectable()
export class HistoriasService {
  private readonly logger = new Logger(HistoriasService.name);

  constructor(
    @InjectRepository(HistoriaSeccion)
    private readonly historiaRepo: Repository<HistoriaSeccion>,

    private readonly invitacionesService: InvitacionesService,
    private readonly r2StorageService: R2StorageService,
  ) { }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/historias — Listar secciones (público)
  // ═══════════════════════════════════════════

  async listar(invitacionId: string): Promise<HistoriaSeccionResponseDto[]> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const secciones = await this.historiaRepo.find({
      where: { invitacionId },
      order: { orden: 'ASC' },
    });

    return secciones.map((s) => this.mapearResponse(s));
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/historias — Crear sección (admin, JWT)
  // Máximo 3 secciones por invitación
  // ═══════════════════════════════════════════

  async crear(
    invitacionId: string,
    dto: CreateHistoriaSeccionDto,
    imagenFile?: Express.Multer.File,
  ): Promise<HistoriaSeccionResponseDto> {
    // 1. Validar que la invitación exista
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    // 2. Verificar límite de secciones (máx. 3)
    const cantidadActual = await this.historiaRepo.count({
      where: { invitacionId },
    });

    if (cantidadActual >= MAX_SECCIONES_POR_INVITACION) {
      throw new ConflictException(
        `Ya existen ${MAX_SECCIONES_POR_INVITACION} secciones para esta invitación. ` +
        `No se pueden agregar más.`,
      );
    }

    // 3. Verificar que el orden no esté duplicado
    const ordenExistente = await this.historiaRepo.findOne({
      where: { invitacionId, orden: dto.orden },
    });

    if (ordenExistente) {
      throw new ConflictException(
        `Ya existe una sección con orden ${dto.orden} para esta invitación.`,
      );
    }

    // 4. Sanitizar texto HTML para prevenir XSS
    const textoSanitizado = this.sanitizarTexto(dto.texto);

    // 5. Subir imagen a R2 si se envía
    let imagenUrl: string | undefined;
    if (imagenFile) {
      const resultado = await this.r2StorageService.subirImagenHistoria(
        invitacionId,
        imagenFile,
        dto.orden,
      );
      imagenUrl = resultado.url;
    } else if (dto.imagenUrl) {
      imagenUrl = dto.imagenUrl;  // ← URL de una foto ya subida (fotosAnfitrion)
    }

    // 6. Crear registro en BD
    const seccion = this.historiaRepo.create({
      invitacionId,
      texto: textoSanitizado,
      imagenUrl,
      orden: dto.orden,
    });

    const seccionGuardada = await this.historiaRepo.save(seccion);

    this.logger.log(
      `📖 Sección de historia creada — Invitación: ${invitacionId} | ` +
      `Orden: ${dto.orden} | Imagen: ${imagenUrl ? 'sí' : 'no'}`,
    );

    return this.mapearResponse(seccionGuardada);
  }

  // ═══════════════════════════════════════════
  // PUT /invitaciones/:id/historias/:seccionId — Actualizar sección (admin, JWT)
  // ═══════════════════════════════════════════

  async actualizar(
    invitacionId: string,
    seccionId: number,
    dto: UpdateHistoriaSeccionDto,
    imagenFile?: Express.Multer.File,
  ): Promise<HistoriaSeccionResponseDto> {
    // 1. Buscar la sección verificando que pertenezca a la invitación
    const seccion = await this.buscarSeccionOFail(invitacionId, seccionId);

    // 2. Verificar que el nuevo orden no colisione (si se cambia)
    if (dto.orden !== undefined && dto.orden !== seccion.orden) {
      const ordenExistente = await this.historiaRepo.findOne({
        where: { invitacionId, orden: dto.orden },
      });

      if (ordenExistente) {
        throw new ConflictException(
          `Ya existe una sección con orden ${dto.orden} para esta invitación.`,
        );
      }
    }

    // 3. Sanitizar texto si se actualiza
    if (dto.texto !== undefined) {
      dto.texto = this.sanitizarTexto(dto.texto);
    }

    // 4. Subir nueva imagen a R2 si se envía
    if (imagenFile) {
      // Eliminar imagen anterior si existe
      if (seccion.imagenUrl) {
        await this.r2StorageService.eliminarArchivo(seccion.imagenUrl);
      }

      const resultado = await this.r2StorageService.subirImagenHistoria(
        invitacionId,
        imagenFile,
        dto.orden ?? seccion.orden,
      );
      seccion.imagenUrl = resultado.url;
    }

    // 5. Aplicar cambios del DTO (texto, orden)
    Object.assign(seccion, dto);
    const seccionActualizada = await this.historiaRepo.save(seccion);

    this.logger.log(
      `📝 Sección de historia actualizada — Invitación: ${invitacionId} | ` +
      `Sección: #${seccionId}`,
    );

    return this.mapearResponse(seccionActualizada);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id/historias/:seccionId — Eliminar sección (admin, JWT)
  // ═══════════════════════════════════════════

  async eliminar(invitacionId: string, seccionId: number): Promise<void> {
    const seccion = await this.buscarSeccionOFail(invitacionId, seccionId);

    // Eliminar imagen de R2 si existe
    if (seccion.imagenUrl) {
      await this.r2StorageService.eliminarArchivo(seccion.imagenUrl);
    }

    await this.historiaRepo.remove(seccion);

    this.logger.log(
      `🗑️ Sección de historia eliminada — Invitación: ${invitacionId} | ` +
      `Sección: #${seccionId} | Orden: ${seccion.orden}`,
    );
  }

  // ═══════════════════════════════════════════
  // Métodos privados
  // ═══════════════════════════════════════════

  /**
   * Busca una sección por ID verificando que pertenezca a la invitación.
   * Lanza NotFoundException si no existe o no pertenece.
   */
  private async buscarSeccionOFail(
    invitacionId: string,
    seccionId: number,
  ): Promise<HistoriaSeccion> {
    const seccion = await this.historiaRepo.findOne({
      where: { id: seccionId, invitacionId },
    });

    if (!seccion) {
      throw new NotFoundException(
        `Sección #${seccionId} no encontrada para la invitación ${invitacionId}.`,
      );
    }

    return seccion;
  }

  /**
   * Sanitiza el texto eliminando etiquetas HTML y eventos inline
   * para prevenir ataques XSS (RF-6.2 del SRS).
   *
   * Para una sanitización más robusta instalar sanitize-html:
   *   npm install sanitize-html && npm install -D @types/sanitize-html
   */
  private sanitizarTexto(texto: string): string {
    return texto
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .trim();
  }

  /**
   * Mapea una entidad HistoriaSeccion a HistoriaSeccionResponseDto.
   */
  private mapearResponse(seccion: HistoriaSeccion): HistoriaSeccionResponseDto {
    return {
      id: seccion.id,
      invitacionId: seccion.invitacionId,
      texto: seccion.texto,
      imagenUrl: seccion.imagenUrl ?? null,
      orden: seccion.orden,
    };
  }
}