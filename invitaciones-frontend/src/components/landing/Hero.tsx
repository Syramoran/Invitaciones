import { Link } from 'react-router-dom'
import { Sparkles, ChevronDown } from 'lucide-react'
import { PhoneMockup } from './PhoneMockup'
import { InvitationPreview } from './InvitationPreview'

export function Hero() {
  const scrollToEvents = () => {
    const element = document.getElementById('eventos')
    if (element) {
      const offset = 80
      const pos = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: pos, behavior: 'smooth' })
    }
  }

  return (
    <section className="min-h-screen flex items-center py-32 pb-20 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,var(--champagne)_0%,transparent_70%)] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,var(--sage-light)_0%,transparent_70%)] opacity-30 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="animate-hero-fade-in lg:text-left text-center">
          <div className="inline-flex items-center gap-2 bg-champagne px-5 py-2 rounded-full text-xs font-medium text-rose-deep tracking-[1px] uppercase mb-6">
            <Sparkles className="w-3 h-3" />
            Invitaciones digitales
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-[clamp(2.8rem,6vw,4.2rem)] font-semibold leading-[1.08] text-charcoal mb-5">
            Tu evento merece
            <br />
            una invitacion
            <br />
            <em className="italic text-rose-deep">inolvidable</em>
          </h1>

          <p className="text-lg text-warm-gray font-light leading-relaxed max-w-[480px] mb-9 lg:mx-0 mx-auto">
            Crea invitaciones digitales personalizadas con mapa, musica, confirmacion de asistencia
            y mas. Todo en un link, listo para compartir.
          </p>

          <div className="flex items-center gap-4 flex-wrap lg:justify-start justify-center">
            <Link
              to="/crear"
              className="inline-flex items-center gap-2 bg-charcoal text-champagne-light font-medium px-8 py-3.5 rounded-full hover:bg-charcoal-soft hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              Empeza a crear
              <span>→</span>
            </Link>
            <button
              onClick={scrollToEvents}
              className="inline-flex items-center gap-2 text-rose-deep font-medium px-2 py-3.5 hover:text-charcoal transition-colors"
            >
              Ver ejemplos
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center animate-hero-phone-in lg:mt-0 mt-10">
          <PhoneMockup>
            <InvitationPreview type="boda" />
          </PhoneMockup>
        </div>
      </div>
    </section>
  )
}
