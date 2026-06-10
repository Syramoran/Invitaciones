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
      <h2 className="font-display text-4xl font-semibold text-center mb-4 pb-4 dark:text-champagne-light">Elegí el diseño que más te guste</h2>

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
                <h4 className="font-display text-lg font-semibold dark:text-champagne-light">{t.nombre}</h4>
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
          <h4 className="font-display text-lg font-semibold mb-1 dark:text-champagne-light">Color favorito</h4>
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

      {/* Custom design CTA */}
      <div className="mt-8 mb-4 max-w-3xl mx-auto rounded-2xl border border-champagne-dark dark:border-white/10 bg-champagne/20 dark:bg-charcoal-soft/50 px-8 py-7 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left animate-step-in">
        <div className="text-4xl select-none">✨</div>
        <div className="flex-1">
          <p className="text-base font-semibold text-charcoal dark:text-champagne-light leading-snug mb-1">
            ¿No encontrás el diseño ideal?
          </p>
          <p className="text-sm text-warm-gray font-light leading-relaxed">
            Armamos uno a tu medida, con los colores, tipografías y estilo que siempre soñaste.
          </p>
        </div>
        <a
          href="https://wa.me/5493435083034?text=Hola%2C%20me%20gustar%C3%ADa%20consultar%20por%20un%20dise%C3%B1o%20personalizado"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#1ebe5d] hover:-translate-y-0.5 hover:shadow-lg transition-all whitespace-nowrap"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.103 1.51 5.833L.057 23.487a.5.5 0 0 0 .611.61l5.701-1.494A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 0 1-5.127-1.415l-.367-.218-3.804.997 1.013-3.694-.239-.38A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Escribinos
        </a>
      </div>

      <div className="flex justify-between items-center mt-10 max-w-3xl mx-auto">
        <button onClick={onPrev} className={btnBack}><ChevronLeft className="w-4 h-4" /> Anterior</button>
        <button disabled={!templateId} onClick={onNext} className={btnNext}>Siguiente <ChevronRight className="w-4 h-4" /></button>
      </div>
    </>
  )
}
