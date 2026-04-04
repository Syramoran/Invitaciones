import { useState } from 'react'
import { StorageReporte } from '@/components/admin/reportes/StorageReporte'
import { SeguridadReporte } from '@/components/admin/reportes/SeguridadReporte'

type ReporteTab = 'storage' | 'seguridad'

const TABS: { id: ReporteTab; label: string }[] = [
  { id: 'storage',   label: 'Storage (Invitaciones)' },
  { id: 'seguridad', label: 'Seguridad / Rate Limit'  },
]

export default function ReportesPage() {
  const [tab, setTab] = useState<ReporteTab>('storage')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl font-semibold">Reportes</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f4f5f7] rounded-xl p-1 mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-[.82rem] font-medium transition-colors ${
              tab === t.id
                ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,.1)] text-[#2d2926]'
                : 'text-[#6b7280] hover:text-[#2d2926]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'storage'   && <StorageReporte />}
      {tab === 'seguridad' && <SeguridadReporte />}
    </div>
  )
}
