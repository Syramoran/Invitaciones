import { X } from 'lucide-react'
import type { Pedido } from '@/types/adminPedido'
import { fmtPrice, fmtDate } from '@/types/adminPedido'
import { PedidoStatusBadge } from './PedidoStatusBadge'

// Steps that appear in the progress stepper (CANCELADO is excluded from flow)
const FLOW_STEPS = ['PENDIENTE', 'CONTACTADO', 'COMPLETADO'] as const

interface Props {
  pedido: Pedido
  onClose: () => void
}

function ProgressStepper({ estado }: { estado: Pedido['estado'] }) {
  const isCancelled = estado === 'CANCELADO'
  const activeIdx   = isCancelled ? -1 : FLOW_STEPS.indexOf(estado as typeof FLOW_STEPS[number])

  return (
    <div className="flex items-center gap-0 mb-6">
      {FLOW_STEPS.map((step, i) => {
        const done    = !isCancelled && i < activeIdx
        const current = !isCancelled && i === activeIdx

        const circleClass = done || current
          ? done
            ? 'bg-[#16a34a] border-[#16a34a] text-white'
            : 'bg-[#c5a572] border-[#c5a572] text-white'
          : 'bg-white border-[#d1d5db] text-[#9ca3af]'

        const labelClass = done || current
          ? 'text-[#2d2926]'
          : 'text-[#9ca3af]'

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full border-[1.5px] flex items-center justify-content-center justify-center text-[.72rem] font-semibold ${circleClass}`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[.72rem] whitespace-nowrap ${labelClass}`}>
                {step.charAt(0) + step.slice(1).toLowerCase()}
              </span>
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <div className={`h-[2px] w-12 mx-1 mb-5 ${done ? 'bg-[#16a34a]' : 'bg-[#d1d5db]'}`} />
            )}
          </div>
        )
      })}

      {isCancelled && (
        <div className="ml-4 self-start mt-1">
          <PedidoStatusBadge estado="CANCELADO" />
        </div>
      )}
    </div>
  )
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <span className="text-[.78rem] text-[#6b7280]">{label}:</span>{' '}
    <strong className="text-[.88rem]">{value}</strong>
  </div>
)

export function PedidoDetailModal({ pedido, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-5"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-[600px] max-w-full max-h-[85vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,.2)] animate-[modalIn_.25s_ease]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
          <h3 className="text-[1.05rem] font-semibold">
            Pedido #{pedido.id}
          </h3>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#2d2926] hover:bg-[#f4f5f7] rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Progress stepper */}
          <ProgressStepper estado={pedido.estado} />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
            <InfoRow label="Cliente"  value={pedido.nombreCliente} />
            <InfoRow label="Teléfono" value={pedido.telefono} />
            <InfoRow label="Email"    value={pedido.email} />
            <InfoRow label="Tipo"     value={pedido.tipoEventoNombre} />
            <InfoRow label="Template" value={pedido.templateNombre} />
            <InfoRow label="Fecha"    value={fmtDate(pedido.createdAt)} />
            <InfoRow
              label="Precio total"
              value={
                <span className="text-[#2d2926] font-bold">
                  {fmtPrice(pedido.precioTotal)}
                </span>
              }
            />
            <InfoRow
              label="Estado"
              value={<PedidoStatusBadge estado={pedido.estado} />}
            />
          </div>

          {/* Services */}
          {pedido.servicios.length > 0 && (
            <div>
              <p className="text-[.78rem] text-[#6b7280] mb-2">Servicios solicitados:</p>
              <div className="flex flex-wrap gap-1.5">
                {pedido.servicios.map(s => (
                  <span
                    key={s.servicioId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f4f5f7] text-[#4a4441] text-[.78rem] rounded-lg"
                  >
                    {s.nombre}
                    <span className="text-[#9ca3af] text-[.7rem]">
                      {fmtPrice(s.precioAlMomento)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#f0f0f0] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#d1d5db] rounded-lg text-[.85rem] font-medium hover:border-[#2d2926] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
