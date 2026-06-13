import apiClient from './apiClient'

export interface CodigoDescuento {
  id: number
  codigo: string
  porcentaje: number
  activo: boolean
  descripcion: string | null
  fechaExpiracion: string | null
  limiteUsos: number | null
  usosActuales: number
  createdAt: string
}

export interface CrearCodigoDescuentoDto {
  codigo: string
  porcentaje: number
  descripcion?: string
  fechaExpiracion?: string
  limiteUsos?: number
}

export interface ValidarCodigoResult {
  valido: boolean
  porcentaje: number
  mensaje: string
}

export const codigosDescuentoService = {
  listar(): Promise<CodigoDescuento[]> {
    return apiClient.get('/codigos-descuento').then(r => r.data)
  },

  crear(dto: CrearCodigoDescuentoDto): Promise<CodigoDescuento> {
    return apiClient.post('/codigos-descuento', dto).then(r => r.data)
  },

  toggle(id: number): Promise<CodigoDescuento> {
    return apiClient.patch(`/codigos-descuento/${id}/toggle`).then(r => r.data)
  },

  eliminar(id: number): Promise<void> {
    return apiClient.delete(`/codigos-descuento/${id}`).then(() => undefined)
  },

  validar(codigo: string): Promise<ValidarCodigoResult> {
    return apiClient.post('/codigos-descuento/validar', { codigo }).then(r => r.data)
  },
}
