import { ChevronDown } from 'lucide-react'
import { PhoneMockup } from './PhoneMockup'
import { InvitationPreview } from './InvitationPreview'
import { useCrearInvitacionModal } from '@/context/crearInvitacionModalContext'

export function Hero() {
  const { openModal } = useCrearInvitacionModal()

  const scrollToEvents = () => {
    const element = document.getElementById('showcase')
    if (element) {
      const offset = 80
      const pos = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: pos, behavior: 'smooth' })
    }
  }

  return (
    <section className="min-h-screen flex items-center py-32 pb-20 relative overflow-hidden bg-black">
      {/* Background photo */}
      <img
        src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none select-none"
      />
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />

      {/* Background shapes */}
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,var(--champagne)_0%,transparent_70%)] opacity-10 pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,var(--sage-light)_0%,transparent_70%)] opacity-10 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="lg:text-left text-center">
          {/* <div className="inline-flex items-center gap-2 bg-champagne px-5 py-2 rounded-full text-xs font-medium text-rose-deep tracking-[1px] uppercase mb-6">
            <Sparkles className="w-3 h-3" />
            Invitaciones digitales
          </div> */}

          <h1 className="animate-hero-item animate-hero-item-1 font-display text-4xl sm:text-5xl lg:text-[clamp(2.8rem,6vw,4.2rem)] font-semibold leading-[1.08] text-white mb-5">
            Tu evento merece
            <br />
            una invitación
            <br />
            <em className="animate-em-shimmer italic">inolvidable</em>
          </h1>

          <p className="animate-hero-item animate-hero-item-2 text-lg text-white/70 font-light leading-relaxed max-w-[480px] mb-9 lg:mx-0 mx-auto">
            Creá invitaciones digitales personalizadas con mapa, música, confirmación de asistencia
            y más. Todo en un link, listo para compartir.
          </p>

          <div className="animate-hero-item animate-hero-item-3 flex items-center gap-4 flex-wrap lg:justify-start justify-center">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 bg-champagne-light text-charcoal font-medium px-8 py-3.5 rounded-full hover:bg-champagne hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              Empezá a crear
              <span>→</span>
            </button>
            <button
              onClick={scrollToEvents}
              className="inline-flex items-center gap-2 text-champagne font-medium px-2 py-3.5 hover:text-white transition-colors"
            >
              Ver ejemplos
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center animate-hero-phone-in lg:mt-0 mt-10">
          <PhoneMockup>
            <InvitationPreview slug="cumple-festivo" />
          </PhoneMockup>
        </div>
      </div>
    </section>
  )
}
