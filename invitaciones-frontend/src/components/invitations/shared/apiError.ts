import axios from 'axios'

/**
 * Los BadRequestException con mensaje propio del backend (ej. "Este invitado
 * no puede agregar un acompañante.") ya vienen en español y son seguros de
 * mostrar. Los errores del ValidationPipe (class-validator) llegan como
 * array y en inglés (ej. "restriccionAlimentaria must be shorter than or
 * equal to 500 characters") — para esos se prefiere el fallback en español
 * antes que mostrarle texto técnico al invitado.
 */
export function extraerMensajeError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined
    if (typeof data?.message === 'string') return data.message
  }
  return fallback
}

/**
 * Mensaje genérico para cuando falla la confirmación por un problema externo
 * (backend caído, red del invitado, etc. — no un error de validación propio,
 * que ya viene con su propio mensaje específico del backend).
 */
export const MENSAJE_ERROR_CONFIRMACION =
  'Hubo un problema externo a la invitación al confirmar tu asistencia. Disculpá las molestias — probá de nuevo en unos minutos. Si el problema persiste, avisale a los novios o escribinos a festeja.plataforma@gmail.com.'
