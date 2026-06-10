import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { env } from '@/config/env'
import { EVENT_LABELS } from './data'
import { fmtPrice } from './utils'
import { SummaryItem } from './SummaryItem'
import type { AddonState, AddonData, EventType, PriceBreakdown } from './types'
import type { PedidoResponseDto } from '@/services/pedidoService'

interface Props {
  confirmedOrder: PedidoResponseDto | null
  eventType: EventType
  templateName: string | null
  form: { name: string; phone: string; email: string }
  addons: AddonState
  addonsData: AddonData[]
  secondVersion: boolean
  prices: PriceBreakdown
}

const NEXT_STEPS = [
  'Te contactamos por WhatsApp en las próximas 24 hs',
  'Coordinamos los detalles y fotos de tu evento',
  'Acordamos el pago (transferencia o MercadoPago)',
  '¡Creamos tu invitación y te enviamos los links!',
]

export function StepConfirmacion({ confirmedOrder, eventType, templateName, form, addons, addonsData, secondVersion, prices }: Props) {
  const { total } = prices
  const orderId = confirmedOrder?.ordenId || `#PED-${Math.floor(Math.random() * 9000 + 1000)}`

  const activeAddonLabels = addonsData
    .filter(a => !a.incluidoEnBase && addons[a.id])
    .map(a => a.label)

  const waMsg = encodeURIComponent(
    `Hola! Acabo de hacer un pedido de invitación digital.\n\nPedido: ${orderId}\nEvento: ${EVENT_LABELS[eventType]}\nTemplate: ${templateName || '-'}\nTotal: ${fmtPrice(total)}\n\nNombre: ${form.name}\nTeléfono: ${form.phone}\nEmail: ${form.email}`
  )
  const waUrl = `https://wa.me/${env.whatsappNumber || ''}?text=${waMsg}`

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-[#6a9e6a] rounded-full flex items-center justify-center mx-auto mb-6 animate-hero-fade-in">
        <Check className="w-9 h-9 text-white stroke-[3]" />
      </div>
      <h2 className="font-display text-4xl font-bold mb-3 dark:text-champagne-light">¡Pedido recibido!</h2>
      <p className="text-warm-gray dark:text-champagne-light/80 font-light text-lg mb-10 leading-relaxed">
        Nos vamos a contactar con vos por WhatsApp para coordinar los detalles de tu evento y el pago.
      </p>

      {/* Order details */}
      <div className="bg-white dark:bg-charcoal rounded-2xl border border-black/[0.06] dark:border-white/5 p-7 text-left mb-6">
        <h4 className="font-display text-xl font-semibold mb-4 dark:text-champagne-light">Detalle del pedido</h4>
        <span className="inline-block bg-champagne dark:bg-charcoal-soft px-4 py-1.5 rounded-full text-sm font-semibold mb-5 dark:text-champagne-light">{orderId}</span>
        <div className="space-y-3">
          <SummaryItem label="Cliente"   value={form.name} />
          <SummaryItem label="Contacto"  value={`${form.phone} · ${form.email}`} />
          <SummaryItem label="Evento"    value={EVENT_LABELS[eventType]} />
          <SummaryItem label="Template"  value={templateName || '-'} />
          {activeAddonLabels.length > 0 && (
            <SummaryItem label="Servicios adicionales" value={activeAddonLabels.join(', ')} />
          )}
          {secondVersion && <SummaryItem label="2da versión" value="Sí (50% desc.)" />}
          <div className="border-t border-ivory dark:border-white/10 pt-3 flex justify-between items-center">
            <span className="font-display text-base font-semibold">Total</span>
            <span className="font-display text-2xl font-bold">{fmtPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-ivory dark:bg-charcoal-soft rounded-2xl p-7 text-left mb-8">
        <h4 className="font-display text-xl font-semibold mb-4 dark:text-champagne-light">Próximos pasos</h4>
        <ol className="space-y-3">
          {NEXT_STEPS.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-light text-charcoal-soft dark:text-champagne-light/90">
              <span className="min-w-[28px] h-7 bg-gold text-white rounded-full flex items-center justify-center text-xs font-semibold shrink-0">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={waUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-9 py-4 rounded-full font-medium hover:bg-[#1eb954] hover:-translate-y-0.5 transition-all shadow-[0_4px_16px_rgba(37,211,102,0.3)]"
        >
          Contactar por WhatsApp →
        </a>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 border border-charcoal dark:border-cream text-charcoal dark:text-champagne-light px-9 py-4 rounded-full font-medium hover:bg-charcoal hover:text-champagne-light dark:hover:bg-cream dark:hover:text-charcoal transition-all"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
