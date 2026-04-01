import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BASE_PRICE, ADDONS_DATA, btnBack, btnNext } from './data'
import { fmtPrice } from './utils'
import type { AddonState, PriceBreakdown } from './types'

interface Props {
  addons: AddonState
  toggleAddon: (id: keyof AddonState) => void
  secondVersion: boolean
  setSecondVersion: React.Dispatch<React.SetStateAction<boolean>>
  prices: PriceBreakdown
  onNext: () => void
  onPrev: () => void
}

const INCLUDED_FEATURES = [
  'Información del evento (fecha, hora, ubicación, dress code)',
  'Mapa con Google Maps',
  'Hasta 5 fotos del anfitrión',
  'URL única para compartir',
  '3 meses de almacenamiento post-evento',
]

export function StepServicios({ addons, toggleAddon, secondVersion, setSecondVersion, prices, onNext, onPrev }: Props) {
  const { addonsTotal, subtotal, secondCost, total } = prices

  return (
    <>
      <h2 className="font-display text-4xl font-semibold text-center mb-2">Personalizá tu invitación</h2>
      <p className="text-warm-gray text-center font-light mb-12">Agregá o quitá servicios según lo que necesites</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Left */}
        <div>
          <div className="bg-[#edf7ed] rounded-2xl p-6 mb-8">
            <h4 className="font-display text-lg font-semibold text-[#3a7a3a] mb-3">Incluido en la base</h4>
            <ul className="space-y-2">
              {INCLUDED_FEATURES.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-charcoal-soft font-light">
                  <span className="text-[#5a9a5a] font-bold mt-0.5 shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <h4 className="font-display text-lg font-semibold mb-4">Servicios adicionales</h4>
          <div className="space-y-3">
            {ADDONS_DATA.map(a => {
              const active = addons[a.id as keyof AddonState]
              return (
                <div key={a.id} className={`flex items-center gap-4 bg-white rounded-2xl p-5 border transition-all ${active ? 'border-gold bg-[rgba(197,165,114,0.04)]' : 'border-black/[0.06] hover:border-champagne-dark'}`}>
                  <button
                    role="switch" aria-checked={active}
                    onClick={() => toggleAddon(a.id as keyof AddonState)}
                    className={`relative min-w-[48px] h-7 rounded-full transition-colors duration-200 ${active ? 'bg-gold' : 'bg-champagne-dark'}`}
                  >
                    <span className={`absolute top-[3px] w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-all duration-200 ${active ? 'left-[23px]' : 'left-[3px]'}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{a.label}</div>
                    <div className="text-xs text-warm-gray font-light">{a.desc}</div>
                  </div>
                  <div className="font-semibold text-sm whitespace-nowrap">{fmtPrice(a.price)}</div>
                </div>
              )
            })}

            {/* 2da versión */}
            <div className={`flex items-center gap-4 bg-champagne-light rounded-2xl p-5 border-[1.5px] border-dashed transition-all ${secondVersion ? 'border-gold' : 'border-gold-light'}`}>
              <button
                role="switch" aria-checked={secondVersion}
                onClick={() => setSecondVersion(v => !v)}
                className={`relative min-w-[48px] h-7 rounded-full transition-colors duration-200 ${secondVersion ? 'bg-gold' : 'bg-champagne-dark'}`}
              >
                <span className={`absolute top-[3px] w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-all duration-200 ${secondVersion ? 'left-[23px]' : 'left-[3px]'}`} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">2da versión de tarjeta</div>
                <div className="text-xs text-rose-deep font-normal">50% de descuento en la segunda versión</div>
              </div>
              <div className="font-semibold text-sm whitespace-nowrap">{secondVersion ? `+${fmtPrice(secondCost)}` : '+50%'}</div>
            </div>
          </div>
        </div>

        {/* Right: price panel desktop */}
        <div className="hidden lg:block">
          <div className="sticky top-[140px] bg-white rounded-2xl border border-black/[0.06] p-7">
            <h4 className="font-display text-xl font-semibold mb-5 pb-4 border-b border-ivory">Tu presupuesto</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-warm-gray font-light">Invitación base</span><span className="font-medium">{fmtPrice(BASE_PRICE)}</span></div>
              {ADDONS_DATA.map(a => addons[a.id as keyof AddonState] ? (
                <div key={a.id} className="flex justify-between"><span className="text-warm-gray font-light">{a.label}</span><span>{fmtPrice(a.price)}</span></div>
              ) : null)}
            </div>
            {(addonsTotal > 0 || secondVersion) && (
              <>
                <div className="h-px bg-ivory my-3" />
                <div className="flex justify-between text-sm"><span className="text-warm-gray font-light">Subtotal</span><span className="font-medium">{fmtPrice(subtotal)}</span></div>
              </>
            )}
            {secondVersion && (
              <div className="flex justify-between text-sm mt-2"><span className="text-warm-gray font-light">2da versión (50% desc.)</span><span>+{fmtPrice(secondCost)}</span></div>
            )}
            <div className="h-px bg-ivory my-4" />
            <div className="flex justify-between items-center">
              <span className="font-display text-lg font-semibold">Total</span>
              <span className="font-display text-3xl font-bold">{fmtPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-12">
        <button onClick={onPrev} className={btnBack}><ChevronLeft className="w-4 h-4" /> Anterior</button>
        <button onClick={onNext} className={btnNext}>Siguiente <ChevronRight className="w-4 h-4" /></button>
      </div>
    </>
  )
}
