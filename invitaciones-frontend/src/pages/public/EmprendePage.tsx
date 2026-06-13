import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, Moon, CheckCircle2, ArrowRight } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Ornament } from '@/components/landing/Ornament'

export default function EmprendePage() {
  const { theme, setTheme } = useTheme()
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    mensaje: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Open WhatsApp with prefilled message
    const text = `Hola! Me llamo ${formData.nombre}. Me interesa asociarme para vender invitaciones de Festejá.\nEmail: ${formData.email}\nMensaje: ${formData.mensaje}`
    const url = `https://wa.me/5493435083034?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal transition-colors duration-300 font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-cream/85 dark:bg-charcoal/85 backdrop-blur-xl shadow-[0_1px_0_rgba(45,41,38,0.06)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-2xl font-semibold tracking-tight text-charcoal dark:text-champagne-light transition-colors duration-300"
          >
            festejá
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full transition-colors duration-300 text-charcoal hover:bg-black/5 dark:text-champagne-light dark:hover:bg-white/10"
              title="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/crear"
              className="inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 bg-charcoal text-champagne-light hover:bg-charcoal-soft dark:bg-champagne-light dark:text-charcoal dark:hover:bg-champagne"
            >
              Creá tu invitación
              <span className="text-xs">→</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Ornament />
          <span className="text-xs tracking-[3px] uppercase text-rose-deep font-medium block mb-3">
            Programa de Asociados
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-charcoal dark:text-champagne-light mb-6">
            Emprendé con Festejá
          </h1>
          <p className="text-lg md:text-xl text-warm-gray font-light leading-relaxed max-w-[700px] mx-auto">
            Añadí invitaciones digitales únicas a tus servicios sin preocuparte por el código o el diseño. Vos vendés, nosotros lo armamos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl font-semibold text-charcoal dark:text-champagne-light mb-6">
              ¿Cómo funciona?
            </h2>
            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-rose-deep dark:text-champagne" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-charcoal dark:text-champagne-light mb-1">1. Ofrecé nuestro catálogo</h3>
                  <p className="text-warm-gray font-light leading-relaxed">
                    Te damos acceso a un <strong>muestrario de plantillas de invitaciones</strong> para que puedas mostrárselo a tus clientes como si fuera propio.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-rose-deep dark:text-champagne" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-charcoal dark:text-champagne-light mb-1">2. Vos ponés el precio</h3>
                  <p className="text-warm-gray font-light leading-relaxed">
                    Comercializás la invitación al precio que creas conveniente.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-rose-deep dark:text-champagne" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-charcoal dark:text-champagne-light mb-1">3. Nosotros lo armamos</h3>
                  <p className="text-warm-gray font-light leading-relaxed">
                    Nos enviás la información de tu cliente y en 24hs tenés el link listo para entregárselo, funcionando perfectamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-champagne/30 dark:bg-charcoal-soft/50 border border-champagne-dark dark:border-white/10 rounded-2xl p-8 mb-8">
              <h3 className="font-display text-2xl font-semibold text-charcoal dark:text-champagne-light mb-4">
                Tu herramienta de ventas
              </h3>
              <p className="text-warm-gray font-light mb-6">
                Prepará tu próxima reunión con clientes usando nuestra galería de invitaciones. Todos los diseños interactivos listos para probar.
              </p>
              <Link
                to="/templates"
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-champagne-light hover:bg-charcoal-soft dark:bg-champagne-light dark:text-charcoal dark:hover:bg-champagne rounded-full text-sm font-medium transition-all"
              >
                Ver el catálogo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 md:p-10 shadow-xl shadow-black/5 dark:shadow-none border border-black/5 dark:border-white/10"
          >
            <h2 className="font-display text-3xl font-semibold text-charcoal dark:text-champagne-light mb-2">
              Unite a la red
            </h2>
            <p className="text-warm-gray font-light mb-8">
              Dejanos tus datos y nos pondremos en contacto con vos para contarte cómo empezar.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-champagne-light mb-2">
                  Nombre completo o empresa
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-cream dark:bg-[#252525] border-transparent focus:border-charcoal dark:focus:border-champagne-light focus:ring-1 focus:ring-charcoal dark:focus:ring-champagne-light outline-none transition-all dark:text-white"
                  placeholder="Ej: Estudio Creativo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-champagne-light mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-cream dark:bg-[#252525] border-transparent focus:border-charcoal dark:focus:border-champagne-light focus:ring-1 focus:ring-charcoal dark:focus:ring-champagne-light outline-none transition-all dark:text-white"
                  placeholder="hola@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-champagne-light mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-cream dark:bg-[#252525] border-transparent focus:border-charcoal dark:focus:border-champagne-light focus:ring-1 focus:ring-charcoal dark:focus:ring-champagne-light outline-none transition-all dark:text-white"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-champagne-light mb-2">
                  ¿A qué te dedicás?
                </label>
                <textarea
                  required
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-cream dark:bg-[#252525] border-transparent focus:border-charcoal dark:focus:border-champagne-light focus:ring-1 focus:ring-charcoal dark:focus:ring-champagne-light outline-none transition-all resize-none dark:text-white"
                  placeholder="Contanos brevemente sobre tus servicios y a qué público apuntás..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-charcoal text-champagne-light hover:bg-charcoal-soft dark:bg-champagne-light dark:text-charcoal dark:hover:bg-champagne rounded-xl font-medium transition-all shadow-md mt-4"
              >
                Enviar solicitud
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
