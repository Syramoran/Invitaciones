import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useCrearInvitacionModal } from '@/context/crearInvitacionModalContext'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { openModal } = useCrearInvitacionModal()

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
            ? 'bg-cream/85 dark:bg-charcoal/85 backdrop-blur-xl shadow-[0_1px_0_rgba(45,41,38,0.06)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)] py-3'
            : 'py-4'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link
            to="/"
            className={`font-display text-2xl font-semibold tracking-tight transition-colors duration-300 ${
              isScrolled ? 'text-charcoal dark:text-champagne-light' : 'text-white'
            }`}
          >
            festejá
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {(['eventos', 'features', 'contacto'] as const).map((id) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`text-sm cursor-pointer transition-colors duration-300 relative group ${
                  isScrolled
                    ? 'text-charcoal-soft hover:text-charcoal dark:text-warm-gray-light dark:hover:text-champagne-light'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {id === 'eventos' ? 'Eventos' : id === 'features' ? '¿Cómo funciona?' : 'Contacto'}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gold transition-all group-hover:w-full" />
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full transition-colors duration-300 ${
                isScrolled ? 'text-charcoal hover:bg-black/5 dark:text-champagne-light dark:hover:bg-white/10' : 'text-white hover:bg-white/10'
              }`}
              title="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={openModal}
              className={`inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 ${
                isScrolled
                  ? 'bg-charcoal text-champagne-light hover:bg-charcoal-soft dark:bg-champagne-light dark:text-charcoal dark:hover:bg-champagne'
                  : 'bg-white/15 border border-white/40 text-white backdrop-blur-sm hover:bg-white/25'
              }`}
            >
              Crea tu invitacion
              <span className="text-xs">→</span>
            </button>
          </div>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu className={`w-6 h-6 transition-colors duration-300 ${isScrolled ? 'text-charcoal' : 'text-white'}`} />
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div
        className={`fixed inset-0 bg-cream/97 dark:bg-charcoal/97 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-8 transition-opacity duration-400 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          className="absolute top-6 right-6 text-charcoal dark:text-champagne-light"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Cerrar menu"
        >
          <X className="w-8 h-8" />
        </button>

        <button
          onClick={() => scrollToSection('eventos')}
          className="font-display text-3xl font-medium text-charcoal dark:text-champagne-light cursor-pointer"
        >
          Eventos
        </button>
        <button
          onClick={() => scrollToSection('features')}
          className="font-display text-3xl font-medium text-charcoal dark:text-champagne-light cursor-pointer"
        >
          Como Funciona
        </button>
        {/* <button
          onClick={() => scrollToSection('precios')}
          className="font-display text-3xl font-medium text-charcoal dark:text-champagne-light cursor-pointer"
        >
          Precios
        </button> */}
        <button
          onClick={() => scrollToSection('contacto')}
          className="font-display text-3xl font-medium text-charcoal dark:text-champagne-light cursor-pointer"
        >
          Contacto
        </button>

        <button
          onClick={() => {
            openModal()
            setIsMobileMenuOpen(false)
          }}
          className="mt-4 bg-charcoal text-champagne-light font-medium px-8 py-3.5 rounded-full"
        >
          Crea tu invitacion →
        </button>
      </div>
    </>
  )
}
