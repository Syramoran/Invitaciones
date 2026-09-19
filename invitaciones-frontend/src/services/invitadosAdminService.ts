import apiClient from './apiClient'
import type { InvitadoIndividual, Grupo } from '@/types/asistentes'

export interface ErrorImportacion {
  fila: number
  motivo: string
}

export interface ImportarInvitadosResponse {
  totalCreados: number
  totalGrupos: number
  duplicadosOmitidos: number
  errores: ErrorImportacion[]
}

export interface InvitadosListado {
  individuales: InvitadoIndividual[]
  grupos: Grupo[]
}

export const invitadosAdminService = {
  async importarInvitados(invitacionId: string, file: File): Promise<ImportarInvitadosResponse> {
    const fd = new FormData()
    fd.append('archivo', file)
    const { data } = await apiClient.post<ImportarInvitadosResponse>(
      `/invitaciones/${invitacionId}/invitados/importar`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },

  /** Listado real desde el backend: individuales (+plusOne, +slug/urlPersonalizada reales) y grupos. */
  async listarInvitados(invitacionId: string): Promise<InvitadosListado> {
    const { data } = await apiClient.get<InvitadosListado>(`/invitaciones/${invitacionId}/invitados`)
    return data
  },
}
