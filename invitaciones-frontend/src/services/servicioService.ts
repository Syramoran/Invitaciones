import apiClient from './apiClient'

export interface Servicio {
  id: number
  nombre: string
  precio: number
  incluidoEnBase: boolean
  descripcion: string | null
  activo: boolean
}

export const servicioService = {
  async getAll(): Promise<Servicio[]> {
    const { data } = await apiClient.get<Servicio[]>('/servicios')
    return data
  },

  async toggle(id: number): Promise<Servicio> {
    const { data } = await apiClient.patch<Servicio>(`/servicios/${id}/toggle`)
    return data
  },

  async update(id: number, payload: { precio: number }): Promise<Servicio> {
    const { data } = await apiClient.put<Servicio>(`/servicios/${id}`, payload)
    return data
  },
}
