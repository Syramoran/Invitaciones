import { ShoppingBag, Mailbox, Clock, TrendingUp } from 'lucide-react'
import { MetricCard } from './MetricCard'
import { fmtPrice } from '@/types/adminPedido'
import type { DashboardMetrics } from '@/types/dashboard'

interface Props {
  metrics: DashboardMetrics
}

export function MetricGrid({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
      <MetricCard
        icon={<ShoppingBag className="w-[1.3rem] h-[1.3rem]" />}
        iconBg="bg-[#fef9c3]"
        iconColor="text-[#ca8a04]"
        value={metrics.pedidosPendientes}
        label="Pedidos Pendientes"
      />
      <MetricCard
        icon={<Mailbox className="w-[1.3rem] h-[1.3rem]" />}
        iconBg="bg-[#dcfce7]"
        iconColor="text-[#16a34a]"
        value={metrics.invitacionesActivas}
        label="Invitaciones Activas"
      />
      <MetricCard
        icon={<Clock className="w-[1.3rem] h-[1.3rem]" />}
        iconBg="bg-[#ffedd5]"
        iconColor="text-[#ea580c]"
        value={metrics.proximasAExpirar}
        label="Próximas a Expirar"
      />
      <MetricCard
        icon={<TrendingUp className="w-[1.3rem] h-[1.3rem]" />}
        iconBg="bg-[#dbeafe]"
        iconColor="text-[#2563eb]"
        value={fmtPrice(metrics.ingresosDelMes)}
        label="Ingresos (30 días)"
      />
    </div>
  )
}
