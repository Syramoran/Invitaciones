import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, ExternalLink, MessageCircle, Download } from 'lucide-react'
import type { CrearInvitacionResult, GuestEntry } from '@/types/crearInvitacion'

interface Props {
  result: CrearInvitacionResult
  guests: GuestEntry[]
  onCreateAnother: () => void
}

// Builds the ?invitado=nombre-apellido slug
function guestSlug(g: GuestEntry) {
  return [g.nombre, g.apellido]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

function guestUrl(baseUrl: string, g: GuestEntry) {
  return `${baseUrl}?invitado=${guestSlug(g)}`
}

export function ResultScreen({ result, guests, onCreateAnother }: Props) {
  const navigate  = useNavigate()
  const [copied, setCopied] = useState(false)

  // Public URL follows the /:eventoId route defined in App.tsx
  const publicUrl = `${window.location.origin}/${result.id}`

  // ── Personalised URL list ─────────────────────────────────────────────────

  const guestUrls = useMemo(
    () => guests.map(g => ({ ...g, url: guestUrl(publicUrl, g) })),
    [guests, publicUrl],
  )

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleCopy() {
    navigator.clipboard?.writeText(publicUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsApp() {
    const msg = encodeURIComponent(
      `¡Tu invitación digital está lista! 🎉\n\nAccedé desde: ${publicUrl}`,
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  function handleDownloadCsv() {
    const header = 'Nombre,Apellido,URL'
    const rows   = guestUrls.map(g => `${g.nombre},${g.apellido},${g.url}`)
    const csv    = [header, ...rows].join('\n')
    const blob   = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const href   = URL.createObjectURL(blob)
    const a      = document.createElement('a')
    a.href       = href
    a.download   = `invitados-${result.id}.csv`
    a.click()
    URL.revokeObjectURL(href)
  }

  return (
    <div className="py-10 text-center">
      {/* Animated checkmark */}
      <div
        className="w-20 h-20 rounded-full bg-[#16a34a] flex items-center justify-center mx-auto mb-5 text-white text-3xl"
        style={{ animation: 'popIn .5s cubic-bezier(.175,.885,.32,1.275)' }}
      >
        ✓
      </div>

      <h2 className="text-2xl font-bold text-[#2d2926] mb-2">
        ¡Invitación generada exitosamente!
      </h2>
      <p className="text-[.9rem] text-[#6b7280] mb-6">
        "{result.titulo}" está lista para compartir
      </p>

      {/* URL box */}
      <div className="flex items-center gap-2 bg-[#f4f5f7] rounded-xl px-4 py-3 mb-6 text-left">
        <span className="text-[.82rem] font-mono text-[#4a4441] flex-1 truncate">{publicUrl}</span>
        <button
          type="button"
          onClick={handleCopy}
          title="Copiar URL"
          className="shrink-0 flex items-center gap-1 text-[.78rem] font-medium text-[#c5a572] hover:text-[#9e7f4e] transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      {/* Guest URL summary */}
      {guestUrls.length > 0 && (
        <div className="bg-[#dcfce7] text-[#166534] rounded-xl px-4 py-3 text-[.82rem] mb-6 text-left">
          <p className="font-semibold mb-0.5">
            ✓ {guestUrls.length} URL{guestUrls.length !== 1 ? 's' : ''} personalizadas generadas
          </p>
          <p className="text-[#166534]/80">
            Cada invitado tiene su link con el parámetro <code className="bg-[#bbf7d0] px-1 rounded">?invitado=</code>.
            La entidad se crea recién cuando el invitado confirme asistencia.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-lg text-[.85rem] font-medium hover:bg-[#1eb954] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Enviar por WhatsApp
        </button>

        {guestUrls.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-4 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.85rem] font-medium hover:border-[#2d2926] transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar CSV
          </button>
        )}

        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.85rem] font-medium hover:border-[#2d2926] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver invitación
        </a>

        <button
          type="button"
          onClick={onCreateAnother}
          className="px-4 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.85rem] font-medium hover:border-[#2d2926] transition-colors"
        >
          Crear otra
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="px-4 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.85rem] font-medium hover:bg-[#4a4441] transition-colors"
        >
          Volver al Dashboard
        </button>
      </div>

      <style>{`@keyframes popIn{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}`}</style>
    </div>
  )
}
