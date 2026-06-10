import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const COOKIE_KEY = 'cookie_consent'
const SCROLL_THRESHOLD = window.innerHeight * 0.6

export function CookieBanner() {
  const [accepted] = useState(() => !!localStorage.getItem(COOKIE_KEY))
  const [scrolled, setScrolled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (accepted) return

    function onScroll() {
      if (window.scrollY >= SCROLL_THRESHOLD) {
        setScrolled(true)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [accepted])

  function accept() {
    localStorage.setItem(COOKIE_KEY, 'true')
    setDismissed(true)
  }

  if (accepted || dismissed || !scrolled) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-charcoal/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl px-5 py-4 flex flex-col gap-3">
        <p className="text-warm-gray text-sm leading-relaxed">
          Usamos cookies técnicas estrictamente necesarias para el funcionamiento de la plataforma.{' '}
          <Link to="/cookies" className="text-gold hover:underline whitespace-nowrap">
            Más información
          </Link>
        </p>
        <button
          onClick={accept}
          className="self-start bg-gold hover:bg-gold/90 text-charcoal text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}
