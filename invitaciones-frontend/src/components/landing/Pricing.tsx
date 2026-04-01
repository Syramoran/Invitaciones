import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Ornament } from './Ornament'

const baseFeatures = [
  'Informacion del evento (fecha, hora, ubicacion, dress code)',
  'Mapa con Google Maps integrado',
  'Hasta 5 fotos del anfitrion',
  'URL unica para compartir',
  '3 meses de almacenamiento post-evento',
]

const addons = [
  { name: 'Confirmacion de Asistencia', price: '$10.000' },
  { name: 'Cuenta Regresiva', price: '$10.000' },
  { name: 'Musica (MP3)', price: '$10.000' },
  { name: 'Historia (texto + fotos)', price: '$10.000' },
  { name: 'Galeria de Fotos con QR', price: '$50.000' },
  { name: '2da version de tarjeta', price: '50% off' },
]

export function Pricing() {
  return (
    <section id="precios" className="py-24 bg-ivory relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-dark to-transparent" />

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <Ornament />
          <span className="text-xs tracking-[3px] uppercase text-rose-deep font-medium block mb-3">
            Inversion
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-charcoal mb-4">
            Precios transparentes
          </h2>
          <p className="text-base text-warm-gray font-light leading-relaxed max-w-[560px] mx-auto">
            Sin sorpresas. Elegi lo que necesitas y paga solo por eso
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-[900px] mx-auto">
          {/* Base Card */}
          <div className="bg-white rounded-3xl p-10 px-9 border-2 border-gold-light relative transition-all hover:shadow-md">
            <span className="absolute -top-3 left-9 bg-gold text-white text-xs font-medium px-4 py-1 rounded-full tracking-[1px]">
              Base
            </span>
            <h3 className="font-display text-2xl font-semibold mb-2">Invitacion Base</h3>
            <div className="font-display text-4xl font-bold text-charcoal mb-6">
              <span className="text-xl font-medium align-super mr-0.5">$</span>
              30.000
            </div>
            <ul className="space-y-3">
              {baseFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-charcoal-soft font-light leading-relaxed">
                  <Check className="w-4 h-4 text-sage font-semibold mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Addons Card */}
          <div className="bg-white rounded-3xl p-10 px-9 border border-charcoal/5 transition-all hover:shadow-md">
            <h3 className="font-display text-2xl font-semibold mb-2">Servicios Adicionales</h3>
            <p className="text-sm text-warm-gray font-light mb-4">
              Suma lo que quieras a tu invitacion base
            </p>
            <div className="mt-2">
              {addons.map((addon, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-3.5 border-b border-ivory last:border-b-0"
                >
                  <span className="text-sm text-charcoal-soft font-light">{addon.name}</span>
                  <span className="text-sm font-medium text-charcoal">{addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-block bg-gradient-to-br from-gold-light to-champagne px-8 py-3.5 rounded-2xl mb-3">
            <strong className="font-display text-xl">Paquete completo desde $110.000</strong>
          </div>
          <p className="text-sm text-warm-gray font-light mb-7">
            50% de descuento en tu segunda invitacion
          </p>
          <Link
            to="/crear"
            className="inline-flex items-center gap-2 bg-charcoal text-champagne-light font-medium px-8 py-3.5 rounded-full hover:bg-charcoal-soft hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            Arma tu presupuesto
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
