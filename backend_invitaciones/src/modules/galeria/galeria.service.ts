import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import archiver from 'archiver';
import { PassThrough } from 'stream';

import { Foto } from '../../entities/foto.entity';
import { InvitacionesService } from '../invitaciones/invitaciones.service';
import { R2StorageService } from '../../common/r2/r2-storage.service';

import {
  FotoResponseDto,
  GaleriaStatsResponseDto,
} from './dto/galeria.dto';

@Injectable()
export class GaleriaService {
  private readonly logger = new Logger(GaleriaService.name);

  constructor(
    @InjectRepository(Foto)
    private readonly fotoRepo: Repository<Foto>,

    private readonly invitacionesService: InvitacionesService,
    private readonly r2StorageService: R2StorageService,
  ) {}

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/galeria — Listar fotos (público)
  // ═══════════════════════════════════════════

  async listar(invitacionId: string): Promise<FotoResponseDto[]> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const fotos = await this.fotoRepo.find({
      where: { invitacionId },
      order: { createdAt: 'DESC' },
    });

    return fotos.map((f) => this.mapearResponse(f));
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/galeria — Subir foto (público, sin auth en MVP)
  // Validaciones: MIME, tamaño (15 MB), límite (max_fotos), expiración
  // ═══════════════════════════════════════════

  async subir(
    invitacionId: string,
    archivo: Express.Multer.File,
  ): Promise<FotoResponseDto> {
    // 1. Validar que el archivo se haya enviado
    if (!archivo) {
      throw new BadRequestException('No se proporcionó ningún archivo.');
    }

    // 2. Validar que la invitación exista y esté activa
    const invitacion =
      await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    // 3. Rechazar si la invitación está expirada
    if (new Date(invitacion.fechaExpiracion) < new Date()) {
      throw new ConflictException(
        'La invitación ha expirado. No se pueden subir más fotos.',
      );
    }

    // 4. Verificar límite de fotos (max_fotos, default 1000)
    const cantidadActual = await this.fotoRepo.count({
      where: { invitacionId },
    });

    if (cantidadActual >= invitacion.maxFotos) {
      throw new ConflictException(
        `La galería ha alcanzado el límite de ${invitacion.maxFotos} fotos.`,
      );
    }

    // 5. Subir a R2 (validación MIME + tamaño ocurre dentro del service)
    const resultado = await this.r2StorageService.subirFotoGaleria(
      invitacionId,
      archivo,
    );

    // 6. Guardar registro en BD
    const foto = this.fotoRepo.create({
      invitacionId,
      url: resultado.url,
      tamano: resultado.tamano,
      mimeType: resultado.mimeType,
    });

    const fotoGuardada = await this.fotoRepo.save(foto);

    this.logger.log(
      `📸 Foto subida a galería — Invitación: ${invitacionId} | ` +
      `Foto: #${fotoGuardada.id} | ` +
      `Tamaño: ${(resultado.tamano / 1024).toFixed(1)} KB | ` +
      `Total: ${cantidadActual + 1}/${invitacion.maxFotos}`,
    );

    return this.mapearResponse(fotoGuardada);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id/galeria/:fotoId — Eliminar foto (admin, JWT)
  // ═══════════════════════════════════════════

  async eliminar(invitacionId: string, fotoId: number): Promise<void> {
    const foto = await this.fotoRepo.findOne({
      where: { id: fotoId, invitacionId },
    });

    if (!foto) {
      throw new NotFoundException(
        `Foto #${fotoId} no encontrada en la galería de la invitación ${invitacionId}.`,
      );
    }

    // 1. Eliminar archivo de R2
    await this.r2StorageService.eliminarArchivo(foto.url);

    // 2. Eliminar registro de BD
    await this.fotoRepo.remove(foto);

    this.logger.log(
      `🗑️ Foto eliminada de galería — Invitación: ${invitacionId} | ` +
      `Foto: #${fotoId}`,
    );
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/galeria/download — Descargar ZIP (público)
  // Genera un ZIP en streaming con todas las fotos
  // ═══════════════════════════════════════════

  async descargarZip(
    invitacionId: string,
  ): Promise<{ stream: StreamableFile; filename: string }> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const fotos = await this.fotoRepo.find({
      where: { invitacionId },
      order: { createdAt: 'ASC' },
    });

    if (fotos.length === 0) {
      throw new NotFoundException(
        'La galería está vacía. No hay fotos para descargar.',
      );
    }

    // Crear ZIP en streaming
    const passThrough = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 5 } });

    archive.pipe(passThrough);

    // Agregar cada foto al ZIP usando URLs firmadas
    for (let i = 0; i < fotos.length; i++) {
      const foto = fotos[i];
      const extension = this.obtenerExtensionDesdeUrl(foto.url);
      const nombre = `foto-${String(i + 1).padStart(4, '0')}.${extension}`;

      try {
        const urlFirmada = await this.r2StorageService.obtenerUrlFirmada(
          foto.url,
          300, // 5 minutos
        );

        // Fetch del archivo y agregar al ZIP
        const response = await fetch(urlFirmada);
        if (response.ok && response.body) {
          archive.append(Buffer.from(await response.arrayBuffer()), {
            name: nombre,
          });
        }
      } catch (error: any) {
        this.logger.warn(
          `⚠️ No se pudo incluir foto #${foto.id} en el ZIP: ${error.message}`,
        );
      }
    }

    // Finalizar el archivo sin esperar (streaming)
    archive.finalize();

    const filename = `galeria-${invitacionId.substring(0, 8)}.zip`;

    this.logger.log(
      `📦 ZIP generado — Invitación: ${invitacionId} | Fotos: ${fotos.length}`,
    );

    return {
      stream: new StreamableFile(passThrough),
      filename,
    };
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/galeria/stats — Stats de almacenamiento (admin, JWT)
  // ═══════════════════════════════════════════

  async obtenerStats(invitacionId: string): Promise<GaleriaStatsResponseDto> {
    const invitacion =
      await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    // Consultar datos agregados directamente desde la BD
    const resultado = await this.fotoRepo
      .createQueryBuilder('foto')
      .select('COUNT(foto.id)', 'totalFotos')
      .addSelect('COALESCE(SUM(foto.tamano), 0)', 'tamanoTotal')
      .where('foto.invitacionId = :invitacionId', { invitacionId })
      .getRawOne();

    const totalFotos = parseInt(resultado.totalFotos, 10);
    const tamanoTotalBytes = parseInt(resultado.tamanoTotal, 10);
    const tamanoTotalMB = (tamanoTotalBytes / (1024 * 1024)).toFixed(2);
    const espacioUsadoPorcentaje =
      invitacion.maxFotos > 0
        ? Math.round((totalFotos / invitacion.maxFotos) * 100)
        : 0;

    return {
      invitacionId,
      totalFotos,
      maxFotos: invitacion.maxFotos,
      tamanoTotalBytes,
      tamanoTotalMB,
      espacioUsadoPorcentaje,
    };
  }

  // ═══════════════════════════════════════════
  // Métodos privados
  // ═══════════════════════════════════════════

  /**
   * Mapea una entidad Foto a FotoResponseDto.
   */
  private mapearResponse(foto: Foto): FotoResponseDto {
    return {
      id: foto.id,
      invitacionId: foto.invitacionId,
      url: foto.url,
      tamano: foto.tamano,
      mimeType: foto.mimeType,
      createdAt: foto.createdAt,
    };
  }

  /**
   * Obtiene la extensión de un archivo a partir de su URL.
   * "https://pub-XXX.r2.dev/invitaciones/.../abc123.jpg" → "jpg"
   */
  private obtenerExtensionDesdeUrl(url: string): string {
    const partes = url.split('.');
    return partes[partes.length - 1]?.split('?')[0] ?? 'jpg';
  }
}