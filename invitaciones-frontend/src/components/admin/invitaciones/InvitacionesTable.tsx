import { useState } from 'react'
import { Copy, Pencil, Trash2, Loader2, QrCode, X, Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { InvitacionAdmin } from '@/types/adminInvitacion'
import { getDaysLeft, getInvitacionStatus } from '@/types/adminInvitacion'
import { InvitacionStatusBadge } from './InvitacionStatusBadge'

interface Props {
  invitaciones: InvitacionAdmin[]
  deleting: Set<string>
  onCopyUrl: (inv: InvitacionAdmin) => void
  onView: (inv: InvitacionAdmin) => void
  onDelete: (inv: InvitacionAdmin) => void
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left px-3 py-2.5 text-[.75rem] font-semibold uppercase tracking-[.5px] text-[#6b7280] bg-[#f4f5f7] border-b border-[#d1d5db] whitespace-nowrap">
    {children}
  </th>
)

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function DaysLeftCell({ fechaEvento }: { fechaEvento: string }) {
  const days = getDaysLeft(fechaEvento)
  if (days < 0) return <span className="text-[#dc2626] font-bold text-[.82rem]">Expirado</span>
  const colorClass =
    days <= 7  ? 'text-[#dc2626] font-bold' :
    days <= 30 ? 'text-[#ea580c]'           :
                 'text-[#16a34a]'
  return <span className={`text-[.85rem] ${colorClass}`}>{days}</span>
}

// ── QR Modal ─────────────────────────────────────────────────────────────────

function QrModal({ inv, onClose }: { inv: InvitacionAdmin; onClose: () => void }) {
  const galeriaUrl = `${window.location.origin}/${inv.id}/galeria`

  function downloadQr() {
    const svg = document.getElementById('qr-galeria-svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const size = 300
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `qr-galeria-${inv.titulo.replace(/\s+/g, '-').toLowerCase()}.png`
      a.click()
    }
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#1a1a1a]">QR Galería</h3>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#555] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#6b7280] mb-1 truncate font-medium">{inv.titulo}</p>
        <p className="text-[.7rem] text-[#aaa] mb-4 break-all">{galeriaUrl}</p>

        <div className="flex justify-center mb-4">
          <QRCodeSVG
            id="qr-galeria-svg"
            value={galeriaUrl}
            size={200}
            bgColor="#ffffff"
            fgColor="#1a1a1a"
            level="M"
          />
        </div>

        <button
          onClick={downloadQr}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d1d5db] py-2.5 text-sm font-medium text-[#1a1a1a] hover:border-[#555] transition-colors"
        >
          <Download className="w-4 h-4" />
          Descargar PNG
        </button>
      </div>
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────

export function InvitacionesTable({
  invitaciones,
  deleting,
  onCopyUrl,
  onView,
  onDelete,
}: Props) {
  const [qrInv, setQrInv] = useState<InvitacionAdmin | null>(null)

  if (invitaciones.length === 0) {
    return (
      <div className="text-center py-16 text-[#9ca3af] text-sm">
        No hay invitaciones en esta categoría.
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <TH>Título</TH>
              <TH>Tipo</TH>
              <TH>Template</TH>
              <TH>Fecha Evento</TH>
              <TH>Días Rest.</TH>
              <TH>Servicios</TH>
              <TH>Estado</TH>
              <TH>Acciones</TH>
            </tr>
          </thead>
          <tbody>
            {invitaciones.map((inv, i) => (
              <tr
                key={inv.id}
                className={`border-b border-[#f0f0f0] hover:bg-[#fafbfc] transition-colors ${
                  i % 2 === 1 ? 'bg-[#fafbfd] hover:bg-[#f5f6f8]' : ''
                }`}
              >
                {/* Título */}
                <td className="px-3 py-2.5 text-[.85rem] font-medium max-w-[200px] truncate">
                  {inv.titulo}
                </td>

                {/* Tipo */}
                <td className="px-3 py-2.5 text-[.85rem]">{inv.tipoEventoNombre}</td>

                {/* Template */}
                <td className="px-3 py-2.5 text-[.85rem] text-[#6b7280]">{inv.templateNombre}</td>

                {/* Fecha evento */}
                <td className="px-3 py-2.5 text-[.82rem]">{fmtDate(inv.fechaEvento)}</td>

                {/* Días restantes */}
                <td className="px-3 py-2.5">
                  <DaysLeftCell fechaEvento={inv.fechaEvento} />
                </td>

                {/* Servicios habilitados */}
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {inv.servicios.filter(s => s.habilitado).map(s => (
                      <span
                        key={s.servicioId}
                        className="inline-block px-1.5 py-0.5 text-[.68rem] bg-[#f4f5f7] text-[#6b7280] rounded"
                      >
                        {s.nombre}
                      </span>
                    ))}
                    {inv.servicios.filter(s => s.habilitado).length === 0 && (
                      <span className="text-[#9ca3af] text-[.82rem]">—</span>
                    )}
                  </div>
                </td>

                {/* Estado */}
                <td className="px-3 py-2.5">
                  <InvitacionStatusBadge status={getInvitacionStatus(inv)} />
                </td>

                {/* Acciones */}
                <td className="px-3 py-2.5">
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => onView(inv)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[.75rem] font-medium border border-[#d1d5db] rounded-lg hover:border-[#2d2926] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </button>

                    <button
                      onClick={() => onCopyUrl(inv)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[.75rem] font-medium border border-[#d1d5db] rounded-lg text-[#9e7f4e] hover:border-[#c5a572] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" /> URL
                    </button>

                    <button
                      onClick={() => setQrInv(inv)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[.75rem] font-medium border border-[#d1d5db] rounded-lg text-[#6b7280] hover:border-[#555] hover:text-[#1a1a1a] transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" /> QR
                    </button>

                    <button
                      onClick={() => onDelete(inv)}
                      disabled={deleting.has(inv.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[.75rem] font-medium border border-[#d1d5db] rounded-lg hover:border-[#dc2626] hover:text-[#dc2626] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deleting.has(inv.id)
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {qrInv && <QrModal inv={qrInv} onClose={() => setQrInv(null)} />}
    </>
  )
}
