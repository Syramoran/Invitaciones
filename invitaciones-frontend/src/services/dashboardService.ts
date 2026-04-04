import { adminPedidoService } from './adminPedidoService'
import { adminInvitacionService } from './adminInvitacionService'
import { getDaysLeft, getInvitacionStatus } from '@/types/adminInvitacion'
import type { DashboardData } from '@/types/dashboard'

// Invitations with ≤ EXPIRING_THRESHOLD days left appear in the dashboard panel
const EXPIRING_THRESHOLD = 45

export async function fetchDashboardData(): Promise<DashboardData> {
  const [pedidosRes, invitacionesRes] = await Promise.all([
    adminPedidoService.getAll({ limit: 100 }),
    adminInvitacionService.getAll({ limit: 100 }),
  ])

  const pedidos     = pedidosRes.data
  const invitaciones = invitacionesRes.data

  // ── Metrics ────────────────────────────────────────────────────────────────

  const pedidosPendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length

  const invitacionesActivas  = invitaciones.filter(i => getInvitacionStatus(i) === 'active').length
  const proximasAExpirar     = invitaciones.filter(i => getInvitacionStatus(i) === 'expiring').length

  // Ingresos del mes: pedidos COMPLETADO en los últimos 30 días.
  // Ventana móvil en lugar de mes calendario para evitar $0 al inicio de mes.
  // Number() garantiza suma numérica aunque TypeORM serialice DECIMAL como string.
  const now = new Date()
  const hace30dias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ingresosDelMes = pedidos
    .filter(p => {
      if (p.estado !== 'COMPLETADO') return false
      return new Date(p.createdAt) >= hace30dias
    })
    .reduce((sum, p) => sum + Number(p.precioTotal), 0)

  // ── Recent orders (last 5, newest first) ──────────────────────────────────

  const recentOrders = [...pedidos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(p => ({
      id:               p.id,
      nombreCliente:    p.nombreCliente,
      tipoEventoNombre: p.tipoEventoNombre,
      precioTotal:      p.precioTotal,
      estado:           p.estado,
    }))

  // ── Expiring invitations (active, ≤ threshold days, sorted asc) ───────────

  const expiringItems = invitaciones
    .filter(inv => {
      if (!inv.activa) return false
      const days = getDaysLeft(inv.fechaEvento)
      return days >= 0 && days <= EXPIRING_THRESHOLD
    })
    .map(inv => ({
      id:          inv.id,
      titulo:      inv.titulo,
      fechaEvento: inv.fechaEvento,
      daysLeft:    getDaysLeft(inv.fechaEvento),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5)

  return {
    metrics: { pedidosPendientes, invitacionesActivas, proximasAExpirar, ingresosDelMes },
    recentOrders,
    expiringItems,
  }
}
