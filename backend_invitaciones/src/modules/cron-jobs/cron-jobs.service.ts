import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';

import { Invitacion } from '../../entities/invitacion.entity';
import { LogEliminacion } from '../../entities/log-eliminacion.entity';
import { R2StorageService } from '../../common/r2/r2-storage.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);

  constructor(
    @InjectRepository(Invitacion)
    private readonly invitacionRepo: Repository<Invitacion>,

    @InjectRepository(LogEliminacion)
    private readonly logEliminacionRepo: Repository<LogEliminacion>,

    private readonly r2StorageService: R2StorageService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  // ═══════════════════════════════════════════
  // CRON 1: Eliminación automática de datos
  // Cada noche a las 02:00 AM (America/Argentina/Buenos_Aires)
  //
  // Busca invitaciones cuya fecha_expiracion < hoy.
  // Para cada una: elimina archivos de R2, registra log,
  // notifica, y hace hard delete (CASCADE).
  // ═══════════════════════════════════════════

  @Cron('0 2 * * *', {
    name: 'eliminacion-automatica',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
  async eliminarInvitacionesExpiradas(): Promise<void> {
    this.logger.log('🕐 Iniciando cron: eliminación de invitaciones expiradas...');

    const expiradas = await this.invitacionRepo.find({
      where: {
        fechaExpiracion: LessThan(new Date()),
        activa: true,
      },
      relations: ['fotos', 'fotosAnfitrion', 'musica'],
    });

    if (expiradas.length === 0) {
      this.logger.log('✅ Sin invitaciones expiradas para eliminar.');
      return;
    }

    this.logger.log(`📋 ${expiradas.length} invitaciones expiradas encontradas.`);

    let eliminadas = 0;
    let errores = 0;

    for (const invitacion of expiradas) {
      try {
        const fotosGaleria = invitacion.fotos?.length ?? 0;
        const fotosAnfitrion = invitacion.fotosAnfitrion?.length ?? 0;
        const fotosEliminadas = fotosGaleria + fotosAnfitrion;

        // 1. Eliminar archivos de R2 (toda la carpeta)
        await this.r2StorageService.eliminarCarpetaInvitacion(invitacion.id);

        // 2. Registrar log de eliminación (referencia blanda)
        await this.logEliminacionRepo.save(
          this.logEliminacionRepo.create({
            invitacionIdRef: invitacion.id,
            fotosEliminadas,
            detalles:
              `Eliminación automática (cron) — Título: ${invitacion.titulo} | ` +
              `Galería: ${fotosGaleria} | Anfitrión: ${fotosAnfitrion} | ` +
              `Música: ${invitacion.musica ? 'sí' : 'no'}`,
          }),
        );

        // 3. Registrar notificación de auditoría (fire-and-forget)
        this.notificacionesService
          .registrarEliminacion({
            invitacionId: invitacion.id,
            titulo: invitacion.titulo,
            fotosEliminadas,
          })
          .catch(() => {});

        // 4. Hard delete (CASCADE elimina tablas hijas)
        await this.invitacionRepo.remove(invitacion);

        eliminadas++;
        this.logger.log(
          `🗑️ Eliminada: "${invitacion.titulo}" (${invitacion.id}) | ` +
          `Fotos: ${fotosEliminadas}`,
        );
      } catch (error: any) {
        errores++;
        this.logger.error(
          `❌ Error eliminando invitación ${invitacion.id}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `✅ Cron completado — Eliminadas: ${eliminadas} | Errores: ${errores}`,
    );
  }

  // ═══════════════════════════════════════════
  // CRON 2: Notificar expiración próxima
  // Cada día a las 10:00 AM (horario razonable para emails)
  //
  // Busca invitaciones que expiran en 7 o 3 días.
  // Envía email al anfitrión recordándole descargar fotos.
  // ═══════════════════════════════════════════

  @Cron('0 10 * * *', {
    name: 'notificar-expiracion',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
  async notificarExpiracionProxima(): Promise<void> {
    this.logger.log('🕐 Iniciando cron: notificaciones de expiración próxima...');

    const hoy = new Date();

    for (const diasAntes of [7, 3]) {
      const fechaObjetivo = new Date(hoy);
      fechaObjetivo.setDate(fechaObjetivo.getDate() + diasAntes);

      // Buscar invitaciones que expiran exactamente en N días
      // Comparar solo la fecha (sin horas)
      const fechaInicio = new Date(fechaObjetivo);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fechaObjetivo);
      fechaFin.setHours(23, 59, 59, 999);

      const porExpirar = await this.invitacionRepo
        .createQueryBuilder('inv')
        .leftJoinAndSelect('inv.pedido', 'pedido')
        .where('inv.fechaExpiracion BETWEEN :inicio AND :fin', {
          inicio: fechaInicio,
          fin: fechaFin,
        })
        .andWhere('inv.activa = true')
        .getMany();

      for (const inv of porExpirar) {
        // Obtener email del anfitrión desde el pedido asociado
        const emailAnfitrion = inv.pedido?.email;
        if (!emailAnfitrion) continue;

        try {
          await this.notificacionesService.notificarExpiracionProxima({
            invitacionId: inv.id,
            titulo: inv.titulo,
            emailAnfitrion,
            diasRestantes: diasAntes,
            fechaEliminacion: inv.fechaExpiracion,
          });

          this.logger.log(
            `📧 Notificación enviada (${diasAntes}d) — "${inv.titulo}" → ${emailAnfitrion}`,
          );
        } catch (error: any) {
          this.logger.error(
            `❌ Error notificando expiración de ${inv.id}: ${error.message}`,
          );
        }
      }
    }

    this.logger.log('✅ Cron de notificaciones completado.');
  }

  // ═══════════════════════════════════════════
  // CRON 3: Limpieza de logs de eliminación
  // Primer día de cada mes a las 03:00 AM
  //
  // Elimina registros de LogEliminacion con más de 6 meses
  // de antigüedad (política de retención).
  // ═══════════════════════════════════════════

  @Cron('0 3 1 * *', {
    name: 'limpieza-logs',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
  async limpiarLogsAntiguos(): Promise<void> {
    this.logger.log('🕐 Iniciando cron: limpieza de logs antiguos...');

    const haceSeisMeses = new Date();
    haceSeisMeses.setMonth(haceSeisMeses.getMonth() - 6);

    const resultado = await this.logEliminacionRepo
      .createQueryBuilder()
      .delete()
      .where('fecha_eliminacion < :fecha', { fecha: haceSeisMeses })
      .execute();

    this.logger.log(
      `✅ Logs limpiados — Registros eliminados: ${resultado.affected ?? 0}`,
    );
  }
}