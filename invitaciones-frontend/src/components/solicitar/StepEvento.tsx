import { Check, ChevronRight } from 'lucide-react'
import { btnNext } from './data'
import type { EventType } from './types'

interface Props {
  eventType: EventType | null
  setEventType: (t: EventType) => void
  onNext: () => void
}

const EVENTS = [
  { type: 'boda'   as EventType, emoji: '💍', title: 'Boda',        desc: 'Celebrá el amor con una invitación a la altura',                  bg: 'bg-gradient-to-br from-[#f7ede3] to-[#fce4d4]' },
  { type: 'quince' as EventType, emoji: '👑', title: 'Quinceañera', desc: 'Los 15 más soñados empiezan con la invitación perfecta',           bg: 'bg-gradient-to-br from-[#f0e0f0] to-[#fce4ec]' },
  { type: 'cumple' as EventType, emoji: '🎂', title: 'Cumpleaños',  desc: 'De 1 a 100, cada cumpleaños merece algo especial',                 bg: 'bg-gradient-to-br from-[#e3f0e8] to-[#d4f0e0]' },
]

export function StepEvento({ eventType, setEventType, onNext }: Props) {
  return (
    <>
      <h2 className="font-display text-4xl font-semibold text-center mb-2">¿Qué estás celebrando?</h2>
      <p className="text-warm-gray text-center font-light mb-12">Elegí el tipo de evento para ver diseños personalizados</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {EVENTS.map(e => (
          <button
            key={e.type}
            onClick={() => setEventType(e.type)}
            className={`relative bg-white rounded-3xl p-10 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              eventType === e.type ? 'border-2 border-gold shadow-[0_0_0_4px_rgba(197,165,114,0.15)]' : 'border-2 border-transparent shadow-md'
            }`}
          >
            {eventType === e.type && (
              <span className="absolute top-4 right-4 w-7 h-7 bg-gold rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </span>
            )}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 ${e.bg}`}>
              {e.emoji}
            </div>
            <h3 className="font-display text-2xl font-semibold mb-2">{e.title}</h3>
            <p className="text-sm text-warm-gray font-light leading-relaxed">{e.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-end mt-12 max-w-3xl mx-auto">
        <button disabled={!eventType} onClick={onNext} className={btnNext}>
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </>
  )
}
