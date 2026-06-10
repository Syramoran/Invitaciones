import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ornament } from './Ornament'
import { PhoneMockup } from './PhoneMockup'
import { InvitationPreview } from './InvitationPreview'

type TabType = 'boda' | 'quince' | 'cumple'

interface TemplateOption {
  slug: string
  label: string
  description: string
  bg: string
  accent: string
  thumbnail: React.ReactNode
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'boda', label: 'Boda' },
  { id: 'quince', label: 'Quinceañera' },
  { id: 'cumple', label: 'Cumpleaños' },
]

const TEMPLATES_BY_EVENT: Record<TabType, TemplateOption[]> = {
  boda: [
    { slug: 'boda-clasica',  label: 'Clásica',  description: 'Romántica y atemporal', bg: '#faf7f2', accent: '#BD9848', thumbnail: <img src="/fotos-stock/boda-clasica/preview.png" alt="Clásica" className="w-full h-full object-cover" /> },
    { slug: 'boda-moderna',  label: 'Moderna',  description: 'Minimalista y elegante', bg: '#111',    accent: '#c8a97e', thumbnail: <img src="/fotos-stock/boda-moderna/preview.png" alt="Moderna" className="w-full h-full object-cover" /> },
    { slug: 'boda-rustica',  label: 'Rústica',  description: 'Natural y cálida',       bg: '#f3ede3', accent: '#8B5E3C', thumbnail: <img src="/fotos-stock/boda-rustica/preview.png" alt="Rústica" className="w-full h-full object-cover" /> },
  ],
  quince: [
    { slug: 'quince-princesa',  label: 'Princesa', description: 'Romántica y femenina', bg: '#fdf6fa', accent: '#9B4B6D', thumbnail: <img src="/fotos-stock/quince-princesa/preview.png" alt="Princesa" className="w-full h-full object-cover" /> },
    { slug: 'quince-elegante',  label: 'Elegante', description: 'Clásica y refinada',   bg: '#fdf7f0', accent: '#c4a882', thumbnail: <img src="/fotos-stock/quince-elegante/preview.png" alt="Elegante" className="w-full h-full object-cover" /> },
    { slug: 'quince-moderna',   label: 'Moderna',  description: 'Vibrante y joven',     bg: '#120c1a', accent: '#E91E8C', thumbnail: <img src="/fotos-stock/quince-moderna/preview.png" alt="Moderna" className="w-full h-full object-cover" /> },
  ],
  cumple: [
    { slug: 'cumple-elegante', label: 'Elegante', description: 'Sofisticada',         bg: '#080808', accent: '#ffffff', thumbnail: <img src="/fotos-stock/cumple-elegante/preview.png" alt="Elegante" className="w-full h-full object-cover" /> },
    { slug: 'cumple-festivo',  label: 'Festivo',  description: 'Colorida y divertida', bg: '#fffbf0', accent: '#FF4081', thumbnail: <img src="/fotos-stock/cumple-festivo/preview.png" alt="Festivo" className="w-full h-full object-cover" /> },
    { slug: 'cumple-infantil', label: 'Infantil', description: 'Alegre y juguetona',  bg: '#e0f4ff', accent: '#0288d1', thumbnail: <img src="/fotos-stock/cumple-infantil/preview.png" alt="Infantil" className="w-full h-full object-cover" /> },
  ],
}

const DEFAULT_SLUG: Record<TabType, string> = {
  boda:   'boda-clasica',
  quince: 'quince-princesa',
  cumple: 'cumple-festivo',
}

export function Showcase() {
  const [activeTab, setActiveTab] = useState<TabType>('boda')
  const [activeSlug, setActiveSlug] = useState<string>(DEFAULT_SLUG.boda)

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setActiveSlug(DEFAULT_SLUG[tab])
  }

  const templates = TEMPLATES_BY_EVENT[activeTab]

  return (
    <section id="showcase" className="py-16 relative">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Ornament />
          <span className="text-xs tracking-[3px] uppercase text-rose-deep font-medium block mb-3">
            Vista previa
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-charcoal dark:text-champagne-light mb-4">
            Mirá como se ve
          </h2>
          <p className="text-base text-warm-gray font-light leading-relaxed max-w-[560px] mx-auto">
            Cada tipo de evento tiene su propio estilo visual
          </p>
        </motion.div>

        {/* Event type tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-2.5 rounded-full border-[1.5px] text-sm font-normal transition-all ${
                activeTab === tab.id
                  ? 'bg-charcoal text-champagne-light border-charcoal dark:bg-champagne-light dark:text-charcoal dark:border-champagne-light'
                  : 'bg-transparent text-charcoal-soft dark:text-warm-gray border-champagne-dark dark:border-warm-gray hover:bg-charcoal hover:text-champagne-light hover:border-charcoal dark:hover:bg-champagne-light dark:hover:text-charcoal dark:hover:border-champagne-light'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main content: phone + template picker */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 lg:gap-12">

          {/* Template selector — above phone on mobile, right on desktop */}
          <div className="order-1 lg:order-2 w-full lg:w-auto flex flex-row lg:flex-col gap-3 justify-center lg:justify-start lg:pt-6">
            <p className="hidden lg:block text-[0.65rem] tracking-[2px] uppercase text-warm-gray font-medium mb-1">
              Diseños disponibles
            </p>
            {templates.map((t) => {
              const isActive = activeSlug === t.slug
              return (
                <button
                  key={t.slug}
                  onClick={() => setActiveSlug(t.slug)}
                  className={`group flex flex-col items-center lg:flex-row lg:items-center gap-2 lg:gap-3 transition-all rounded-xl p-1.5 lg:p-2 ${
                    isActive
                      ? 'bg-champagne/30 ring-1 ring-champagne-dark dark:ring-champagne'
                      : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    className={`w-[52px] aspect-[9/16] lg:w-[44px] rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                      isActive ? 'shadow-md ring-1 ring-champagne' : 'opacity-70 group-hover:opacity-100'
                    }`}
                  >
                    {t.thumbnail}
                  </div>
                  {/* Label — hidden on mobile, shown on desktop */}
                  <div className="hidden lg:flex flex-col text-left">
                    <span className={`text-xs font-medium leading-tight ${isActive ? 'text-charcoal dark:text-champagne-light' : 'text-charcoal-soft dark:text-warm-gray'}`}>
                      {t.label}
                    </span>
                    <span className="text-[0.65rem] text-warm-gray font-light leading-tight">
                      {t.description}
                    </span>
                  </div>
                  {/* Label — visible only on mobile, below thumbnail */}
                  <span className={`lg:hidden text-[0.65rem] font-medium ${isActive ? 'text-charcoal dark:text-champagne-light' : 'text-warm-gray'}`}>
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Phone mockup */}
          <div className="order-2 lg:order-1 flex-shrink-0">
            <PhoneMockup size="lg">
              <div className="relative w-full h-full">
                <div key={activeSlug} className="absolute inset-0 animate-step-in">
                  <InvitationPreview slug={activeSlug} />
                </div>
              </div>
            </PhoneMockup>
          </div>

        </div>

        {/* Custom design CTA */}
        <div className="mt-14 mx-auto max-w-xl rounded-2xl border border-champagne-dark dark:border-white/10 bg-champagne/20 dark:bg-charcoal-soft/50 px-8 py-7 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
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

      </div>
    </section>
  )
}
