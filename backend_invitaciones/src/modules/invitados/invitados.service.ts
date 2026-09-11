import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Invitado } from '../../entities/invitado.entity';
import { Grupo } from '../../entities/grupo.entity';
import { InvitacionesService } from '../invitaciones/invitaciones.service';
import { GruposService } from '../grupos/grupos.service';
import { toSlug, generarSlugUnico } from '../../common/utils/slug.util';
import { parsearArchivoInvitados } from './helpers/excel-import.helper';
import {
  generarExcelAsistentes,
  FilaExportAsistente,
  RestriccionExport,
} from './helpers/excel-export.helper';

import {
  CargarInvitadosDto,
  ConfirmarAsistenciaDto,
  CargarInvitadosResponseDto,
  InvitadosListadoResponseDto,
  InvitadoIndividualResponseDto,
  ConfirmacionResponseDto,
  AsistentesResponseDto,
  ImportarInvitadosResponseDto,
  CrearInvitadoAsistenteDto,
  ActualizarInvitadoAsistenteDto,
  ActualizarSettingsDto,
  SettingsResponseDto,
} from './dto/invitado.dto';

@Injectable()
export class InvitadosService {
  private readonly logger = new Logger(InvitadosService.name);

  constructor(
    @InjectRepository(Invitado)
    private readonly invitadoRepo: Repository<Invitado>,

    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,

    private readonly invitacionesService: InvitacionesService,
    private readonly configService: ConfigService,
    private readonly gruposService: GruposService,
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

    // Estado existente, para detectar duplicados y generar slugs únicos
    // (mismo criterio que crearIndividualAsistente/importar): solo contra
    // individuales/titulares, comparación case-insensitive.
    const individualesExistentes = await this.invitadoRepo.find({
      where: { invitacionId, grupoId: IsNull() },
    });
    const clavesExistentes = new Set(
      individualesExistentes
        .filter((i) => i.invitadoPrincipalId === null)
        .map((i) => `${i.nombre.toLowerCase()}|${i.apellido.toLowerCase()}`),
    );
    const slugsUsados = await this.slugsIndividualesUsados(invitacionId);

    const urlsGeneradas: { nombre: string; apellido: string; url: string }[] = [];
    const invitadosCreados: Invitado[] = [];

    for (const item of dto.invitados) {
      const clave = `${item.nombre.toLowerCase()}|${item.apellido.toLowerCase()}`;

      if (clavesExistentes.has(clave)) {
        // Saltar duplicados sin lanzar error (carga parcial)
        this.logger.warn(
          `⚠️ Invitado duplicado, se omite: ${item.nombre} ${item.apellido}`,
        );
        urlsGeneradas.push({
          nombre: item.nombre,
          apellido: item.apellido,
          url: this.generarUrlPersonalizada(invitacionId, item.nombre, item.apellido),
        });
        continue;
      }

      const slug = generarSlugUnico(`${item.nombre}-${item.apellido}`, slugsUsados);
      slugsUsados.add(slug);
      clavesExistentes.add(clave);

      const invitado = this.invitadoRepo.create({
        invitacionId,
        nombre: item.nombre,
        apellido: item.apellido,
        slug,
        confirmado: false,
      });

      invitadosCreados.push(invitado);

      urlsGeneradas.push({
        nombre: item.nombre,
        apellido: item.apellido,
        url: this.generarUrlPersonalizada(invitacionId, item.nombre, item.apellido, slug),
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
  // POST /invitaciones/:id/invitados/importar — Carga masiva por archivo (admin, JWT)
  // Columnas: Nombre, Apellido, Grupo, PuedePlusOne, MaxIntegrantesGrupo
  // ═══════════════════════════════════════════

  async importar(
    invitacionId: string,
    file: Express.Multer.File,
  ): Promise<ImportarInvitadosResponseDto> {
    const invitacion = await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    let filas;
    try {
      filas = await parsearArchivoInvitados(file);
    } catch (err) {
      const motivo =
        err instanceof Error && err.message
          ? err.message
          : 'Verificá que sea un .xlsx o .csv válido.';
      throw new BadRequestException(`No se pudo leer el archivo. ${motivo}`);
    }

    const errores: { fila: number; motivo: string }[] = [];
    let totalCreados = 0;
    let totalGrupos = 0;
    let duplicadosOmitidos = 0;

    // Estado existente en la invitación, para detectar duplicados y colisiones de slug
    const individualesExistentes = await this.invitadoRepo.find({
      where: { invitacionId, grupoId: IsNull() },
    });
    const slugsIndividualesUsados = new Set(
      individualesExistentes.filter((i) => i.slug).map((i) => i.slug as string),
    );
    const clavesIndividualesExistentes = new Set(
      individualesExistentes
        .filter((i) => i.invitadoPrincipalId === null)
        .map((i) => `${i.nombre.toLowerCase()}|${i.apellido.toLowerCase()}`),
    );

    const gruposExistentes = await this.grupoRepo.find({ where: { invitacionId } });
    const slugsGrupoUsados = new Set(gruposExistentes.map((g) => g.slug));
    const gruposPorNombreLower = new Map(
      gruposExistentes.map((g) => [g.nombre.toLowerCase(), g] as const),
    );
    const cantidadPorGrupo = new Map<number, number>();
    for (const g of gruposExistentes) {
      cantidadPorGrupo.set(
        g.id,
        await this.invitadoRepo.count({ where: { grupoId: g.id } }),
      );
    }

    for (const fila of filas) {
      if (!fila.nombre || !fila.apellido) {
        errores.push({ fila: fila.fila, motivo: 'Nombre y apellido son obligatorios.' });
        continue;
      }

      if (fila.grupo) {
        let grupo = gruposPorNombreLower.get(fila.grupo.toLowerCase());
        if (!grupo) {
          const slugGrupo = generarSlugUnico(fila.grupo, slugsGrupoUsados);
          slugsGrupoUsados.add(slugGrupo);
          grupo = await this.grupoRepo.save(
            this.grupoRepo.create({
              invitacionId,
              nombre: fila.grupo,
              slug: slugGrupo,
              maxIntegrantes: fila.maxIntegrantesGrupo ?? null,
            }),
          );
          gruposPorNombreLower.set(fila.grupo.toLowerCase(), grupo);
          cantidadPorGrupo.set(grupo.id, 0);
          totalGrupos++;
        }

        const yaExiste = await this.invitadoRepo.findOne({
          where: {
            invitacionId,
            grupoId: grupo.id,
            nombre: fila.nombre,
            apellido: fila.apellido,
          },
        });
        if (yaExiste) {
          duplicadosOmitidos++;
          continue;
        }

        const maxEfectivo = grupo.maxIntegrantes ?? invitacion.maxIntegrantesDefault ?? null;
        const cantidadActual = cantidadPorGrupo.get(grupo.id) ?? 0;
        if (maxEfectivo !== null && cantidadActual >= maxEfectivo) {
          errores.push({
            fila: fila.fila,
            motivo: `El grupo "${fila.grupo}" ya alcanzó el máximo de ${maxEfectivo} integrantes.`,
          });
          continue;
        }

        await this.invitadoRepo.save(
          this.invitadoRepo.create({
            invitacionId,
            nombre: fila.nombre,
            apellido: fila.apellido,
            grupoId: grupo.id,
            confirmado: false,
          }),
        );
        cantidadPorGrupo.set(grupo.id, cantidadActual + 1);
        totalCreados++;
      } else {
        const clave = `${fila.nombre.toLowerCase()}|${fila.apellido.toLowerCase()}`;
        if (clavesIndividualesExistentes.has(clave)) {
          duplicadosOmitidos++;
          continue;
        }

        const slug = generarSlugUnico(`${fila.nombre}-${fila.apellido}`, slugsIndividualesUsados);
        slugsIndividualesUsados.add(slug);
        clavesIndividualesExistentes.add(clave);

        await this.invitadoRepo.save(
          this.invitadoRepo.create({
            invitacionId,
            nombre: fila.nombre,
            apellido: fila.apellido,
            slug,
            puedeAgregarPlusOne: fila.puedePlusOne,
            confirmado: false,
          }),
        );
        totalCreados++;
      }
    }

    this.logger.log(
      `📥 Importación de invitados — Invitación: ${invitacionId} | ` +
      `Creados: ${totalCreados} | Grupos nuevos: ${totalGrupos} | ` +
      `Duplicados: ${duplicadosOmitidos} | Errores: ${errores.length}`,
    );

    return { totalCreados, totalGrupos, duplicadosOmitidos, errores };
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/invitados — Listar invitados y estado (admin, JWT)
  // Listado extendido: individuales (+plusOne) y grupos (+integrantes)
  // ═══════════════════════════════════════════

  async listar(invitacionId: string): Promise<InvitadosListadoResponseDto> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const individuales = await this.listarIndividuales(invitacionId);
    const grupos = await this.gruposService.listarPorInvitacion(invitacionId);

    return { individuales, grupos };
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
        inv.slug,
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
    const invitacion = await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    // Normalizar el slug entrante (ya viene sin acentos ni mayúsculas, pero lo aseguramos)
    const slugEntrada = toSlug(dto.invitadoSlug);

    // Lookup directo por slug indexado (uq_invitado_inv_slug), ya no hace
    // falta traer todos los invitados y recalcular el slug fila por fila.
    let invitado = await this.invitadoRepo.findOne({
      where: { invitacionId, slug: slugEntrada },
    });

    if (!invitado) {
      // Invitado que no estaba en la lista previa (auto-registro).
      // Reconstruimos nombre/apellido desde el slug para guardar algo legible.
      const partes = slugEntrada.split('-');
      const nombre = partes[0] ?? slugEntrada;
      const apellido = partes.slice(1).join(' ') || nombre;

      const yaUsados = await this.slugsIndividualesUsados(invitacionId);
      invitado = this.invitadoRepo.create({
        invitacionId,
        nombre,
        apellido,
        slug: generarSlugUnico(`${nombre}-${apellido}`, yaUsados),
        grupoId: null,
        invitadoPrincipalId: null,
        puedeAgregarPlusOne: null,
      });
    }

    // Validar TODO antes de persistir nada — si el plusOne no es válido, la
    // confirmación del titular tampoco debe quedar guardada a medias.
    if (dto.plusOne) {
      const elegible =
        invitado.grupoId === null &&
        invitado.invitadoPrincipalId === null &&
        (invitado.puedeAgregarPlusOne ?? invitacion.permitirPlusOne);

      if (!elegible) {
        throw new BadRequestException('Este invitado no puede agregar un acompañante.');
      }
    }

    const yaEstabaConfirmado = invitado.confirmado;

    invitado.confirmado = true;
    if (!yaEstabaConfirmado) {
      invitado.fechaConfirmacion = new Date();
    }
    if (dto.restriccionAlimentaria !== undefined) {
      invitado.restriccionAlimentaria = dto.restriccionAlimentaria;
    }
    await this.invitadoRepo.save(invitado);

    if (dto.plusOne) {
      // Guard anti-duplicado: si ya tiene un plus-one, actualiza esa fila en
      // vez de crear una nueva.
      const plusOneExistente = await this.invitadoRepo.findOne({
        where: { invitacionId, invitadoPrincipalId: invitado.id },
      });

      if (plusOneExistente) {
        plusOneExistente.nombre = dto.plusOne.nombre;
        plusOneExistente.apellido = dto.plusOne.apellido;
        plusOneExistente.confirmado = true;
        plusOneExistente.fechaConfirmacion ??= new Date();
        await this.invitadoRepo.save(plusOneExistente);
      } else {
        await this.invitadoRepo.save(
          this.invitadoRepo.create({
            invitacionId,
            nombre: dto.plusOne.nombre,
            apellido: dto.plusOne.apellido,
            invitadoPrincipalId: invitado.id,
            confirmado: true,
            fechaConfirmacion: new Date(),
          }),
        );
      }
    }

    this.logger.log(
      `✅ Asistencia confirmada — Invitación: ${invitacionId} | ` +
      `Invitado: ${invitado.nombre} ${invitado.apellido}` +
      (dto.plusOne ? ` (+ ${dto.plusOne.nombre} ${dto.plusOne.apellido})` : ''),
    );

    return {
      mensaje: yaEstabaConfirmado
        ? 'Ya habías confirmado tu asistencia anteriormente.'
        : '¡Asistencia confirmada exitosamente!',
      nombre: invitado.nombre,
      apellido: invitado.apellido,
      confirmado: true,
      fechaConfirmacion: invitado.fechaConfirmacion,
    };
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/asistentes — Panel de gestión (contraseña del evento)
  // Requiere header X-Event-Password, validado por EventPasswordGuard
  // Individuales+plusOne, grupos+integrantes, settings globales, confirmados y pendientes
  // ═══════════════════════════════════════════

  async obtenerAsistentes(invitacionId: string): Promise<AsistentesResponseDto> {
    const invitacion = await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const individuales = await this.listarIndividuales(invitacionId);
    const grupos = await this.gruposService.listarPorInvitacion(invitacionId);

    const totalEsperados = await this.invitadoRepo.count({ where: { invitacionId } });
    const totalConfirmados = await this.invitadoRepo.count({
      where: { invitacionId, confirmado: true },
    });

    return {
      totalEsperados,
      totalConfirmados,
      permitirPlusOne: invitacion.permitirPlusOne,
      maxIntegrantesDefault: invitacion.maxIntegrantesDefault,
      individuales,
      grupos,
    };
  }

  // ═══════════════════════════════════════════
  // GET /invitaciones/:id/asistentes/export — Único export XLSX del sistema
  // Requiere header X-Event-Password, validado por EventPasswordGuard
  // ═══════════════════════════════════════════

  async exportarXlsx(invitacionId: string): Promise<Buffer> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const individuales = await this.listarIndividuales(invitacionId);
    const grupos = await this.gruposService.listarPorInvitacion(invitacionId);

    const filas: FilaExportAsistente[] = [];
    const restricciones: RestriccionExport[] = [];

    for (const ind of individuales) {
      const nombreCompleto = `${ind.nombre} ${ind.apellido}`;

      filas.push({
        nombre: nombreCompleto,
        plusOneDe: null,
        grupo: null,
        confirmo: ind.confirmado,
      });

      if (ind.restriccionAlimentaria) {
        restricciones.push({ invitado: nombreCompleto, descripcion: ind.restriccionAlimentaria });
      }

      if (ind.plusOne) {
        filas.push({
          nombre: `${ind.plusOne.nombre} ${ind.plusOne.apellido}`,
          plusOneDe: nombreCompleto,
          grupo: null,
          confirmo: ind.plusOne.confirmado,
        });
      }
    }

    for (const grupo of grupos) {
      if (grupo.restriccionAlimentaria) {
        restricciones.push({
          invitado: `Grupo: ${grupo.nombre}`,
          descripcion: grupo.restriccionAlimentaria,
        });
      }

      for (const integrante of grupo.integrantes) {
        filas.push({
          nombre: `${integrante.nombre} ${integrante.apellido}`,
          plusOneDe: null,
          grupo: grupo.nombre,
          confirmo: integrante.confirmado,
        });
      }
    }

    this.logger.log(
      `📊 Export XLSX generado — Invitación: ${invitacionId} | Filas: ${filas.length}`,
    );

    return generarExcelAsistentes(filas, restricciones);
  }

  // ═══════════════════════════════════════════
  // POST /invitaciones/:id/asistentes/invitados — Alta manual (contraseña del evento)
  // ═══════════════════════════════════════════

  async crearIndividualAsistente(
    invitacionId: string,
    dto: CrearInvitadoAsistenteDto,
  ): Promise<InvitadoIndividualResponseDto> {
    await this.invitacionesService.buscarInvitacionOFail(invitacionId);

    const slugsUsados = await this.slugsIndividualesUsados(invitacionId);
    const slug = generarSlugUnico(`${dto.nombre}-${dto.apellido}`, slugsUsados);

    const invitado = await this.invitadoRepo.save(
      this.invitadoRepo.create({
        invitacionId,
        nombre: dto.nombre,
        apellido: dto.apellido,
        slug,
        puedeAgregarPlusOne: dto.puedeAgregarPlusOne ?? null,
        confirmado: false,
      }),
    );

    this.logger.log(
      `➕ Invitado agregado desde /asistentes — Invitación: ${invitacionId} | ` +
      `${invitado.nombre} ${invitado.apellido}`,
    );

    return this.mapearIndividual(invitacionId, invitado, null);
  }

  // ═══════════════════════════════════════════
  // PATCH /invitaciones/:id/asistentes/invitados/:invitadoId
  // ═══════════════════════════════════════════

  async actualizarIndividualAsistente(
    invitacionId: string,
    invitadoId: number,
    dto: ActualizarInvitadoAsistenteDto,
  ): Promise<InvitadoIndividualResponseDto> {
    const titular = await this.buscarTitularOFail(invitacionId, invitadoId);

    if (dto.invitacionEnviada !== undefined) titular.invitacionEnviada = dto.invitacionEnviada;
    if (dto.puedeAgregarPlusOne !== undefined) titular.puedeAgregarPlusOne = dto.puedeAgregarPlusOne;
    if (dto.restriccionAlimentaria !== undefined) {
      titular.restriccionAlimentaria = dto.restriccionAlimentaria;
    }

    const actualizado = await this.invitadoRepo.save(titular);
    const plusOne = await this.invitadoRepo.findOne({
      where: { invitacionId, invitadoPrincipalId: actualizado.id },
    });

    this.logger.log(
      `📝 Invitado actualizado desde /asistentes — Invitación: ${invitacionId} | Invitado: #${invitadoId}`,
    );

    return this.mapearIndividual(invitacionId, actualizado, plusOne ?? null);
  }

  // ═══════════════════════════════════════════
  // DELETE /invitaciones/:id/asistentes/invitados/:invitadoId
  // Cascada borra su plus-one (FK invitado_principal_id ON DELETE CASCADE)
  // ═══════════════════════════════════════════

  async eliminarIndividualAsistente(invitacionId: string, invitadoId: number): Promise<void> {
    const titular = await this.buscarTitularOFail(invitacionId, invitadoId);
    await this.invitadoRepo.remove(titular);

    this.logger.log(
      `🗑️ Invitado eliminado desde /asistentes — Invitación: ${invitacionId} | Invitado: #${invitadoId}`,
    );
  }

  // ═══════════════════════════════════════════
  // PATCH /invitaciones/:id/asistentes/settings
  // ═══════════════════════════════════════════

  async actualizarSettings(
    invitacionId: string,
    dto: ActualizarSettingsDto,
  ): Promise<SettingsResponseDto> {
    const invitacion = await this.invitacionesService.actualizarSettingsAsistentes(
      invitacionId,
      dto,
    );

    this.logger.log(`⚙️ Settings actualizados — Invitación: ${invitacionId}`);

    return {
      permitirPlusOne: invitacion.permitirPlusOne,
      maxIntegrantesDefault: invitacion.maxIntegrantesDefault,
    };
  }

  // ═══════════════════════════════════════════
  // Métodos privados
  // ═══════════════════════════════════════════

  /**
   * Trae los invitados "sueltos" (grupoId IS NULL) de una invitación y arma
   * la lista de individuales/titulares con su plus-one anidado si existe.
   * Usado tanto por el listado admin como por /asistentes.
   */
  private async listarIndividuales(
    invitacionId: string,
  ): Promise<InvitadoIndividualResponseDto[]> {
    const sueltos = await this.invitadoRepo.find({
      where: { invitacionId, grupoId: IsNull() },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });

    const plusOnesPorPrincipal = new Map<number, Invitado>();
    for (const inv of sueltos) {
      if (inv.invitadoPrincipalId !== null) {
        plusOnesPorPrincipal.set(inv.invitadoPrincipalId, inv);
      }
    }

    return sueltos
      .filter((inv) => inv.invitadoPrincipalId === null)
      .map((titular) =>
        this.mapearIndividual(
          invitacionId,
          titular,
          plusOnesPorPrincipal.get(titular.id) ?? null,
        ),
      );
  }

  /**
   * Mapea un titular (+ su plus-one si existe) a InvitadoIndividualResponseDto.
   * Reutilizado por el listado y por el alta/edición manual desde /asistentes.
   */
  private mapearIndividual(
    invitacionId: string,
    titular: Invitado,
    plusOne: Invitado | null,
  ): InvitadoIndividualResponseDto {
    return {
      id: titular.id,
      nombre: titular.nombre,
      apellido: titular.apellido,
      confirmado: titular.confirmado,
      fechaConfirmacion: titular.fechaConfirmacion ?? null,
      slug: titular.slug,
      urlPersonalizada: this.generarUrlPersonalizada(
        invitacionId,
        titular.nombre,
        titular.apellido,
        titular.slug,
      ),
      invitacionEnviada: titular.invitacionEnviada,
      puedeAgregarPlusOne: titular.puedeAgregarPlusOne,
      restriccionAlimentaria: titular.restriccionAlimentaria,
      plusOne: plusOne
        ? {
            id: plusOne.id,
            nombre: plusOne.nombre,
            apellido: plusOne.apellido,
            confirmado: plusOne.confirmado,
          }
        : null,
    };
  }

  /**
   * Slugs ya asignados a invitados individuales/titulares de una invitación
   * (namespace separado del de grupos). Usado para generar slugs únicos al
   * crear un titular nuevo, sea manual o por auto-registro en /confirmar.
   */
  private async slugsIndividualesUsados(invitacionId: string): Promise<Set<string>> {
    const existentes = await this.invitadoRepo.find({
      where: { invitacionId, grupoId: IsNull() },
      select: ['slug'],
    });
    return new Set(existentes.filter((i) => i.slug).map((i) => i.slug as string));
  }

  /**
   * Busca un invitado por id verificando que pertenezca a la invitación y
   * que sea un titular (no un plus-one ni un integrante de grupo — esos se
   * gestionan a través de /asistentes/grupos o del flujo de confirmación).
   */
  private async buscarTitularOFail(
    invitacionId: string,
    invitadoId: number,
  ): Promise<Invitado> {
    const invitado = await this.invitadoRepo.findOne({
      where: { id: invitadoId, invitacionId },
    });

    if (!invitado) {
      throw new NotFoundException(
        `Invitado #${invitadoId} no encontrado para la invitación ${invitacionId}.`,
      );
    }

    if (invitado.grupoId !== null || invitado.invitadoPrincipalId !== null) {
      throw new BadRequestException(
        'Este invitado es un integrante de grupo o un plus-one, no se gestiona desde acá.',
      );
    }

    return invitado;
  }

  /**
   * Construye la URL personalizada a partir del slug ya persistido (o de un
   * fallback recomputado si no hay slug real — solo pasa con filas que no son
   * titulares, como en el CSV viejo que mezcla todo tipo de invitado).
   * No recomputa el slug de un titular: si hubo colisión y quedó con sufijo
   * -2, esta URL tiene que reflejar ese sufijo, no el slug "limpio".
   */
  private generarUrlPersonalizada(
    invitacionId: string,
    nombre: string,
    apellido: string,
    slugPersistido?: string | null,
  ): string {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'https://invitaciones.com',
    );

    const invitadoParam = slugPersistido ?? toSlug(`${nombre}-${apellido}`);

    return `${baseUrl}/${invitacionId}?invitado=${encodeURIComponent(invitadoParam)}`;
  }
}