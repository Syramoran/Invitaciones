import { Zap, Link2, Palette, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { Ornament } from './Ornament'

const features = [
  {
    icon: Zap,
    title: 'Lista en el día',
    description: 'Armá tu invitacion en pocos pasos.',
    bgColor: 'bg-champagne',
  },
  {
    icon: Link2,
    title: 'Todo en un link',
    description: 'Mapa, música, confirmación de asistencia y galería de fotos en una sola URL',
    bgColor: 'bg-sage-light',
  },
  {
    icon: Palette,
    title: 'Personalizada',
    description: 'Elegí tipo de evento, diseño, colores y los servicios que necesites',
    bgColor: 'bg-blush',
  },
  {
    icon: User,
    title: 'URL por invitado',
    description: 'Cada invitado recibe un link con su nombre y puede confirmar asistencia',
    bgColor: 'bg-gradient-to-br from-gold-light to-champagne',
  },
]

export function Features() {
  return (
    <section id="features" className="py-16 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-dark to-transparent" />

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
            ¿Por qué elegirnos?
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-charcoal dark:text-cream mb-4">
            Rápido, única y hermosa
          </h2>
          <p className="text-base text-warm-gray font-light leading-relaxed max-w-[560px] mx-auto">
            Todo lo que necesitás para una invitacion perfecta, sin complicaciones.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-10 px-6 rounded-2xl bg-white dark:bg-charcoal border border-charcoal/5 dark:border-white/5 transition-all hover:-translate-y-1 hover:shadow-md dark:shadow-white/5"
            >
              <div
                className={`w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center ${feature.bgColor}`}
              >
                <feature.icon className="w-6 h-6 text-charcoal-soft" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 dark:text-cream">{feature.title}</h3>
              <p className="text-sm text-warm-gray font-light leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
