import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { adminInvitacionService } from '@/services/adminInvitacionService'
import { getInvitacionStatus } from '@/types/adminInvitacion'
import type { InvitacionAdmin, InvitacionStatus, GaleriaStats } from '@/types/adminInvitacion'

// ── Storage limits ────────────────────────────────────────────────────────────
export const MAX_IMAGE_SIZE_MB      = 15      // per photo
export const MAX_GALLERY_PHOTOS     = 1000    // guest gallery photos per invitation
export const HOST_PHOTOS_BASE       = 5       // host photos per invitation
export const MAX_AUDIO_SIZE_MB      = 20
export const MAX_AUDIO_TRACKS       = 1
export const DATA_RETENTION_MONTHS  = 3
export const LOGS_RETENTION_MONTHS  = 6
export const HISTORY_MAX_CHARS      = 3000

// Total: 1005 fotos × 15 MB = 15,075 MB máx. por invitación (solo fotos)
const TOTAL_MAX_PHOTOS  = HOST_PHOTOS_BASE + MAX_GALLERY_PHOTOS
const MAX_STORAGE_MB    = TOTAL_MAX_PHOTOS * MAX_IMAGE_SIZE_MB

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasAudio(inv: InvitacionAdmin): boolean {
  return inv.servicios.some(
    s => s.habilitado && s.nombre.toLowerCase().includes('audio'),
  )
}

function fmtBytes(bytes: number): string {
  if (bytes === 0)    return '0 B'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024)     return `${(mb / 1024).toFixed(1)} GB`
  if (mb >= 1)        return `${mb.toFixed(1)} MB`
  const kb = bytes / 1024
  return `${kb.toFixed(0)} KB`
}

function fmtMB(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  if (mb >= 1)    return `${mb.toFixed(1)} MB`
  return `${(mb * 1024).toFixed(0)} KB`
}

// ── LimitsPanel ───────────────────────────────────────────────────────────────

function LimitsPanel() {
  const rows: [string, string][] = [
    ['Tamaño máx. por foto',   `${MAX_IMAGE_SIZE_MB} MB`],
    ['Fotos host (base)',       `${HOST_PHOTOS_BASE} fotos`],
    ['Fotos galería (guests)',  `${MAX_GALLERY_PHOTOS} fotos`],
    ['Total fotos / inv.',      `${TOTAL_MAX_PHOTOS} fotos`],
    ['Storage máx. / inv.',     fmtMB(MAX_STORAGE_MB)],
    ['Audio (máx.)',            `${MAX_AUDIO_SIZE_MB} MB`],
    ['Pistas de audio',         `${MAX_AUDIO_TRACKS}`],
    ['Retención de datos',      `${DATA_RETENTION_MONTHS} meses`],
    ['Retención de logs',       `${LOGS_RETENTION_MONTHS} meses`],
    ['Historial (chars)',       `${HISTORY_MAX_CHARS.toLocaleString()}`],
  ]

  return (
    <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,.08)] p-[22px]">
      <h3 className="text-[.9rem] font-semibold mb-3">Límites del sistema</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between text-[.78rem] border-b border-[#f0f0f0] pb-1">
            <span className="text-[#6b7280]">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── BarRow ────────────────────────────────────────────────────────────────────

// Fixed segment colors per content type
const SEGMENT_HOST    = 'bg-[#6366f1]'   // indigo  – fotos del anfitrión
const SEGMENT_GALLERY = {
  active:   'bg-[#16a34a]',
  expiring: 'bg-[#ea580c]',
  expired:  'bg-[#9ca3af]',
} as const

const STATUS_LABEL_COLOR: Record<InvitacionStatus, string> = {
  active:   'text-[#16a34a]',
  expiring: 'text-[#ea580c]',
  expired:  'text-[#9ca3af]',
}

interface BarRowProps {
  inv:            InvitacionAdmin
  stats:          GaleriaStats | null   // null = galería stats fetch failed
  historiaImgs:   number                // count of historia sections with images
  status:         InvitacionStatus
}

function BarRow({ inv, stats, historiaImgs, status }: BarRowProps) {
  const audioEnabled  = hasAudio(inv)
  const labelColor    = STATUS_LABEL_COLOR[status]
  const galleryColor  = SEGMENT_GALLERY[status]

  // ── Guest gallery ────────────────────────────────────────────────────────
  const galleryBytes  = stats?.tamanoTotalBytes ?? 0
  const totalFotos    = stats?.totalFotos ?? 0
  const maxFotos      = stats?.maxFotos ?? inv.maxFotos

  // ── Host photos ──────────────────────────────────────────────────────────
  const hostPhotos    = inv.fotosAnfitrion ?? []
  const hostBytes     = hostPhotos.reduce((s, f) => s + f.tamano, 0)
  const maxHostMB     = HOST_PHOTOS_BASE * MAX_IMAGE_SIZE_MB

  // ── Totals / percentages (relative to total capacity) ───────────────────
  const maxGalleryMB    = maxFotos * MAX_IMAGE_SIZE_MB
  const totalMaxMB      = maxGalleryMB + maxHostMB + (audioEnabled ? MAX_AUDIO_SIZE_MB : 0)
  const totalMaxBytes   = totalMaxMB * 1024 * 1024
  const totalUsedBytes  = hostBytes + galleryBytes

  const hostPct         = totalMaxBytes > 0 ? Math.min(100, (hostBytes    / totalMaxBytes) * 100) : 0
  const galleryPctRaw   = totalMaxBytes > 0 ? (galleryBytes / totalMaxBytes) * 100 : 0
  const galleryPct      = Math.min(galleryPctRaw, 100 - hostPct)

  const hasAnyData = stats !== null || hostPhotos.length > 0

  return (
    <div className="py-3 border-b border-[#f0f0f0] last:border-0">
      {/* Title row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[.82rem] font-medium truncate max-w-[55%]">{inv.titulo}</span>
        <span className={`text-[.75rem] font-semibold ${hasAnyData ? labelColor : 'text-[#9ca3af]'}`}>
          {hasAnyData ? `${fmtBytes(totalUsedBytes)} / ${fmtMB(totalMaxMB)}` : 'Sin datos'}
        </span>
      </div>

      {/* Single stacked bar */}
      <div className="h-3 bg-[#f0f0f0] rounded-full overflow-hidden flex">
        {/* Anfitrión segment */}
        <div
          className={`h-full transition-all ${SEGMENT_HOST}`}
          style={{ width: `${hostPct}%` }}
        />
        {/* Galería segment */}
        <div
          className={`h-full transition-all ${galleryColor}`}
          style={{ width: `${galleryPct}%` }}
        />
      </div>

      {/* Legend row */}
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
        {/* Anfitrión */}
        <div className="flex items-center gap-1 text-[.7rem] text-[#6b7280]">
          <span className={`inline-block w-2 h-2 rounded-sm ${SEGMENT_HOST}`} />
          <span>Anfitrión:</span>
          <span className="font-medium">{hostPhotos.length} / {HOST_PHOTOS_BASE} · {fmtBytes(hostBytes)}</span>
        </div>

        {/* Historia (count only — size not tracked) */}
        {historiaImgs > 0 && (
          <div className="flex items-center gap-1 text-[.7rem] text-[#6b7280]">
            <span className="inline-block w-2 h-2 rounded-sm bg-[#0891b2]" />
            <span>Historia:</span>
            <span className="font-medium">{historiaImgs} img{historiaImgs !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Galería */}
        <div className="flex items-center gap-1 text-[.7rem] text-[#6b7280]">
          <span className={`inline-block w-2 h-2 rounded-sm ${galleryColor}`} />
          <span>Galería:</span>
          <span className="font-medium">
            {stats ? `${totalFotos} / ${maxFotos} · ${fmtBytes(galleryBytes)}` : '—'}
          </span>
        </div>

        {/* Audio */}
        {audioEnabled && (
          <div className="flex items-center gap-1 text-[.7rem] text-[#6b7280]">
            <span className="inline-block w-2 h-2 rounded-sm bg-[#d97706]" />
            <span>Audio:</span>
            <span className="font-medium">{MAX_AUDIO_TRACKS} pista · {MAX_AUDIO_SIZE_MB} MB</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── CategorySection ───────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<InvitacionStatus, string> = {
  active:   'Activas',
  expiring: 'Próximas a Expirar',
  expired:  'Expiradas',
}

interface CategorySectionProps {
  status:       InvitacionStatus
  items:        InvitacionAdmin[]
  statsMap:     Record<string, GaleriaStats | null>
  historiasMap: Record<string, number>
}

function CategorySection({ status, items, statsMap, historiasMap }: CategorySectionProps) {
  const totalBytes = items.reduce((sum, inv) => {
    const galleryBytes = statsMap[inv.id]?.tamanoTotalBytes ?? 0
    const hostBytes    = (inv.fotosAnfitrion ?? []).reduce((s, f) => s + f.tamano, 0)
    return sum + galleryBytes + hostBytes
  }, 0)

  return (
    <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,.08)] p-[22px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[.9rem] font-semibold">{CATEGORY_LABELS[status]}</h3>
        <span className="text-[.75rem] text-[#6b7280]">
          {items.length} inv. · {fmtBytes(totalBytes)} usados
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-[.82rem] text-[#9ca3af] text-center py-4">Sin invitaciones.</p>
      ) : (
        <div>
          {items.map(inv => (
            <BarRow
              key={inv.id}
              inv={inv}
              stats={statsMap[inv.id] ?? null}
              historiaImgs={historiasMap[inv.id] ?? 0}
              status={status}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── StorageReporte (main) ─────────────────────────────────────────────────────

export function StorageReporte() {
  const [invitaciones, setInvitaciones] = useState<InvitacionAdmin[]>([])
  const [statsMap,     setStatsMap]     = useState<Record<string, GaleriaStats | null>>({})
  const [historiasMap, setHistoriasMap] = useState<Record<string, number>>({})
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res  = await adminInvitacionService.getAll({ limit: 100 })
        const invs = res.data
        setInvitaciones(invs)

        // Fetch galería stats and historia image counts in parallel for all invitations.
        // Failures produce null/0 entries — they don't abort the whole report.
        const [galeriaResults, historiaResults] = await Promise.all([
          Promise.allSettled(invs.map(inv => adminInvitacionService.getGaleriaStats(inv.id))),
          Promise.allSettled(invs.map(inv => adminInvitacionService.getHistorias(inv.id))),
        ])

        const statsMap: Record<string, GaleriaStats | null> = {}
        galeriaResults.forEach((r, i) => {
          statsMap[invs[i].id] = r.status === 'fulfilled' ? r.value : null
        })
        setStatsMap(statsMap)

        const historiasMap: Record<string, number> = {}
        historiaResults.forEach((r, i) => {
          historiasMap[invs[i].id] = r.status === 'fulfilled'
            ? r.value.filter(s => s.imagenUrl !== null).length
            : 0
        })
        setHistoriasMap(historiasMap)
      } catch {
        setError('No se pudieron cargar las invitaciones.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center gap-2 text-[#6b7280] py-10 justify-center">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Cargando reporte de storage...</span>
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-[#fee2e2] rounded-xl text-[#dc2626] max-w-xl">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm">{error}</span>
    </div>
  )

  const grouped: Record<InvitacionStatus, InvitacionAdmin[]> = {
    active:   [],
    expiring: [],
    expired:  [],
  }
  for (const inv of invitaciones) {
    grouped[getInvitacionStatus(inv)].push(inv)
  }

  return (
    <div className="space-y-5">
      <LimitsPanel />
      {(['active', 'expiring', 'expired'] as InvitacionStatus[]).map(status => (
        <CategorySection
          key={status}
          status={status}
          items={grouped[status]}
          statsMap={statsMap}
          historiasMap={historiasMap}
        />
      ))}
    </div>
  )
}
