import { Link, useLocation } from 'react-router-dom'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { PenTool, HeadphonesIcon } from 'lucide-react'

export default function OpcionesCreacionPage() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal text-charcoal dark:text-champagne-light font-body transition-colors duration-300 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="max-w-4xl w-full animate-fade-in-up">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-medium mb-6">¿Cómo querés crear tu invitación?</h1>
            <p className="text-warm-gray dark:text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
              Elegí la opción que mejor se adapte a tus necesidades. Podés hacerlo vos mismo o dejar que nuestro equipo se encargue de todo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Opción Autogestionado */}
            <Link 
              to={`/client/crear-invitacion${location.search}`}
              className="group relative bg-white dark:bg-charcoal-light border border-black/5 dark:border-white/5 rounded-3xl p-10 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="w-20 h-20 bg-cream dark:bg-charcoal rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <PenTool className="w-10 h-10 text-charcoal dark:text-champagne-light" strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-2xl font-medium mb-4">Autogestionado</h2>
              <p className="text-warm-gray dark:text-gray-400 mb-10 flex-1 leading-relaxed">
                Creá tu invitación a tu ritmo, personalizá los detalles y gestioná tus invitados desde tu propio panel de control.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-medium bg-charcoal text-champagne-light dark:bg-champagne-light dark:text-charcoal px-8 py-3.5 rounded-full group-hover:bg-charcoal/90 dark:group-hover:bg-champagne transition-colors shadow-sm">
                Comenzar ahora
              </div>
            </Link>

            {/* Opción Asistencia */}
            <Link 
              to={`/solicitar${location.search}`}
              className="group relative bg-white dark:bg-charcoal-light border border-black/5 dark:border-white/5 rounded-3xl p-10 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="w-20 h-20 bg-cream dark:bg-charcoal rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <HeadphonesIcon className="w-10 h-10 text-charcoal dark:text-champagne-light" strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-2xl font-medium mb-4">Con Asistencia</h2>
              <p className="text-warm-gray dark:text-gray-400 mb-10 flex-1 leading-relaxed">
                Dejanos los detalles a nosotros. Nuestro equipo armará tu invitación con el diseño y los servicios que elijas.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-medium bg-white text-charcoal border border-black/10 dark:bg-charcoal dark:text-champagne-light dark:border-white/10 px-8 py-3.5 rounded-full group-hover:bg-cream dark:group-hover:bg-charcoal-light transition-colors shadow-sm">
                Solicitar asistencia
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
