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
    description: 'Tus invitados pueden confirmar asistencia o avisar si no pueden ir directamente desde la invitación. Recibís las respuestas al instante.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    icon: Clock,
    title: 'Cuenta Regresiva',
    description: 'Un reloj interactivo que marca los días, horas, minutos y segundos que faltan para el gran día.',
    image: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    icon: MapPin,
    title: 'Ubicación y Mapas',
    description: 'Integración con Google Maps para que nadie se pierda. Tus invitados tocan un botón y el GPS los guía al lugar.',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    icon: Gift,
    title: 'Mesa de Regalos o CBU',
    description: 'Compartí los datos de tu cuenta bancaria (CBU/Alias) o el link a tu lista de regalos de forma súper elegante y discreta.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    icon: Shirt,
    title: 'Dress Code',
    description: 'Especificá el código de vestimenta (Formal, Elegante Sport, Temático) para que todos vayan acordes a la ocasión.',
    image: 'https://images.unsplash.com/photo-1594938298596-70f56fb3cecb?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    icon: Music,
    title: 'Sugeridor de Canciones',
    description: '¡Que no falte ritmo! Un espacio donde los invitados pueden pedir los temas que no pueden faltar en la fiesta.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    icon: ListTodo,
    title: 'Cronograma',
    description: 'Contale a tus invitados cómo será el itinerario: a qué hora es la recepción, la ceremonia, la cena y la fiesta.',
    image: 'https://images.unsplash.com/photo-1540397106260-e24a507a088c?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    icon: Camera,
    title: 'Galería de Fotos',
    description: 'Un carrusel o grilla con fotos tuyas o de la pareja para compartir los mejores recuerdos previos al evento.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600&h=400',
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
