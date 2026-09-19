import { useState } from 'react'
import { Link, Check } from 'lucide-react'

export function CopyUrlButton({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // silencioso — si el navegador bloquea el clipboard no hay mucho más para hacer acá
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label="Copiar URL de la invitación"
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-champagne-dark px-2.5 py-1.5 text-xs text-charcoal transition-colors hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1"
    >
      {copiado ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Link className="h-3.5 w-3.5" />}
      {copiado ? 'Copiada' : 'Copiar URL'}
    </button>
  )
}
