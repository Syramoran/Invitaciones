import apiClient from './apiClient'
import type { InvitacionPublica } from '@/types/invitation'

const INV_CACHE_PREFIX = 'inv_cache_'

function saveInvitacionCache(id: string, data: InvitacionPublica): void {
  try {
    localStorage.setItem(INV_CACHE_PREFIX + id, JSON.stringify(data))
  } catch {
    // localStorage puede estar lleno o deshabilitado — silenciar
  }
}

export function getCachedInvitacion(id: string): InvitacionPublica | null {
  try {
    const raw = localStorage.getItem(INV_CACHE_PREFIX + id)
    return raw ? (JSON.parse(raw) as InvitacionPublica) : null
  } catch {
    return null
  }
}

export async function getInvitacionPublica(
  id: string,
  invitado?: string,
): Promise<InvitacionPublica> {
  const params = invitado ? { invitado } : {}
  const { data } = await apiClient.get<InvitacionPublica>(
    `/invitaciones/${id}/public`,
    { params },
  )
  saveInvitacionCache(id, data)
  return data
}

interface ConfirmarAsistenciaDto {
  invitadoSlug: string
}

interface ConfirmacionResponse {
  mensaje: string
  nombre: string
  apellido: string
  confirmado: boolean
  fechaConfirmacion: string | null
}

export interface AsistenteItem {
  nombre: string
  apellido: string
  fechaConfirmacion: string | null
}

export interface AsistentesResponse {
  totalConfirmados: number
  invitados: AsistenteItem[]
}

export async function getAsistentes(
  invitacionId: string,
  password: string,
): Promise<AsistentesResponse> {
  const { data } = await apiClient.get<AsistentesResponse>(
    `/invitaciones/${invitacionId}/asistentes`,
    { headers: { 'x-event-password': password } },
  )
  return data
}

export async function confirmarAsistencia(
  invitacionId: string,
  dto: ConfirmarAsistenciaDto,
): Promise<ConfirmacionResponse> {
  const { data } = await apiClient.post<ConfirmacionResponse>(
    `/invitaciones/${invitacionId}/confirmar`,
    dto,
  )
  return data
}
