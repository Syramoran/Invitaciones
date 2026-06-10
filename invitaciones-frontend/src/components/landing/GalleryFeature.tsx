import { Camera, Heart, Sparkles, Upload } from 'lucide-react'
import { motion } from 'framer-motion'

export function GalleryFeature() {
  return (
    <section className="py-24 bg-ivory dark:bg-charcoal overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-dark to-transparent" />

      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left side: Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="relative group w-3/5 sm:w-1/2 lg:w-full mx-auto"
        >
          <img
            src="/galeria-fotos.png"
            alt="Galería de fotos compartida"
            className="relative w-full object-cover transform transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </motion.div>

        {/* Right side: Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div>
            <span className="text-xs tracking-[3px] uppercase text-rose-deep font-medium flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4" />
              Galería Compartida
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal dark:text-cream leading-[1.1]">
              ¡Todos son <em className="text-rose-deep italic">fotógrafos</em> en tu evento!
            </h2>
          </div>

          <p className="text-lg text-warm-gray dark:text-warm-gray-light leading-relaxed">
            Olvidate de pedir que te pasen las fotos por WhatsApp al día siguiente.
            Tus invitados pueden subir todas las fotos y videos
            que saquen durante la fiesta en tiempo real a la galería.
          </p>

          <div className="space-y-6 pt-2">
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white dark:bg-charcoal flex items-center justify-center shadow-sm border border-champagne-light dark:border-white/5 text-gold">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal dark:text-cream mb-1 text-lg font-display">Súper fácil de usar</h3>
                <p className="text-warm-gray dark:text-warm-gray-light text-sm">Escaneá el QR en la fiesta y subí tu foto.</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white dark:bg-charcoal flex items-center justify-center shadow-sm border border-champagne-light dark:border-white/5 text-rose-deep">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal dark:text-cream mb-1 text-lg font-display">Calidad original</h3>
                <p className="text-warm-gray dark:text-warm-gray-light text-sm">Podés bajarte una carpeta con absolutamente todas las fotos juntas al día siguiente.</p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  )
}
