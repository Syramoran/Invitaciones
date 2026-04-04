import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title: string
  lastUpdated: string
}

export function LegalLayout({ children, title, lastUpdated }: Props) {
  return (
    <div className="min-h-screen bg-cream text-charcoal font-body">
      <header className="bg-white/90 backdrop-blur-xl border-b border-black/[0.05] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-semibold text-charcoal tracking-tight">
            festejá<span className="text-gold italic">.</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-charcoal transition-colors">
            <ChevronLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 pb-20">
        <h1 className="font-display text-4xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-warm-gray mb-10">Última revisión: {lastUpdated}</p>

        <div className="space-y-10">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-black/[0.06]">
          <p className="text-sm text-warm-gray mb-3">También podés consultar:</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <Link to="/terminos" className="text-gold hover:underline">Términos de Servicio</Link>
            <span className="text-warm-gray-light">·</span>
            <Link to="/privacidad" className="text-gold hover:underline">Política de Privacidad</Link>
            <span className="text-warm-gray-light">·</span>
            <Link to="/cookies" className="text-gold hover:underline">Aviso de Cookies</Link>
            <span className="text-warm-gray-light">·</span>
            <Link to="/disclaimer" className="text-gold hover:underline">Disclaimer</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ── Reusable primitives ─────────────────────────────────────────────────── */

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold pb-2 mb-4 border-b border-champagne-dark">{title}</h2>
      <div className="space-y-3 text-[0.925rem] font-light leading-relaxed text-charcoal-soft">
        {children}
      </div>
    </section>
  )
}

export function LegalCallout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-amber-50 border-l-4 border-gold px-4 py-3 rounded-r-xl text-[0.9rem] text-charcoal-soft">
      {children}
    </div>
  )
}

export function LegalTable({ headers, rows }: { headers: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[0.875rem] border-collapse">
        <thead>
          <tr className="bg-champagne/40">
            {headers.map(h => (
              <th key={h} className="text-left px-3 py-2.5 border border-champagne-dark font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-cream'}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 border border-champagne-dark font-light align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
