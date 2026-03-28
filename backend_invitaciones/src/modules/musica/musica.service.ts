import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Musica } from '../../entities/musica.entity';
import { InvitacionesService } from '../invitaciones/invitaciones.service';
import { R2StorageService } from '../../common/r2/r2-storage.service';

import { MusicaResponseDto } from './dto/musica.dto';

@Injectable()
export class MusicaService {
  private readonly logger = new Logger(MusicaService.name);

  constructor(
    @InjectRepository(Musica)
    private readonly musicaRepo: Repository<Musica>,

    @Inject(forwardRef(() => InvitacionesService))
    private readonly invitacionesService: InvitacionesService,

    private readonly r2StorageService: R2StorageService,
  ) {}

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/musica — Obtener datos de la música (público)
  // ═══════════════════════════════════════════

  async obtener(invitacionId: string): Promise<MusicaResponseDto> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const musica = await this.musicaRepo.findOne({
      where: { invitacionId },
    });

    if (!musica) {
      throw new NotFoundException(
        'Esta invitación no tiene música asignada.',
      );
    }

    return this.mapearResponse(musica);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/musica — Subir MP3 (admin, JWT)
  // Solo 1 archivo por invitación. Si ya existe, reemplaza el anterior.
  // Validaciones: MIME audio/mpeg, máx 20 MB.
  // ═══════════════════════════════════════════

  async subir(
    invitacionId: string,
    archivo: Express.Multer.File,
  ): Promise<MusicaResponseDto> {
    // 1. Validar que el archivo se haya enviado
    if (!archivo) {
      throw new BadRequestException('No se proporcionó ningún archivo.');
    }

    // 2. Validar que la invitación exista
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    // 3. Si ya existe música, eliminar la anterior de R2
    const musicaExistente = await this.musicaRepo.findOne({
      where: { invitacionId },
    });

    if (musicaExistente) {
      await this.r2StorageService.eliminarArchivo(musicaExistente.archivoUrl);
      await this.musicaRepo.remove(musicaExistente);

      this.logger.log(
        `🔄 Música anterior reemplazada — Invitación: ${invitacionId}`,
      );
    }

    // 4. Subir a R2 (validación MIME + tamaño ocurre dentro del service)
    const resultado = await this.r2StorageService.subirMusica(
      invitacionId,
      archivo,
    );

    // 5. Guardar registro en BD
    const musica = this.musicaRepo.create({
      invitacionId,
      archivoUrl: resultado.url,
      tamano: resultado.tamano,
      mimeType: resultado.mimeType,
    });

    const musicaGuardada = await this.musicaRepo.save(musica);

    this.logger.log(
      `🎵 Música subida — Invitación: ${invitacionId} | ` +
      `Tamaño: ${(resultado.tamano / (1024 * 1024)).toFixed(1)} MB`,
    );

    return this.mapearResponse(musicaGuardada);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id/musica — Eliminar música (admin, JWT)
  // ═══════════════════════════════════════════

  async eliminar(invitacionId: string): Promise<void> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const musica = await this.musicaRepo.findOne({
      where: { invitacionId },
    });

    if (!musica) {
      throw new NotFoundException(
        'Esta invitación no tiene música asignada.',
      );
    }

    // 1. Eliminar archivo de R2
    await this.r2StorageService.eliminarArchivo(musica.archivoUrl);

    // 2. Eliminar registro de BD
    await this.musicaRepo.remove(musica);

    this.logger.log(
      `🗑️ Música eliminada — Invitación: ${invitacionId}`,
    );
  }

  // ═══════════════════════════════════════════
  // Métodos privados
  // ═══════════════════════════════════════════

  private mapearResponse(musica: Musica): MusicaResponseDto {
    return {
      id: musica.id,
      invitacionId: musica.invitacionId,
      archivoUrl: musica.archivoUrl,
      tamano: musica.tamano,
      tamanoMB: (musica.tamano / (1024 * 1024)).toFixed(2),
      mimeType: musica.mimeType,
    };
  }
}