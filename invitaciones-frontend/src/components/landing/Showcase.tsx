import { useState } from 'react'
import { Ornament } from './Ornament'
import { PhoneMockup } from './PhoneMockup'
import { InvitationPreview } from './InvitationPreview'

type TabType = 'boda' | 'quince' | 'cumple'

const tabs: { id: TabType; label: string }[] = [
  { id: 'boda', label: 'Boda' },
  { id: 'quince', label: 'Quinceañera' },
  { id: 'cumple', label: 'Cumpleaños' },
]

export function Showcase() {
  const [activeTab, setActiveTab] = useState<TabType>('boda')

  return (
    <section id="showcase" className="py-24 relative">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          <Ornament />
          <span className="text-xs tracking-[3px] uppercase text-rose-deep font-medium block mb-3">
            Vista previa
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-charcoal mb-4">
            Mirá como se ve
          </h2>
          <p className="text-base text-warm-gray font-light leading-relaxed max-w-[560px] mx-auto">
            Cada tipo de evento tiene su propio estilo visual
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full border-[1.5px] text-sm font-normal transition-all ${
                activeTab === tab.id
                  ? 'bg-charcoal text-champagne-light border-charcoal'
                  : 'bg-transparent text-charcoal-soft border-champagne-dark hover:bg-charcoal hover:text-champagne-light hover:border-charcoal'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <PhoneMockup size="lg">
            <div className="relative w-full h-full">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    activeTab === tab.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <InvitationPreview type={tab.id} />
                </div>
              ))}
            </div>
          </PhoneMockup>
        </div>
      </div>
    </section>
  )
}
