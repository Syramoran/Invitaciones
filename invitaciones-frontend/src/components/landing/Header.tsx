import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const pos = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: pos, behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-cream/85 backdrop-blur-xl shadow-[0_1px_0_rgba(45,41,38,0.06)] py-3'
            : 'py-4'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-semibold text-charcoal tracking-tight">
            festeja<span className="text-gold italic">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('eventos')}
              className="text-sm text-charcoal-soft hover:text-charcoal transition-colors relative group"
            >
              Eventos
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gold transition-all group-hover:w-full" />
            </button>
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="text-sm text-charcoal-soft hover:text-charcoal transition-colors relative group"
            >
              Como Funciona
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gold transition-all group-hover:w-full" />
            </button>
            <button
              onClick={() => scrollToSection('precios')}
              className="text-sm text-charcoal-soft hover:text-charcoal transition-colors relative group"
            >
              Precios
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gold transition-all group-hover:w-full" />
            </button>
            <button
              onClick={() => scrollToSection('contacto')}
              className="text-sm text-charcoal-soft hover:text-charcoal transition-colors relative group"
            >
              Contacto
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gold transition-all group-hover:w-full" />
            </button>
          </nav>

          <Link
            to="/crear"
            className="hidden md:inline-flex items-center gap-2 bg-charcoal text-champagne-light text-sm font-medium px-6 py-2.5 rounded-full hover:bg-charcoal-soft hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            Crea tu invitacion
            <span className="text-xs">→</span>
          </Link>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-charcoal" />
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div
        className={`fixed inset-0 bg-cream/97 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-8 transition-opacity duration-400 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          className="absolute top-6 right-6 text-charcoal"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Cerrar menu"
        >
          <X className="w-8 h-8" />
        </button>

        <button
          onClick={() => scrollToSection('eventos')}
          className="font-display text-3xl font-medium text-charcoal"
        >
          Eventos
        </button>
        <button
          onClick={() => scrollToSection('como-funciona')}
          className="font-display text-3xl font-medium text-charcoal"
        >
          Como Funciona
        </button>
        <button
          onClick={() => scrollToSection('precios')}
          className="font-display text-3xl font-medium text-charcoal"
        >
          Precios
        </button>
        <button
          onClick={() => scrollToSection('contacto')}
          className="font-display text-3xl font-medium text-charcoal"
        >
          Contacto
        </button>

        <Link
          to="/crear"
          className="mt-4 bg-charcoal text-champagne-light font-medium px-8 py-3.5 rounded-full"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Crea tu invitacion →
        </Link>
      </div>
    </>
  )
}
