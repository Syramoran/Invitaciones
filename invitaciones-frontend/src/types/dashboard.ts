import type { EstadoPedido } from './adminPedido'

export interface DashboardMetrics {
  pedidosPendientes: number
  invitacionesActivas: number
  proximasAExpirar: number
  ingresosDelMes: number
}

export interface RecentOrder {
  id: number
  nombreCliente: string
  tipoEventoNombre: string
  precioTotal: number
  estado: EstadoPedido
}

export interface ExpiringItem {
  id: string
  titulo: string
  fechaEvento: string   // ISO date
  daysLeft: number
}

export interface DashboardData {
  metrics: DashboardMetrics
  recentOrders: RecentOrder[]
  expiringItems: ExpiringItem[]
}
