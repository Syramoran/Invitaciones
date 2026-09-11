import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, ExternalLink, MessageCircle, Download, Loader2 } from 'lucide-react'
import type { CrearInvitacionResult } from '@/types/crearInvitacion'
import { invitadosAdminService } from '@/services/invitadosAdminService'
import type { InvitadosListado } from '@/services/invitadosAdminService'

interface Props {
  result: CrearInvitacionResult
  onCreateAnother: () => void
}

export function ResultScreen({ result, onCreateAnother }: Props) {
  const navigate  = useNavigate()
  const [copied, setCopied] = useState(false)
  const [listado, setListado] = useState<InvitadosListado | null>(null)
  const [loadingListado, setLoadingListado] = useState(true)

  // Public URL follows the /:eventoId route defined in App.tsx
  const publicUrl = `${window.location.origin}/${result.id}`

  // Trae el listado real (individuales + grupos) con sus slugs/URLs ya
  // persistidos por el backend — nada se recalcula acá.
  useEffect(() => {
    let cancelado = false
    invitadosAdminService.listarInvitados(result.id)
      .then(data => { if (!cancelado) setListado(data) })
      .catch(() => { if (!cancelado) setListado({ individuales: [], grupos: [] }) })
      .finally(() => { if (!cancelado) setLoadingListado(false) })
    return () => { cancelado = true }
  }, [result.id])

  const individuales = listado?.individuales ?? []
  const grupos = listado?.grupos ?? []
  const totalLinks = individuales.length + grupos.length

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
    const header = 'Tipo,Nombre,URL'
    const filasIndividuales = individuales.map(
      i => `Individual,"${i.nombre} ${i.apellido}",${i.urlPersonalizada}`,
    )
    const filasGrupos = grupos.map(
      g => `Grupo,"${g.nombre}",${publicUrl}?grupo=${g.slug}`,
    )
    const csv = [header, ...filasIndividuales, ...filasGrupos].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `invitados-${result.id}.csv`
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
      {loadingListado ? (
        <div className="flex items-center justify-center gap-2 text-[.82rem] text-[#9ca3af] mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando invitados...
        </div>
      ) : totalLinks > 0 ? (
        <div className="bg-[#dcfce7] text-[#166534] rounded-xl px-4 py-3 text-[.82rem] mb-6 text-left">
          <p className="font-semibold mb-0.5">
            ✓ {individuales.length > 0 && `${individuales.length} invitado${individuales.length !== 1 ? 's' : ''}`}
            {individuales.length > 0 && grupos.length > 0 && ' y '}
            {grupos.length > 0 && `${grupos.length} grupo${grupos.length !== 1 ? 's' : ''}`}
            {' '}con link personalizado
          </p>
          <p className="text-[#166534]/80">
            Cada invitado tiene su link (<code className="bg-[#bbf7d0] px-1 rounded">?invitado=</code>) y cada grupo el suyo (<code className="bg-[#bbf7d0] px-1 rounded">?grupo=</code>).
          </p>
        </div>
      ) : null}

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

        {totalLinks > 0 && (
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
