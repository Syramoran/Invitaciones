import apiClient from './apiClient'

export interface Template {
  id: number
  tipoEventoId: number
  nombre: string
  slug: string
  thumbnailUrl: string | null
  descripcion: string | null
  activo: boolean
}

// tipoEventoId → label legible
export const TIPO_LABEL: Record<number, string> = {
  1: 'Boda',
  2: 'Quinceañera',
  3: 'Cumpleaños',
}

export interface CreateTemplatePayload {
  tipoEventoId: number
  nombre: string
  slug: string
  thumbnailUrl?: string
  descripcion?: string
}

export const templateService = {
  async getAll(): Promise<Template[]> {
    const { data } = await apiClient.get<Template[]>('/templates')
    return data
  },

  async create(payload: CreateTemplatePayload): Promise<Template> {
    const { data } = await apiClient.post<Template>('/templates', payload)
    return data
  },

  async toggle(id: number): Promise<Template> {
    const { data } = await apiClient.patch<Template>(`/templates/${id}/toggle`)
    return data
  },
}
