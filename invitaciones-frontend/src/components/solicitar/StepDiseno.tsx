import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react'
import { btnBack, btnNext } from './data'
import type { EventType } from './types'
import type { Template } from '@/services/templateService'
import { TEMPLATE_COLORS, COLORES_PALETA } from '@/types/crearInvitacion'
import { InvitationPreview } from '@/components/landing/InvitationPreview'

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
  const [playingId, setPlayingId] = useState<number | null>(null)
  const placeholder = PLACEHOLDER[eventType]

  const selectedTemplate = templates.find(t => t.id === templateId)
  const templateSlug = selectedTemplate?.slug
  const currentPalette = templateSlug ? (TEMPLATE_COLORS[templateSlug] || COLORES_PALETA) : COLORES_PALETA

  return (
    <>
      <h2 className="font-display text-4xl font-semibold text-center mb-4 pb-4 dark:text-cream">Elegí el diseño que más te guste</h2>

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
              onClick={() => {
                if (templateId !== t.id) {
                  setColor('')
                  setPlayingId(null)
                }
                setTemplateId(t.id)
              }}
              className={`relative bg-white dark:bg-charcoal rounded-2xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-white/5 ${
                templateId === t.id
                  ? 'border-2 border-gold shadow-[0_0_0_4px_rgba(197,165,114,0.15)] dark:shadow-[0_0_0_4px_rgba(197,165,114,0.3)]'
                  : 'border-2 border-transparent shadow-md dark:shadow-none dark:border-white/5'
              }`}
            >
              {templateId === t.id && (
                <span className="absolute top-3 right-3 z-10 bg-gold text-white text-[0.68rem] font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Seleccionado
                </span>
              )}

              {/* Preview real del template */}
              <div className="w-full aspect-[9/16] relative overflow-hidden bg-[#faf7f2] group">
                {t.slug ? (
                  <InvitationPreview 
                    slug={t.slug} 
                    color={color || undefined} 
                    interactive={playingId === t.id} 
                    paused={playingId !== t.id}
                  />
                ) : t.thumbnailUrl ? (
                  <img
                    src={t.thumbnailUrl}
                    alt={t.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-display text-lg font-semibold px-4 text-center"
                    style={{ background: placeholder.bg, color: placeholder.color }}
                  >
                    {t.nombre}
                  </div>
                )}
                <div className="absolute inset-0 z-10 pointer-events-none"></div>

                {playingId !== t.id && t.slug && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setPlayingId(t.id)
                      }}
                      className="bg-black/70 text-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 pointer-events-auto hover:bg-black cursor-pointer shadow-lg backdrop-blur-md transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Autoscroll
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h4 className="font-display text-lg font-semibold dark:text-cream">{t.nombre}</h4>
                {t.descripcion && (
                  <p className="text-sm text-warm-gray mt-1 font-light">{t.descripcion}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Color selector */}
      {templateId && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-charcoal rounded-2xl p-6 shadow-sm border border-black/[0.06] dark:border-white/5 mb-2 animate-step-in">
          <h4 className="font-display text-lg font-semibold mb-1 dark:text-cream">Color favorito</h4>
          <p className="text-sm text-warm-gray font-light mb-5">Elegí el color que preferirías para tu invitación, o dejá el predeterminado de la plantilla</p>
          <div className="flex flex-wrap items-center gap-3">
            {/* Swatch predeterminado */}
            <button
              title="Predeterminado"
              onClick={() => setColor('')}
              style={{
                boxShadow: color === '' ? '0 0 0 2px white, 0 0 0 4px #9ca3af' : undefined,
                transform: color === '' ? 'scale(1.15)' : undefined,
              }}
              className="relative w-9 h-9 rounded-full bg-white border border-black/20 overflow-hidden transition-all duration-200 hover:scale-110"
            >
              <span
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, transparent calc(50% - 1px), #dc2626 calc(50% - 1px), #dc2626 calc(50% + 1px), transparent calc(50% + 1px))' }}
              />
              {color === '' && (
                <Check className="w-4 h-4 absolute inset-0 m-auto text-gray-500 drop-shadow" />
              )}
            </button>
            {currentPalette.map(c => (
              <button
                key={c.hex}
                title={c.label}
                onClick={() => setColor(c.hex)}
                style={{
                  background: c.hex,
                  boxShadow: color.toLowerCase() === c.hex.toLowerCase() ? `0 0 0 2px white, 0 0 0 4px ${c.hex}` : undefined,
                  transform: color.toLowerCase() === c.hex.toLowerCase() ? 'scale(1.15)' : undefined,
                }}
                className="relative w-9 h-9 rounded-full transition-all duration-200 hover:scale-110"
              >
                {color.toLowerCase() === c.hex.toLowerCase() && (
                  <Check className="w-4 h-4 absolute inset-0 m-auto drop-shadow" style={{ color: templateSlug === 'cumple-elegante' ? '#555' : 'white' }} />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            {color === '' ? (
              <span className="text-sm text-warm-gray">Predeterminado (según plantilla)</span>
            ) : (
              <>
                <span className="w-5 h-5 rounded-full border border-black/10 inline-block" style={{ background: color }} />
                <span className="text-sm text-warm-gray">{currentPalette.find(c => c.hex.toLowerCase() === color.toLowerCase())?.label ?? color}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-10 max-w-3xl mx-auto">
        <button onClick={onPrev} className={btnBack}><ChevronLeft className="w-4 h-4" /> Anterior</button>
        <button disabled={!templateId} onClick={onNext} className={btnNext}>Siguiente <ChevronRight className="w-4 h-4" /></button>
      </div>
    </>
  )
}
