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
  grupo?: string,
): Promise<InvitacionPublica> {
  const params: Record<string, string> = {}
  if (invitado) params.invitado = invitado
  if (grupo) params.grupo = grupo
  const { data } = await apiClient.get<InvitacionPublica>(
    `/invitaciones/${id}/public`,
    { params },
  )
  saveInvitacionCache(id, data)
  return data
}

interface ConfirmarAsistenciaDto {
  invitadoSlug: string
  restriccionAlimentaria?: string
  plusOne?: { nombre: string; apellido: string }
}

interface ConfirmacionResponse {
  mensaje: string
  nombre: string
  apellido: string
  confirmado: boolean
  fechaConfirmacion: string | null
}

export interface ConfirmarGrupoDto {
  grupoSlug: string
  integrantesConfirmados?: number[]
  integrantesNuevos?: { nombre: string; apellido: string }[]
  restriccionAlimentaria?: string
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

export interface ConfirmacionGrupoResponse {
  mensaje: string
  grupo: {
    id: number
    nombre: string
    slug: string
    maxIntegrantes: number | null
    restriccionAlimentaria: string | null
    invitacionEnviada: boolean
    integrantes: { id: number; nombre: string; apellido: string; confirmado: boolean }[]
  }
}

export async function confirmarGrupo(
  invitacionId: string,
  dto: ConfirmarGrupoDto,
): Promise<ConfirmacionGrupoResponse> {
  const { data } = await apiClient.post<ConfirmacionGrupoResponse>(
    `/invitaciones/${invitacionId}/grupos/confirmar`,
    dto,
  )
  return data
}
