import apiClient from './apiClient'
import type { Pedido, PaginatedPedidos, PedidoQuery } from '@/types/adminPedido'

export const adminPedidoService = {
  async getAll(query: PedidoQuery = {}): Promise<PaginatedPedidos> {
    const { data } = await apiClient.get<PaginatedPedidos>('/pedidos', {
      params: query,
    })
    return data
  },

  async getById(id: number): Promise<Pedido> {
    const { data } = await apiClient.get<Pedido>(`/pedidos/${id}`)
    return data
  },
}
