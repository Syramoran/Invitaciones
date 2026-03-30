import apiClient from './apiClient'
import type { InvitacionPublica } from '@/types/invitation'

export async function getInvitacionPublica(
  id: string,
  invitado?: string,
): Promise<InvitacionPublica> {
  const params = invitado ? { invitado } : {}
  const { data } = await apiClient.get<InvitacionPublica>(
    `/invitaciones/${id}/public`,
    { params },
  )
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
