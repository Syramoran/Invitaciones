import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-charcoal border-t border-white/5 pt-14 pb-8 text-warm-gray">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-2xl font-semibold text-champagne-light inline-block mb-3">
              festeja<span className="text-gold italic">.</span>
            </Link>
            <p className="text-sm font-light leading-relaxed max-w-[280px]">
              Invitaciones digitales personalizadas para los momentos que más importan.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-lg font-semibold text-champagne-light mb-4">Navegación</h4>
            <nav className="space-y-2.5">
              <Link to="/" className="block text-sm font-light hover:text-champagne-light transition-colors">
                Inicio
              </Link>
              <Link to="/crear" className="block text-sm font-light hover:text-champagne-light transition-colors">
                Crear invitación
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById('contacto')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="block text-sm font-light hover:text-champagne-light transition-colors text-left"
              >
                Contacto
              </button>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-lg font-semibold text-champagne-light mb-4">Legal</h4>
            <nav className="space-y-2.5">
              <Link to="/terminos" className="block text-sm font-light hover:text-champagne-light transition-colors">
                Terminos de Servicio
              </Link>
              <Link to="/privacidad" className="block text-sm font-light hover:text-champagne-light transition-colors">
                Politica de Privacidad
              </Link>
              <Link to="/cookies" className="block text-sm font-light hover:text-champagne-light transition-colors">
                Aviso de Cookies
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-champagne-light mb-4">Contacto</h4>
            <nav className="space-y-2.5">
              <a
                href="https://wa.me/5493435083034"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-light hover:text-champagne-light transition-colors"
              >
                WhatsApp
              </a>
              <a
                href="mailto:festeja.plataforma@gmail.com"
                className="block text-sm font-light hover:text-champagne-light transition-colors"
              >
                festeja.plataforma@gmail.com
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light">
          <span>2026 festeja. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all"
            >
              <InstagramIcon />
            </a>
            <a
              href="#"
              aria-label="TikTok"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all"
            >
              <TikTokIcon />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}
