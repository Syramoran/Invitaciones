import apiClient from './apiClient'
import type {
  InvitacionAdmin,
  PaginatedInvitaciones,
  InvitacionQuery,
  GaleriaStats,
} from '@/types/adminInvitacion'

export interface HistoriaSeccionResponse {
  id: number
  invitacionId: string
  texto: string
  imagenUrl: string | null
  orden: number
}

export interface MusicaResponse {
  id: number
  invitacionId: string
  archivoUrl: string
}

export const adminInvitacionService = {
  async getAll(query: InvitacionQuery = {}): Promise<PaginatedInvitaciones> {
    const { data } = await apiClient.get<PaginatedInvitaciones>('/invitaciones', {
      params: query,
    })
    return data
  },

  async getById(id: string): Promise<InvitacionAdmin> {
    const { data } = await apiClient.get<InvitacionAdmin>(`/invitaciones/${id}`)
    return data
  },

  async update(id: string, body: Record<string, unknown>): Promise<InvitacionAdmin> {
    const { data } = await apiClient.put<InvitacionAdmin>(`/invitaciones/${id}`, body)
    return data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/invitaciones/${id}`)
  },

  async getGaleriaStats(id: string): Promise<GaleriaStats> {
    const { data } = await apiClient.get<GaleriaStats>(`/invitaciones/${id}/galeria/stats`)
    return data
  },

  async getHistorias(id: string): Promise<HistoriaSeccionResponse[]> {
    const { data } = await apiClient.get<HistoriaSeccionResponse[]>(`/invitaciones/${id}/historias`)
    return data
  },

  async createHistoria(id: string, texto: string, orden: number, imagen: File | null): Promise<void> {
    const fd = new FormData()
    fd.append('texto', texto)
    fd.append('orden', String(orden))
    if (imagen) fd.append('imagen', imagen)
    await apiClient.post(`/invitaciones/${id}/historias`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async updateHistoria(id: string, seccionId: number, texto: string, orden: number, imagen: File | null, removeImagen: boolean): Promise<void> {
    const fd = new FormData()
    fd.append('texto', texto)
    fd.append('orden', String(orden))
    if (imagen) fd.append('imagen', imagen)
    if (removeImagen) fd.append('removeImagen', 'true')
    await apiClient.put(`/invitaciones/${id}/historias/${seccionId}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async deleteHistoria(id: string, seccionId: number): Promise<void> {
    await apiClient.delete(`/invitaciones/${id}/historias/${seccionId}`)
  },

  async getMusica(id: string): Promise<MusicaResponse | null> {
    try {
      const { data } = await apiClient.get<MusicaResponse>(`/invitaciones/${id}/musica`)
      return data
    } catch {
      return null
    }
  },

  async uploadMusica(id: string, archivo: File): Promise<void> {
    const fd = new FormData()
    fd.append('archivo', archivo)
    await apiClient.post(`/invitaciones/${id}/musica`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async deleteMusica(id: string): Promise<void> {
    await apiClient.delete(`/invitaciones/${id}/musica`)
  },

  async addFotosAnfitrion(id: string, fotos: File[]): Promise<void> {
    const fd = new FormData()
    fotos.forEach(f => fd.append('fotos', f))
    await apiClient.post(`/invitaciones/${id}/fotos-anfitrion`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async deleteFotoAnfitrion(id: string, fotoId: number): Promise<void> {
    await apiClient.delete(`/invitaciones/${id}/fotos-anfitrion/${fotoId}`)
  },
}
