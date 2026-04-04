import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { COLORS, btnBack, btnNext } from './data'
import type { EventType } from './types'
import type { Template } from '@/services/templateService'

// Gradiente placeholder por tipo de evento cuando no hay thumbnailUrl
const PLACEHOLDER: Record<EventType, { bg: string; color: string }> = {
  boda:   { bg: 'linear-gradient(135deg,#f7ede3,#efe0cc)', color: '#2d2926' },
  quince: { bg: 'linear-gradient(135deg,#fce4ec,#f8d0dc)', color: '#5a3a4a' },
  cumple: { bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', color: '#e65100' },
}

interface Props {
  eventType: EventType
  templates: Template[]
  templatesLoading: boolean
  templateId: number | null
  setTemplateId: (id: number) => void
  color: string
  setColor: (c: string) => void
  onNext: () => void
  onPrev: () => void
}

export function StepDiseno({
  eventType, templates, templatesLoading,
  templateId, setTemplateId, color, setColor, onNext, onPrev,
}: Props) {
  const placeholder = PLACEHOLDER[eventType]

  return (
    <>
      <h2 className="font-display text-4xl font-semibold text-center mb-4 pb-4">Elegí el diseño que más te guste</h2>

      {/* Grid de templates */}
      {templatesLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-warm-gray">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Cargando diseños...</span>
        </div>
      ) : templates.length === 0 ? (
        <p className="text-center text-warm-gray py-16 text-sm">
          No hay diseños disponibles para este tipo de evento por el momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`relative bg-white rounded-2xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                templateId === t.id
                  ? 'border-2 border-gold shadow-[0_0_0_4px_rgba(197,165,114,0.15)]'
                  : 'border-2 border-transparent shadow-md'
              }`}
            >
              {templateId === t.id && (
                <span className="absolute top-3 right-3 z-10 bg-gold text-white text-[0.68rem] font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Seleccionado
                </span>
              )}

              {/* Preview: imagen real o gradiente placeholder */}
              {t.thumbnailUrl ? (
                <img
                  src={t.thumbnailUrl}
                  alt={t.nombre}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div
                  className="w-full h-40 flex items-center justify-center font-display text-lg font-semibold px-4 text-center"
                  style={{ background: placeholder.bg, color: placeholder.color }}
                >
                  {t.nombre}
                </div>
              )}

              <div className="p-5">
                <h4 className="font-display text-lg font-semibold">{t.nombre}</h4>
                {t.descripcion && (
                  <p className="text-sm text-warm-gray mt-1 font-light">{t.descripcion}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Color selector */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-black/[0.06] mb-2">
        <h4 className="font-display text-lg font-semibold mb-1">Color favorito</h4>
        <p className="text-sm text-warm-gray font-light mb-5">Elegí el color que preferirías para tu invitación</p>
        <div className="flex flex-wrap items-center gap-3">
          {COLORS.map(c => (
            <button
              key={c.hex}
              title={c.label}
              onClick={() => setColor(c.hex)}
              style={{
                background: c.hex,
                boxShadow: color === c.hex ? `0 0 0 2px white, 0 0 0 4px ${c.hex}` : undefined,
                transform: color === c.hex ? 'scale(1.15)' : undefined,
              }}
              className="relative w-9 h-9 rounded-full transition-all duration-200 hover:scale-110"
            >
              {color === c.hex && (
                <Check className="w-4 h-4 absolute inset-0 m-auto text-white drop-shadow" />
              )}
            </button>
          ))}
          <label className="flex items-center gap-2 cursor-pointer ml-1 group">
            <span className="relative w-9 h-9 rounded-full overflow-hidden border border-black/10 flex items-center justify-center">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                title="Color personalizado"
              />
              <span
                className="w-full h-full block"
                style={{ background: COLORS.some(c => c.hex === color) ? 'linear-gradient(135deg,#f0f,#0ff,#ff0)' : color }}
              />
            </span>
            <span className="text-sm text-warm-gray group-hover:text-charcoal transition-colors">Personalizado</span>
          </label>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <span className="w-5 h-5 rounded-full border border-black/10 inline-block" style={{ background: color }} />
          <span className="text-sm text-warm-gray font-mono">{color}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-10 max-w-3xl mx-auto">
        <button onClick={onPrev} className={btnBack}><ChevronLeft className="w-4 h-4" /> Anterior</button>
        <button disabled={!templateId} onClick={onNext} className={btnNext}>Siguiente <ChevronRight className="w-4 h-4" /></button>
      </div>
    </>
  )
}
