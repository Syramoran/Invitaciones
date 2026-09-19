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
