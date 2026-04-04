import { useNavigate } from 'react-router-dom'
import { PedidoStatusBadge } from '@/components/admin/pedidos/PedidoStatusBadge'
import { fmtPrice } from '@/types/adminPedido'
import type { RecentOrder } from '@/types/dashboard'

interface Props {
  orders: RecentOrder[]
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left px-3 py-2 text-[.72rem] font-semibold uppercase tracking-[.5px] text-[#6b7280] bg-[#f4f5f7] border-b border-[#d1d5db] whitespace-nowrap">
    {children}
  </th>
)

export function RecentOrdersPanel({ orders }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,.08)] p-[22px]">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[1rem] font-semibold">Últimos Pedidos</h3>
        <button
          onClick={() => navigate('/admin/pedidos')}
          className="text-[.8rem] text-[#9e7f4e] font-medium hover:underline"
        >
          Ver todos →
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-[.85rem] text-[#9ca3af] text-center py-6">
          No hay pedidos recientes.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <TH>Cliente</TH>
                <TH>Evento</TH>
                <TH>Precio</TH>
                <TH>Estado</TH>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr
                  key={o.id}
                  className={`border-b border-[#f0f0f0] hover:bg-[#fafbfc] transition-colors ${
                    i % 2 === 1 ? 'bg-[#fafbfd]' : ''
                  }`}
                >
                  <td className="px-3 py-2.5 text-[.85rem] font-medium">{o.nombreCliente}</td>
                  <td className="px-3 py-2.5 text-[.85rem]">{o.tipoEventoNombre}</td>
                  <td className="px-3 py-2.5 text-[.85rem] font-semibold whitespace-nowrap">
                    {fmtPrice(o.precioTotal)}
                  </td>
                  <td className="px-3 py-2.5">
                    <PedidoStatusBadge estado={o.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
