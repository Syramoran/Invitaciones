import { Invitacion } from '../../../entities/invitacion.entity';
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
  return {
    id: invitacion.id,
    pedidoId: invitacion.pedidoId,
    templateId: invitacion.templateId,
    templateNombre,
    tipoEventoId: invitacion.tipoEventoId,
    tipoEventoNombre,
    titulo: invitacion.titulo,
    fechaEvento: invitacion.fechaEvento,
    horaEvento: invitacion.horaEvento,
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
    servicios,
    createdAt: invitacion.createdAt,
  };
}

// ═══════════════════════════════════════════
// Mapeo: Invitación → Response público (invitado)
// ═══════════════════════════════════════════

export function mapearInvitacionPublica(
  invitacion: Invitacion,
  invitadoParam?: string,
): InvitacionPublicDto {
  // Saludo personalizado si viene ?invitado=nombre-apellido
  let saludoPersonalizado: string | null = null;
  let mostrarBotonConfirmar = false;

  if (invitadoParam) {
    const [nombre] = invitadoParam.split('-');
    saludoPersonalizado = nombre
      ? `¡Hola ${capitalizarNombre(nombre)}!`
      : null;
    mostrarBotonConfirmar = true;
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
  const fecha = new Date(fechaEvento);
  fecha.setMonth(fecha.getMonth() + 3);
  return fecha;
}