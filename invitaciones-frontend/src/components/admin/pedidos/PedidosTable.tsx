import { MessageCircle, Eye, PlusCircle } from 'lucide-react'
import type { Pedido } from '@/types/adminPedido'
import { fmtPrice, fmtDate } from '@/types/adminPedido'
import { PedidoStatusBadge } from './PedidoStatusBadge'

interface Props {
  pedidos: Pedido[]
  onView: (p: Pedido) => void
  onCrearInvitacion: (p: Pedido) => void
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left px-3 py-2.5 text-[.75rem] font-semibold uppercase tracking-[.5px] text-[#6b7280] bg-[#f4f5f7] border-b border-[#d1d5db] whitespace-nowrap">
    {children}
  </th>
)

function buildWaUrl(p: Pedido): string {
  const phone   = p.telefono.replace(/[^0-9+]/g, '')
  const nombre  = p.nombreCliente.split(' ')[0]
  const message = `Hola ${nombre}, soy de festejá. Recibimos tu pedido de invitación para ${p.tipoEventoNombre}.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function PedidosTable({ pedidos, onView, onCrearInvitacion }: Props) {
  if (pedidos.length === 0) {
    return (
      <div className="text-center py-16 text-[#9ca3af] text-sm">
        No se encontraron pedidos con los filtros aplicados.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <TH>ID</TH>
            <TH>Cliente</TH>
            <TH>Teléfono</TH>
            <TH>Tipo</TH>
            <TH>Template</TH>
            <TH>Servicios</TH>
            <TH>Precio</TH>
            <TH>Estado</TH>
            <TH>Fecha</TH>
            <TH>Acciones</TH>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p, i) => (
            <tr
              key={p.id}
              className={`border-b border-[#f0f0f0] hover:bg-[#fafbfc] transition-colors ${
                i % 2 === 1 ? 'bg-[#fafbfd] hover:bg-[#f5f6f8]' : ''
              }`}
            >
              {/* ID */}
              <td className="px-3 py-2.5 text-[.8rem] font-medium text-[#6b7280] whitespace-nowrap">
                PED-{String(p.id).padStart(3, '0')}
              </td>

              {/* Cliente */}
              <td className="px-3 py-2.5 text-[.85rem] font-medium whitespace-nowrap">
                {p.nombreCliente}
              </td>

              {/* Teléfono */}
              <td className="px-3 py-2.5 text-[.82rem] text-[#6b7280] whitespace-nowrap">
                {p.telefono}
              </td>

              {/* Tipo */}
              <td className="px-3 py-2.5 text-[.85rem] whitespace-nowrap">
                {p.tipoEventoNombre}
              </td>

              {/* Template */}
              <td className="px-3 py-2.5 text-[.85rem] text-[#6b7280]">
                {p.templateNombre}
              </td>

              {/* Servicios */}
              <td className="px-3 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {p.servicios.length > 0
                    ? p.servicios.map(s => (
                        <span
                          key={s.servicioId}
                          className="inline-block px-1.5 py-0.5 text-[.68rem] bg-[#f4f5f7] text-[#6b7280] rounded"
                        >
                          {s.nombre}
                        </span>
                      ))
                    : <span className="text-[#9ca3af] text-[.82rem]">—</span>
                  }
                </div>
              </td>

              {/* Precio */}
              <td className="px-3 py-2.5 text-[.85rem] font-semibold whitespace-nowrap">
                {fmtPrice(p.precioTotal)}
              </td>

              {/* Estado */}
              <td className="px-3 py-2.5">
                <PedidoStatusBadge estado={p.estado} />
              </td>

              {/* Fecha */}
              <td className="px-3 py-2.5 text-[.82rem] text-[#6b7280] whitespace-nowrap">
                {fmtDate(p.createdAt)}
              </td>

              {/* Acciones */}
              <td className="px-3 py-2.5">
                <div className="flex gap-1.5 flex-wrap">
                  {/* Ver detalle */}
                  <button
                    onClick={() => onView(p)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[.75rem] font-medium border border-[#d1d5db] rounded-lg hover:border-[#2d2926] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver
                  </button>

                  {/* WhatsApp */}
                  <a
                    href={buildWaUrl(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-[.75rem] font-medium bg-[#25D366] text-white rounded-lg hover:bg-[#1eb954] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WA
                  </a>

                  {/* Crear invitación — solo si aún no está completado ni cancelado */}
                  {(p.estado === 'PENDIENTE' || p.estado === 'CONTACTADO') && (
                    <button
                      onClick={() => onCrearInvitacion(p)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[.75rem] font-medium bg-[#c5a572] text-white rounded-lg hover:bg-[#9e7f4e] transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Crear
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
