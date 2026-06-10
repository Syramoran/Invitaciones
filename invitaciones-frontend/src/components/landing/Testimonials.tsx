import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { Ornament } from './Ornament'

const testimonials = [
  {
    quote:
      'Todos los invitados nos felicitaron por la invitacion. El mapa y la confirmacion de asistencia fueron clave para organizar todo sin estrés.',
    author: 'Lucia & Matias',
    event: 'Boda',
  },
  {
    quote:
      'Mi hija quedo encantada con su invitacion. Amamos!',
    author: 'Andrea M.',
    event: 'Quinceañera',
  },
  {
    quote:
      'En 10 minutos ya tenia todo armado. Super facil y quedo hermoso. Lo recomiendo a todos.',
    author: 'Tomas R.',
    event: 'Cumple de 30',
  },
]

export function Testimonials() {
  return (
    <section id="testimonios" className="py-16 relative">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Ornament />
          <span className="text-xs tracking-[3px] uppercase text-rose-deep font-medium block mb-3">
            Testimonios
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-charcoal mb-4">
            Lo que dicen nuestros clientes
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-3xl p-9 px-8 border border-charcoal/5 transition-all hover:shadow-md hover:-translate-y-1 flex flex-col"
            >
              <p className="text-sm text-charcoal-soft font-light leading-relaxed mb-5 italic relative pl-4 flex-1">
                <span className="absolute -left-1 -top-4 font-display text-5xl text-gold-light leading-none">
                  {'"'}
                </span>
                {testimonial.quote}
              </p>
              <div>
                <div className="flex gap-0.5 text-gold text-sm mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold" />
                  ))}
                </div>
                <div className="text-sm font-medium text-charcoal">{testimonial.author}</div>
                <div className="text-xs text-warm-gray font-light mt-0.5">{testimonial.event}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
