import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Loader2,
  Upload,
  Trash2,
  Download,
  Lock,
  Images,
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { galeriaService } from '@/services/galeriaService'
import type { FotoGaleria } from '@/services/galeriaService'
import { getInvitacionPublica } from '@/services/invitacionService'

// ── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white"
        onClick={onClose}
      >
        <X className="w-7 h-7" />
      </button>
      <img
        src={url}
        alt=""
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

// ── FotoCard ─────────────────────────────────────────────────────────────────

interface FotoCardProps {
  foto: FotoGaleria
  adminMode: boolean
  deleting: boolean
  onDelete: (id: number) => void
  onOpen: (url: string) => void
}

function FotoCard({ foto, adminMode, deleting, onDelete, onOpen }: FotoCardProps) {
  return (
    <div className="relative group overflow-hidden rounded-xl bg-[#f0f0f0] aspect-square">
      <img
        src={foto.url}
        alt=""
        className="w-full h-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105"
        loading="lazy"
        onClick={() => onOpen(foto.url)}
      />
      {adminMode && (
        <button
          onClick={() => onDelete(foto.id)}
          disabled={deleting}
          className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          title="Eliminar foto"
        >
          {deleting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Trash2 className="w-4 h-4" />
          }
        </button>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

export default function GaleriaPage() {
  const { eventoId } = useParams<{ eventoId: string }>()

  // invitation info
  const [titulo, setTitulo] = useState<string>('')

  // gallery
  const [fotos, setFotos]       = useState<FotoGaleria[]>([])
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(false)

  // lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  // upload
  const fileInputRef              = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState('')

  // admin panel
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [adminPassword, setAdminPassword]   = useState('')
  const [adminMode, setAdminMode]           = useState(false)
  const [deletingIds, setDeletingIds]       = useState<Set<number>>(new Set())
  const [deleteError, setDeleteError]       = useState('')

  // ── load ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!eventoId) return
    Promise.all([
      galeriaService.listar(eventoId),
      getInvitacionPublica(eventoId).catch(() => null),
    ]).then(([photos, inv]) => {
      setFotos(photos)
      if (inv) setTitulo(inv.titulo)
    }).catch(() => {
      setLoadError(true)
    }).finally(() => {
      setLoading(false)
    })
  }, [eventoId])

  // ── upload ────────────────────────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !eventoId) return

    setUploadState('uploading')
    setUploadError('')

    try {
      const nueva = await galeriaService.subir(eventoId, file)
      setFotos(prev => [nueva, ...prev])
      setUploadState('success')
      setTimeout(() => setUploadState('idle'), 3000)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (status === 409)        setUploadError('La galería está llena.')
      else if (status === 413)   setUploadError('El archivo supera 15 MB.')
      else if (status === 415)   setUploadError('Formato no permitido. Usá JPEG, PNG, WebP o GIF.')
      else if (status === 410)   setUploadError('La invitación está expirada.')
      else                       setUploadError(msg ?? 'No se pudo subir la foto.')
      setUploadState('error')
      setTimeout(() => setUploadState('idle'), 5000)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(fotoId: number) {
    if (!eventoId || !adminPassword) return

    setDeletingIds(prev => new Set(prev).add(fotoId))
    setDeleteError('')

    try {
      await galeriaService.eliminar(eventoId, fotoId, adminPassword)
      setFotos(prev => prev.filter(f => f.id !== fotoId))
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        setDeleteError('Contraseña incorrecta.')
        setAdminMode(false)
      } else {
        setDeleteError('No se pudo eliminar la foto.')
      }
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev)
        next.delete(fotoId)
        return next
      })
    }
  }

  // ── download zip ────────────────────────────────────────────────────────────

  function handleDownloadZip() {
    if (!eventoId) return
    window.open(galeriaService.getZipUrl(eventoId), '_blank')
  }

  // ── render ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#e8e8e8]">
      <Loader2 className="w-6 h-6 animate-spin text-[#555]" />
    </div>
  )

  if (loadError) return (
    <div className="flex min-h-screen items-center justify-center bg-[#e8e8e8] px-4">
      <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm text-[#dc2626] max-w-sm w-full">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm">No se pudo cargar la galería. Intentá de nuevo.</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#e8e8e8] px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <Images className="h-6 w-6 text-[#555555]" />
          </div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Galería del evento</h1>
          {titulo && (
            <p className="mt-1 text-sm text-[#777777]">{titulo}</p>
          )}
          <p className="mt-1 text-sm text-[#999]">
            {fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'}
          </p>
        </div>

        {/* Upload */}
        <div className="mb-6 bg-white rounded-2xl p-4 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />

          {uploadState === 'success' ? (
            <div className="flex items-center justify-center gap-2 py-2 text-[#16a34a] text-sm font-medium">
              <CheckCircle2 className="w-5 h-5" />
              ¡Foto subida exitosamente!
            </div>
          ) : (
            <button
              disabled={uploadState === 'uploading'}
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#d1d5db] py-4 text-sm font-medium text-[#6b7280] transition-colors hover:border-[#555] hover:text-[#1a1a1a] disabled:opacity-50"
            >
              {uploadState === 'uploading'
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo foto...</>
                : <><Upload className="w-4 h-4" /> Subir una foto</>
              }
            </button>
          )}

          {uploadState === 'error' && uploadError && (
            <p className="mt-2 text-center text-xs text-red-500">{uploadError}</p>
          )}
        </div>

        {/* Photo grid */}
        {fotos.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <Images className="mx-auto mb-3 h-10 w-10 text-[#d1d5db]" />
            <p className="text-sm text-[#9ca3af]">Todavía no hay fotos.</p>
            <p className="mt-1 text-xs text-[#c4c4c4]">¡Sé el primero en subir una!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            {fotos.map(foto => (
              <FotoCard
                key={foto.id}
                foto={foto}
                adminMode={adminMode}
                deleting={deletingIds.has(foto.id)}
                onDelete={handleDelete}
                onOpen={setLightboxUrl}
              />
            ))}
          </div>
        )}

        {deleteError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {deleteError}
          </div>
        )}

        {/* Admin section */}
        <div className="mt-8">
          {!showAdminPanel && (
            <div className="text-center">
              <button
                onClick={() => setShowAdminPanel(true)}
                className="inline-flex items-center gap-1.5 text-xs text-[#aaaaaa] hover:text-[#555] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Acceso del anfitrión
              </button>
            </div>
          )}

          {showAdminPanel && !adminMode && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#555]" />
                  Panel del anfitrión
                </h2>
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="text-[#aaa] hover:text-[#555] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#777777]">
                Contraseña del evento
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aaaaaa]" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Contraseña del evento"
                  className="w-full rounded-lg border border-[#e0e0e0] py-3 pl-9 pr-4 text-sm text-[#1a1a1a] outline-none focus:border-[#555555] focus:ring-0"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && adminPassword.trim()) {
                      setAdminMode(true)
                    }
                  }}
                />
              </div>

              <button
                disabled={!adminPassword.trim()}
                onClick={() => setAdminMode(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                Acceder
              </button>
            </div>
          )}

          {showAdminPanel && adminMode && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                  Panel del anfitrión activo
                </h2>
                <button
                  onClick={() => { setAdminMode(false); setAdminPassword(''); setShowAdminPanel(false) }}
                  className="text-[#aaa] hover:text-[#555] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#6b7280] mb-4">
                Las fotos muestran el botón de eliminar. Para descargar todas las fotos en un ZIP usá el botón de abajo.
              </p>

              <button
                disabled={fotos.length === 0}
                onClick={handleDownloadZip}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d1d5db] py-3 text-sm font-medium text-[#1a1a1a] transition-colors hover:border-[#555] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Descargar todas las fotos ({fotos.length})
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  )
}
