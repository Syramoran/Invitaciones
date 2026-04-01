import type { Template } from '@/services/templateService'
import { TIPO_LABEL } from '@/services/templateService'

// Gradiente placeholder por tipo de evento cuando no hay thumbnailUrl
const PLACEHOLDER_STYLE: Record<number, { bg: string; color: string }> = {
  1: { bg: 'linear-gradient(135deg,#f7ede3,#efe0cc)', color: '#2d2926' }, // Boda
  2: { bg: 'linear-gradient(135deg,#fce4ec,#f8d0dc)', color: '#5a3a4a' }, // Quinceañera
  3: { bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', color: '#e65100' }, // Cumpleaños
}

const TIPO_BADGE_CLS: Record<number, string> = {
  1: 'bg-[#dbeafe] text-[#2563eb]',
  2: 'bg-[#fce7f3] text-[#9d174d]',
  3: 'bg-[#ffedd5] text-[#ea580c]',
}

interface Props {
  template: Template
  toggling: boolean
  onToggle: (id: number) => void
}

export function TemplateCard({ template, toggling, onToggle }: Props) {
  const placeholder = PLACEHOLDER_STYLE[template.tipoEventoId] ?? {
    bg: 'linear-gradient(135deg,#f4f5f7,#e5e7eb)',
    color: '#6b7280',
  }
  const badgeCls = TIPO_BADGE_CLS[template.tipoEventoId] ?? 'bg-[#e5e7eb] text-[#6b7280]'

  return (
    <div className={`bg-white rounded-xl border-2 transition-all overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 ${template.activo ? 'border-transparent' : 'border-transparent opacity-60'}`}>
      {/* Preview */}
      <div className="h-36 overflow-hidden relative">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-display text-base font-semibold px-4 text-center"
            style={{ background: placeholder.bg, color: placeholder.color }}
          >
            {template.nombre}
          </div>
        )}
        {/* Badge tipo evento */}
        <span className={`absolute top-2 left-2 text-[.65rem] font-semibold uppercase tracking-[.3px] px-2 py-0.5 rounded-full ${badgeCls}`}>
          {TIPO_LABEL[template.tipoEventoId] ?? `Tipo ${template.tipoEventoId}`}
        </span>
      </div>

      {/* Info + toggle */}
      <div className="px-3 py-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[.88rem] font-semibold truncate">{template.nombre}</p>
          {template.descripcion && (
            <p className="text-[.75rem] text-[#6b7280] mt-0.5 line-clamp-2">{template.descripcion}</p>
          )}
        </div>

        {/* Toggle activo */}
        <label className={`relative inline-block w-11 h-6 shrink-0 mt-0.5 ${toggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            checked={template.activo}
            disabled={toggling}
            onChange={() => onToggle(template.id)}
            className="sr-only peer"
          />
          <span className="absolute inset-0 bg-[#d1d5db] rounded-full transition-all peer-checked:bg-[#c5a572] after:content-[''] after:absolute after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:top-[3px] after:left-[3px] after:transition-all peer-checked:after:translate-x-5 after:shadow-sm" />
        </label>
      </div>
    </div>
  )
}
