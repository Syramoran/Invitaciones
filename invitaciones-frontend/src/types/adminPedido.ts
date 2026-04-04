// Types matching PedidoResponseDto / PaginatedPedidosDto from the API

export type EstadoPedido = 'PENDIENTE' | 'CONTACTADO' | 'COMPLETADO' | 'CANCELADO'

export interface PedidoServicio {
  servicioId: number
  nombre: string
  precioAlMomento: number
}

export interface Pedido {
  id: number
  nombreCliente: string
  telefono: string
  email: string
  tipoEventoId: number
  tipoEventoNombre: string
  templateId: number
  templateNombre: string
  precioBase: number
  precioTotal: number
  estado: EstadoPedido
  servicios: PedidoServicio[]
  createdAt: string
}

export interface PaginatedPedidos {
  data: Pedido[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PedidoQuery {
  page?: number
  limit?: number
  estado?: EstadoPedido
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export const fmtPrice = (n: number) => `$${n.toLocaleString('es-AR')}`

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
