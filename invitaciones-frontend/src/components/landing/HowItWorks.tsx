import { Link } from 'react-router-dom'
import { Monitor, ClipboardList, MessageCircle, Link2 } from 'lucide-react'
import { Ornament } from './Ornament'

const steps = [
  {
    icon: Monitor,
    title: 'Elegí y configurá',
    description: 'Seleccioná el tipo de evento, elegí un diseño y sumá los servicios que quieras',
  },
  {
    icon: ClipboardList,
    title: 'Hacé tu pedido',
    description: 'Completá tus datos, revisá el precio y enviá la solicitud',
  },
  {
    icon: MessageCircle,
    title: 'Coordinamos todo',
    description: 'Te contactamos por WhatsApp, nos pasas los detalles y fotos de tu evento',
  },
  {
    icon: Link2,
    title: 'Listo para compartir!',
    description: 'Recibís tu invitación con links únicos para cada invitado',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-ivory relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-dark to-transparent" />

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <Ornament />
          <span className="text-xs tracking-[3px] uppercase text-rose-deep font-medium block mb-3">
            El proceso
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-charcoal mb-4">
            Así de simple
          </h2>
          <p className="text-base text-warm-gray font-light leading-relaxed max-w-[560px] mx-auto">
            En 4 pasos tenes tu invitación lista para compartir
          </p>
        </div>

        <div className="max-w-[700px] mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-light to-champagne-dark md:block hidden" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-7 relative">
                <div className="w-[58px] h-[58px] min-w-[58px] rounded-full bg-white border-2 border-gold-light flex items-center justify-center font-display text-xl font-semibold text-gold-dark z-10">
                  {index + 1}
                </div>
                <div>
                  <div className="mb-1 text-charcoal-soft">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-1.5 mt-1">{step.title}</h3>
                  <p className="text-sm text-warm-gray font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-14">
          <Link
            to="/crear"
            className="inline-flex items-center gap-2 bg-charcoal text-champagne-light font-medium px-8 py-3.5 rounded-full hover:bg-charcoal-soft hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            Empezá ahora
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
