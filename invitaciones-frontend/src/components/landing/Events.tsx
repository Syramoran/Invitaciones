import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Ornament } from './Ornament'

const events = [
  {
    title: 'Bodas',
    description: 'Invitaciones para el día más importante',
    features: ['Ceremonia y fiesta', 'Historia de los novios', 'Mapa', 'Confirmación de asistencia'],
    link: '/crear?tipo=boda',
    image: '/wedding-event.png',
    imageAlt: 'Boda',
  },
  {
    title: 'Quinceañeras',
    description: 'Hacé brillar los 15 de tu hija',
    features: ['Tematica personalizada', 'Vals', 'Padrinos', 'Galeria de fotos'],
    link: '/crear?tipo=quince',
    image: '/quince-event.png',
    imageAlt: 'Quinceañera',
  },
  {
    title: 'Cumpleaños',
    description: 'De infantiles a adultos, cada cumple merece algo especial',
    features: ['Cualquier edad', 'Actividades', 'Dress code', 'Flexible'],
    link: '/crear?tipo=cumple',
    image: '/birthday-event.png',
    imageAlt: 'Cumpleaños',
  },
]

export function Events() {
  return (
    <section id="eventos" className="py-24 relative bg-ivory">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <Ornament />
          <span className="text-xs tracking-[3px] uppercase text-rose-deep font-medium block mb-3">
            Tipos de evento
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-charcoal mb-4">
            ¿Qué estás celebrando?
          </h2>
          <p className="text-base text-warm-gray font-light leading-relaxed max-w-[560px] mx-auto">
            Diseños exclusivos para cada ocasión
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {events.map((event, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl overflow-hidden border border-charcoal/5 transition-all hover:-translate-y-1.5 hover:shadow-lg cursor-pointer"
            >
              <div className="h-[200px] overflow-hidden">
                <img src={event.image} alt={event.imageAlt} className="w-full h-full object-cover" />
              </div>
              <div className="p-7">
                <h3 className="font-display text-2xl font-semibold mb-2">{event.title}</h3>
                <p className="text-sm text-warm-gray font-light mb-4">{event.description}</p>
                <Link
                  to={event.link}
                  className="inline-flex items-center gap-2 text-rose-deep font-medium hover:text-charcoal transition-colors"
                >
                  Ver diseños
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
