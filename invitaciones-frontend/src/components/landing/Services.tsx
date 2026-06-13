import {
  CalendarCheck,
  MapPin,
  Gift,
  Clock,
  Music,
  Camera,
  Shirt,
  ListTodo
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Ornament } from './Ornament'

const services = [
  {
    icon: CalendarCheck,
    title: 'Confirmación (RSVP)',
    description: 'Tus invitados pueden confirmar asistencia desde la invitación. Recibís las respuestas al instante.',
    image: '/servicios/confirmacion.jpg',
  },
  {
    icon: Clock,
    title: 'Cuenta Regresiva',
    description: 'Un reloj interactivo que marca los días, horas, minutos y segundos que faltan para el gran día.',
    image: '/servicios/cuenta_regresiva.jpg',
  },
  {
    icon: MapPin,
    title: 'Ubicación y Mapas',
    description: 'Integración con Google Maps para que nadie se pierda. Tus invitados tocan un botón y el GPS los guía al lugar.',
    image: '/servicios/ubicacion.jpg',
  },
  {
    icon: Gift,
    title: 'Mesa de Regalos o CBU',
    description: 'Compartí los datos de tu cuenta bancaria (CBU/Alias) o el link a tu lista de regalos de forma súper elegante y discreta.',
    image: '/servicios/mesa_regalos.jpg',
  },
  {
    icon: Shirt,
    title: 'Dress Code',
    description: 'Especificá el código de vestimenta para que todos vayan acordes a la ocasión.',
    image: '/servicios/dress_code.jpg',
  },
  {
    icon: Music,
    title: 'Música',
    description: '¡Que no falte ritmo! Agregá tu canción favorita a la tarjeta.',
    image: '/servicios/canciones.jpg',
  },
  {
    icon: ListTodo,
    title: 'Cronograma',
    description: 'Contale a tus invitados cómo será el itinerario: a qué hora es la recepción, la ceremonia y la fiesta.',
    image: '/servicios/cronograma.jpg',
  },
  {
    icon: Camera,
    title: 'Galería de Fotos',
    description: 'Galería compartida con todos los invitados de la fiesta para que suban sus fotos de la gran noche.',
    image: '/servicios/galeria.jpg',
  },
]

export function Services() {
  return (
    <section id="services" className="py-20 relative bg-white dark:bg-charcoal/30 transition-colors duration-300">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-dark to-transparent opacity-50" />

      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Ornament />
          <span className="text-xs tracking-[3px] uppercase text-rose-deep font-medium block mb-3">
            Todo Incluido
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-charcoal dark:text-champagne-light mb-6">
            ¿Qué incluye tu invitación?
          </h2>
          <p className="text-lg text-warm-gray font-light leading-relaxed max-w-[700px] mx-auto">
            Nuestras invitaciones son súper completas. Cuentan con todas estas secciones interactivas para que tus invitados tengan toda la información al alcance de su mano.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-[2rem] bg-cream/50 dark:bg-charcoal border border-charcoal/5 dark:border-white/5 transition-all duration-300 hover:-translate-y-2 hover:bg-white dark:hover:bg-charcoal-light hover:shadow-xl hover:shadow-rose-deep/5 dark:hover:shadow-black/20 overflow-hidden flex flex-col"
            >
              <div className="relative mb-6 -mx-6 -mt-6 aspect-[4/3] overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-white/90 dark:bg-charcoal/90 backdrop-blur-sm shadow-lg border border-white/20 flex items-center justify-center text-charcoal-soft dark:text-champagne-light transition-transform duration-300 group-hover:scale-110 group-hover:text-rose-deep dark:group-hover:text-gold-light">
                  <service.icon strokeWidth={1.5} className="w-6 h-6" />
                </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="font-display text-xl font-semibold mb-3 text-charcoal dark:text-champagne-light group-hover:text-rose-deep dark:group-hover:text-gold-light transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-sm text-warm-gray font-light leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
