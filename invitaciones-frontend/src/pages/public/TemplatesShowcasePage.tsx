import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { PhoneMockup } from '@/components/landing/PhoneMockup'
import { InvitationPreview } from '@/components/landing/InvitationPreview'
import { Ornament } from '@/components/landing/Ornament'
import { TEMPLATES_BY_EVENT, tabs, type TabType } from '@/components/landing/Showcase'

export default function TemplatesShowcasePage() {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('boda')

  const templates = TEMPLATES_BY_EVENT[activeTab]

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal transition-colors duration-300 font-sans">
      {/* Navbar with Logo only (no links to landing as requested) */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-cream/85 dark:bg-charcoal/85 backdrop-blur-xl shadow-[0_1px_0_rgba(45,41,38,0.06)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="font-display text-2xl font-semibold tracking-tight text-charcoal dark:text-champagne-light select-none">
            festejá
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full transition-colors duration-300 text-charcoal hover:bg-black/5 dark:text-champagne-light dark:hover:bg-white/10"
              title="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-[1200px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Ornament />
          <span className="text-xs tracking-[3px] uppercase text-rose-deep font-medium block mb-3">
            Muestrario de Plantillas
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-charcoal dark:text-champagne-light mb-4">
            Descubrí nuestros diseños
          </h1>
          <p className="text-lg text-warm-gray font-light leading-relaxed max-w-[600px] mx-auto">
            Explorá las diferentes opciones y encontrá el estilo perfecto para tu evento.
          </p>
        </motion.div>

        {/* Event type tabs */}
        <div className="flex justify-center gap-3 mb-16 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 rounded-full border-[1.5px] text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-charcoal text-champagne-light border-charcoal dark:bg-champagne-light dark:text-charcoal dark:border-champagne-light'
                  : 'bg-transparent text-charcoal-soft dark:text-warm-gray border-champagne-dark dark:border-warm-gray hover:bg-charcoal hover:text-champagne-light hover:border-charcoal dark:hover:bg-champagne-light dark:hover:text-charcoal dark:hover:border-champagne-light'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 justify-items-center">
          {templates.map((t) => (
            <div key={t.slug} className="flex flex-col items-center max-w-[320px] w-full">
              <div className="mb-6 text-center">
                <h3 className="font-display text-2xl font-semibold text-charcoal dark:text-champagne-light mb-1">
                  {t.label}
                </h3>
                <p className="text-sm text-warm-gray font-light h-10">
                  {t.description}
                </p>
              </div>
              <PhoneMockup size="md">
                <div className="relative w-full h-full">
                  <InvitationPreview slug={t.slug} interactive={true} />
                </div>
              </PhoneMockup>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
