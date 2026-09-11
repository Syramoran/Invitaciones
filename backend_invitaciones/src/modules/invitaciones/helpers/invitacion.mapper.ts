import { Invitacion } from '../../../entities/invitacion.entity';
import { Invitado } from '../../../entities/invitado.entity';
import { Grupo } from '../../../entities/grupo.entity';
import {
  InvitacionResponseDto,
  InvitacionPublicDto,
} from '../dto/invitacion.dto';

// ═══════════════════════════════════════════
// Mapeo: Invitación → Response admin
// ═══════════════════════════════════════════

export function mapearInvitacionResponse(
  invitacion: Invitacion,
  tipoEventoNombre: string,
  templateNombre: string,
  servicios: { servicioId: number; nombre: string; habilitado: boolean }[],
): InvitacionResponseDto {
  // PostgreSQL 'time' columns return 'HH:mm:ss' — normalize to 'HH:mm'
  const horaEvento = (invitacion.horaEvento ?? '').slice(0, 5);

  const fotosAnfitrion = (invitacion.fotosAnfitrion ?? [])
    .sort((a, b) => a.orden - b.orden)
    .map((f) => ({ id: f.id, url: f.url, orden: f.orden, tamano: f.tamano }));

  return {
    id: invitacion.id,
    pedidoId: invitacion.pedidoId,
    usuarioId: invitacion.usuarioId ?? null,
    usuarioUsername: invitacion.usuario?.username ?? null,
    templateId: invitacion.templateId,
    templateNombre,
    tipoEventoId: invitacion.tipoEventoId,
    tipoEventoNombre,
    titulo: invitacion.titulo,
    fechaEvento: invitacion.fechaEvento,
    horaEvento,
    ubicacion: invitacion.ubicacion,
    direccion: invitacion.direccion,
    latitud: Number(invitacion.latitud),
    longitud: Number(invitacion.longitud),
    colorPrimario: invitacion.colorPrimario,
    contrasenaAsistentes: invitacion.contrasenaAsistentes,
    maxFotos: invitacion.maxFotos,
    camposEspecificos: invitacion.camposEspecificos,
    activa: invitacion.activa,
    fechaExpiracion: invitacion.fechaExpiracion,
    editCount: invitacion.editCount,
    estadoPago: invitacion.estadoPago ?? 'PENDIENTE',
    servicios,
    fotosAnfitrion,
    createdAt: invitacion.createdAt,
  };
}

// ═══════════════════════════════════════════
// Mapeo: Invitación → Response público (invitado)
// ═══════════════════════════════════════════

export interface ContextoInvitadoPublico {
  invitadoParam?: string;
  /** Fila real ya resuelta por slug persistido; null si no matcheó (aún no precargado). */
  invitadoEncontrado?: Invitado | null;
  plusOneEncontrado?: Invitado | null;
  grupoParam?: string;
  grupoEncontrado?: Grupo | null;
  integrantesGrupo?: Invitado[];
}

export function mapearInvitacionPublica(
  invitacion: Invitacion,
  contexto: ContextoInvitadoPublico = {},
): InvitacionPublicDto {
  const {
    invitadoParam,
    invitadoEncontrado,
    plusOneEncontrado,
    grupoParam,
    grupoEncontrado,
    integrantesGrupo,
  } = contexto;

  // Saludo personalizado si viene ?invitado= o ?grupo=
  let saludoPersonalizado: string | null = null;
  let mostrarBotonConfirmar = false;

  let puedeAgregarPlusOne: boolean | undefined;
  let plusOneExistente: { nombre: string; apellido: string; confirmado: boolean } | null | undefined;
  let restriccionAlimentariaExistente: string | null | undefined;
  let yaConfirmado: boolean | undefined;
  let grupoDto: InvitacionPublicDto['grupo'];

  if (invitadoParam) {
    mostrarBotonConfirmar = true;

    if (invitadoEncontrado) {
      // Invitado real ya precargado — usamos su nombre de verdad, no el del slug
      saludoPersonalizado = `¡Hola ${capitalizarNombre(invitadoEncontrado.nombre)}!`;
      yaConfirmado = invitadoEncontrado.confirmado;
      puedeAgregarPlusOne =
        invitadoEncontrado.puedeAgregarPlusOne ?? invitacion.permitirPlusOne;
      restriccionAlimentariaExistente = invitadoEncontrado.restriccionAlimentaria;
      plusOneExistente = plusOneEncontrado
        ? {
            nombre: plusOneEncontrado.nombre,
            apellido: plusOneEncontrado.apellido,
            confirmado: plusOneEncontrado.confirmado,
          }
        : null;
    } else {
      // Sin match (invitado aún no precargado): fallback al saludo por slug
      // y a la config global de plus-one.
      const [nombre] = invitadoParam.split('-');
      saludoPersonalizado = nombre ? `¡Hola ${capitalizarNombre(nombre)}!` : null;
      yaConfirmado = false;
      puedeAgregarPlusOne = invitacion.permitirPlusOne;
      restriccionAlimentariaExistente = null;
      plusOneExistente = null;
    }
  } else if (grupoParam && grupoEncontrado) {
    mostrarBotonConfirmar = true;
    saludoPersonalizado = `¡Hola ${grupoEncontrado.nombre}!`;
    grupoDto = {
      nombre: grupoEncontrado.nombre,
      slug: grupoEncontrado.slug,
      maxIntegrantesEfectivo:
        grupoEncontrado.maxIntegrantes ?? invitacion.maxIntegrantesDefault ?? null,
      restriccionAlimentaria: grupoEncontrado.restriccionAlimentaria,
      integrantes: (integrantesGrupo ?? []).map((i) => ({
        id: i.id,
        nombre: i.nombre,
        apellido: i.apellido,
        confirmado: i.confirmado,
      })),
    };
  }

  // Verificar si el servicio de confirmación está habilitado
  const tieneConfirmacion = (invitacion.invitacionServicios ?? []).some(
    (is) =>
      is.habilitado &&
      is.servicio?.nombre?.toLowerCase().includes('confirmaci'),
  );

  // Servicios habilitados
  const servicios = (invitacion.invitacionServicios ?? [])
    .filter((is) => is.habilitado)
    .map((is) => ({
      id: is.servicio?.id,
      nombre: is.servicio?.nombre ?? '',
    }));

  // Fotos del anfitrión ordenadas
  const fotosAnfitrion = (invitacion.fotosAnfitrion ?? [])
    .sort((a, b) => a.orden - b.orden)
    .map((fa) => ({
      id: fa.id,
      url: fa.url,
      orden: fa.orden,
    }));

  // Historias ordenadas
  const historias = (invitacion.historias ?? [])
    .sort((a, b) => a.orden - b.orden)
    .map((h) => ({
      id: h.id,
      texto: h.texto,
      imagenUrl: h.imagenUrl,
      orden: h.orden,
    }));

  return {
    id: invitacion.id,
    titulo: invitacion.titulo,
    fechaEvento: invitacion.fechaEvento,
    horaEvento: invitacion.horaEvento,
    ubicacion: invitacion.ubicacion,
    direccion: invitacion.direccion,
    latitud: Number(invitacion.latitud),
    longitud: Number(invitacion.longitud),
    colorPrimario: invitacion.colorPrimario,
    camposEspecificos: invitacion.camposEspecificos,
    template: {
      id: invitacion.template?.id,
      nombre: invitacion.template?.nombre ?? '',
      slug: invitacion.template?.slug ?? '',
      thumbnailUrl: invitacion.template?.thumbnailUrl ?? null,
    },
    servicios,
    fotosAnfitrion,
    musica: invitacion.musica
      ? { id: invitacion.musica.id, archivoUrl: invitacion.musica.archivoUrl }
      : null,
    historias,
    saludoPersonalizado,
    tieneConfirmacion,
    mostrarBotonConfirmar: mostrarBotonConfirmar && tieneConfirmacion,
    puedeAgregarPlusOne,
    plusOneExistente,
    restriccionAlimentariaExistente,
    yaConfirmado,
    grupo: grupoDto,
  };
}

// ═══════════════════════════════════════════
// Helpers de mapeo reutilizables
// ═══════════════════════════════════════════

/**
 * Extrae la lista de servicios desde las relaciones cargadas de una invitación.
 */
export function extraerServicios(
  invitacion: Invitacion,
): { servicioId: number; nombre: string; habilitado: boolean }[] {
  return (invitacion.invitacionServicios ?? []).map((is) => ({
    servicioId: is.servicioId,
    nombre: is.servicio?.nombre ?? '',
    habilitado: is.habilitado,
  }));
}

/**
 * Capitaliza la primera letra de un nombre.
 * "juan" → "Juan"
 */
export function capitalizarNombre(nombre: string): string {
  return nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
}

/**
 * Calcula la fecha de expiración: fecha_evento + 3 meses.
 */
export function calcularFechaExpiracion(fechaEvento: Date | string): Date {
  const iso = typeof fechaEvento === 'string' ? fechaEvento : fechaEvento.toISOString();
  const [y, m, d] = iso.split('T')[0].split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  fecha.setMonth(fecha.getMonth() + 3);
  return fecha;
}