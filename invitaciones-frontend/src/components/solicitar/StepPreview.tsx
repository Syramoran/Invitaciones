import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PhoneMockup } from '@/components/landing/PhoneMockup'
import { InvitationPreview, SLUG_BY_EVENT_TYPE } from '@/components/landing/InvitationPreview'
import { EVENT_LABELS, btnBack, btnNext } from './data'
import { fmtPrice } from './utils'
import { SummaryItem } from './SummaryItem'
import type { AddonState, AddonData, EventType, PriceBreakdown } from './types'

interface Props {
  eventType: EventType
  templateName: string | null
  templateSlug?: string | null
  templateThumbnailUrl?: string | null
  color: string
  addons: AddonState
  addonsData: AddonData[]
  secondVersion: boolean
  prices: PriceBreakdown
  onNext: () => void
  onPrev: () => void
}

export function StepPreview({ eventType, templateName, templateSlug, templateThumbnailUrl, color, addons, addonsData, secondVersion, prices, onNext, onPrev }: Props) {
  const { total } = prices

  const activeAddonLabels = addonsData
    .filter(a => !a.incluidoEnBase && addons[a.id])
    .map(a => a.label)

  const allServices = ['Info del evento', 'Mapa', 'Fotos', 'URL única', ...activeAddonLabels]
  if (secondVersion) allServices.push('2da versión')

  return (
    <>
      <h2 className="font-display text-4xl font-semibold text-center mb-2 dark:text-champagne-light">Así se vería tu invitación</h2>
      <p className="text-warm-gray text-center font-light mb-12">Vista previa aproximada de tu diseño</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 items-start max-w-4xl mx-auto">
        {/* Phone mockup */}
        <div className="flex flex-col items-center gap-5">
          <PhoneMockup size="md">
            {templateSlug ? (
              <InvitationPreview slug={templateSlug} color={color || undefined} />
            ) : templateThumbnailUrl ? (
              <img src={templateThumbnailUrl} alt={templateName || 'Template'} className="w-full h-full object-cover" />
            ) : (
              <InvitationPreview slug={SLUG_BY_EVENT_TYPE[eventType]} color={color || undefined} />
            )}
          </PhoneMockup>
          <p className="text-sm text-warm-gray font-light text-center max-w-xs italic leading-relaxed">
           La invitación final será creada por nuestro equipo con los datos reales de tu evento.
          </p>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-charcoal rounded-2xl border border-black/[0.06] dark:border-white/5 p-7">
          <h4 className="font-display text-xl font-semibold mb-6 dark:text-champagne-light">Resumen de tu pedido</h4>
          <div className="space-y-4">
            <SummaryItem label="Tipo de evento" value={EVENT_LABELS[eventType]} />
            <SummaryItem label="Template"       value={templateName || '-'} />
            <SummaryItem label="Color elegido"  value={
              color === '' ? (
                <span className="text-sm text-warm-gray">Predeterminado (según plantilla)</span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full inline-block border border-black/10" style={{ background: color }} />
                  <span className="font-mono text-sm">{color}</span>
                </span>
              )
            } />
            <div>
              <div className="text-[0.68rem] uppercase tracking-[2px] text-warm-gray mb-2">Servicios</div>
              <div className="flex flex-wrap gap-1.5">
                {allServices.map(s => <span key={s} className="text-xs px-3 py-1.5 bg-ivory dark:bg-charcoal-soft rounded-full font-light">{s}</span>)}
              </div>
            </div>
            <div className="border-t border-ivory dark:border-white/10 pt-4 flex justify-between items-center">
              <span className="font-display text-base font-semibold">Total</span>
              <span className="font-display text-3xl font-bold">{fmtPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-12 max-w-4xl mx-auto">
        <button onClick={onPrev} className={btnBack}><ChevronLeft className="w-4 h-4" /> Modificar</button>
        <button onClick={onNext} className={btnNext}>Continuar al pedido <ChevronRight className="w-4 h-4" /></button>
      </div>
    </>
  )
}
