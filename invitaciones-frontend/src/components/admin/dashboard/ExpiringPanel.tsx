import { useNavigate } from 'react-router-dom'
import type { ExpiringItem } from '@/types/dashboard'

interface Props {
  items: ExpiringItem[]
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function DaysLeftLabel({ days }: { days: number }) {
  const colorClass =
    days <= 7  ? 'text-[#dc2626] font-bold' :
    days <= 14 ? 'text-[#ea580c] font-semibold' :
                 'text-[#ca8a04] font-semibold'

  return (
    <span className={`text-[.85rem] whitespace-nowrap ${colorClass}`}>
      {days} {days === 1 ? 'día' : 'días'}
    </span>
  )
}

export function ExpiringPanel({ items }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,.08)] p-[22px]">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[1rem] font-semibold">Próximas a Expirar</h3>
        <button
          onClick={() => navigate('/admin/invitaciones')}
          className="text-[.8rem] text-[#9e7f4e] font-medium hover:underline"
        >
          Ver todas →
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-[.85rem] text-[#9ca3af] text-center py-6">
          No hay invitaciones próximas a expirar.
        </p>
      ) : (
        <div>
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center justify-between py-2.5 ${
                i < items.length - 1 ? 'border-b border-[#f0f0f0]' : ''
              }`}
            >
              <div>
                <p className="text-[.85rem] font-medium leading-tight">{item.titulo}</p>
                <p className="text-[.78rem] text-[#6b7280] mt-0.5">{fmtDate(item.fechaEvento)}</p>
              </div>
              <DaysLeftLabel days={item.daysLeft} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
