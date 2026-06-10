import { Link } from 'react-router-dom'
import { MessageCircle, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export function FinalCTA() {
  return (
    <section id="contacto" className="py-16 bg-charcoal text-champagne-light text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-1/2 -left-[20%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(197,165,114,0.08)_0%,transparent_70%)]" />
      <div className="absolute -bottom-1/2 -right-[20%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(197,165,114,0.06)_0%,transparent_70%)]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7 }}
        className="max-w-[1200px] mx-auto px-6 relative z-10"
      >
        <div className="flex items-center justify-center gap-4 mb-6 text-gold-light">
          <span className="w-[60px] h-px bg-gradient-to-r from-transparent via-gold-light to-transparent" />
          <Star className="w-5 h-5 fill-gold-light" />
          <span className="w-[60px] h-px bg-gradient-to-r from-transparent via-gold-light to-transparent" />
        </div>

        <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-champagne-light mb-4">
          ¿Listo para crear algo único?
        </h2>
        <p className="text-base text-warm-gray-light font-light leading-relaxed max-w-[560px] mx-auto mb-10">
          Tu invitación personalizada a un click de distancia
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/crear"
            className="inline-flex items-center gap-2 bg-gold text-white font-medium px-10 py-4 rounded-full hover:bg-gold-dark hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(197,165,114,0.3)] transition-all"
          >
            Creá tu invitacion
            <span>→</span>
          </Link>
          <a
            href="https://wa.me/5493435083034"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-transparent text-champagne-light border border-warm-gray font-medium px-8 py-4 rounded-full hover:border-champagne-light hover:bg-white/5 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            ¿Tenés dudas? ¡Escribinos!
            <span>→</span>
          </a>
        </div>
      </motion.div>
    </section>
  )
}
