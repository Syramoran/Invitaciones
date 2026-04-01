import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Ornament } from './Ornament'

const events = [
  {
    title: 'Bodas',
    description: 'Invitaciones elegantes para el dia mas importante',
    features: ['Ceremonia y fiesta', 'Historia de los novios', 'Mapa', 'Confirmacion'],
    gradient: 'bg-gradient-to-br from-[#f7ede3] to-[#fce4d4]',
    link: '/crear?tipo=boda',
    visual: <RingsArt />,
  },
  {
    title: 'Quinceañeras',
    description: 'Hace brillar los 15 de tu hija',
    features: ['Tematica personalizada', 'Vals', 'Padrinos', 'Galeria de fotos'],
    gradient: 'bg-gradient-to-br from-[#f0e0f0] to-[#fce4ec]',
    link: '/crear?tipo=quince',
    visual: <CrownArt />,
  },
  {
    title: 'Cumpleanos',
    description: 'De infantiles a adultos, cada cumple merece algo especial',
    features: ['Cualquier edad', 'Actividades', 'Dress code', 'Flexible'],
    gradient: 'bg-gradient-to-br from-[#e3f0e8] to-[#d4f0e0]',
    link: '/crear?tipo=cumple',
    visual: <CakeArt />,
  },
]

export function Events() {
  return (
    <section id="eventos" className="py-24 relative">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <Ornament />
          <span className="text-xs tracking-[3px] uppercase text-rose-deep font-medium block mb-3">
            Tipos de evento
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-charcoal mb-4">
            Que estas celebrando?
          </h2>
          <p className="text-base text-warm-gray font-light leading-relaxed max-w-[560px] mx-auto">
            Disenos exclusivos para cada ocasion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {events.map((event, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl overflow-hidden border border-charcoal/5 transition-all hover:-translate-y-1.5 hover:shadow-lg cursor-pointer"
            >
              <div
                className={`h-[200px] flex items-center justify-center relative overflow-hidden ${event.gradient}`}
              >
                {event.visual}
              </div>
              <div className="p-7">
                <h3 className="font-display text-2xl font-semibold mb-2">{event.title}</h3>
                <p className="text-sm text-warm-gray font-light mb-4">{event.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {event.features.map((feature, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 bg-ivory rounded-full text-charcoal-soft"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <Link
                  to={event.link}
                  className="inline-flex items-center gap-2 text-rose-deep font-medium hover:text-charcoal transition-colors"
                >
                  Ver templates
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RingsArt() {
  return (
    <div className="flex items-center">
      <div className="w-14 h-14 border-4 border-gold rounded-full" />
      <div className="w-14 h-14 border-4 border-rose rounded-full -ml-4" />
    </div>
  )
}

function CrownArt() {
  return (
    <div className="relative w-[70px] h-[50px]">
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gold rounded-b" />
      <div className="absolute bottom-3 left-[5px] w-3 h-7 bg-gold rounded-t-full" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3 h-[38px] bg-gold rounded-t-full" />
      <div className="absolute bottom-3 right-[5px] w-3 h-7 bg-gold rounded-t-full" />
      <div className="absolute bottom-[18px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#e8b4c8] rounded-full z-10" />
    </div>
  )
}

function CakeArt() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute -top-[18px] w-[3px] h-4 bg-gold rounded">
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-2 bg-[#f4a460] rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" />
      </div>
      <div className="w-10 h-5 bg-blush rounded-t-lg" />
      <div className="w-14 h-[22px] bg-sage" />
      <div className="w-[70px] h-6 bg-champagne-dark rounded-b-lg" />
    </div>
  )
}
