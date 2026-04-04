import apiClient from './apiClient'
import { env } from '@/config/env'

export interface FotoGaleria {
  id: number
  invitacionId: string
  url: string
  tamano: number
  mimeType: string
  createdAt: string
}

export const galeriaService = {
  async listar(invitacionId: string): Promise<FotoGaleria[]> {
    const { data } = await apiClient.get<FotoGaleria[]>(
      `/invitaciones/${invitacionId}/galeria`,
    )
    return data
  },

  async subir(invitacionId: string, foto: File): Promise<FotoGaleria> {
    const fd = new FormData()
    fd.append('foto', foto)
    const { data } = await apiClient.post<FotoGaleria>(
      `/invitaciones/${invitacionId}/galeria`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },

  async eliminar(invitacionId: string, fotoId: number, password: string): Promise<void> {
    await apiClient.delete(
      `/invitaciones/${invitacionId}/galeria/${fotoId}`,
      { headers: { 'x-event-password': password } },
    )
  },

  getZipUrl(invitacionId: string): string {
    return `${env.apiBaseUrl}/invitaciones/${invitacionId}/galeria/download`
  },
}
