import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, RefreshCw, PlusCircle } from 'lucide-react'
import { adminInvitacionService } from '@/services/adminInvitacionService'
import type { InvitacionAdmin } from '@/types/adminInvitacion'
import { getInvitacionStatus } from '@/types/adminInvitacion'
import {
  InvitacionesTabs,
  type InvitacionTab,
} from '@/components/admin/invitaciones/InvitacionesTabs'
import { InvitacionesTable } from '@/components/admin/invitaciones/InvitacionesTable'

type InvitacionOrigin = 'all' | 'mine' | 'clients'

const ORIGIN_TABS: { id: InvitacionOrigin; label: string }[] = [
  { id: 'all',     label: 'Todas' },
  { id: 'mine',    label: 'Mías' },
  { id: 'clients', label: 'De clientes' },
]

export default function InvitacionesPage() {
  const navigate = useNavigate()

  const [invitaciones, setInvitaciones] = useState<InvitacionAdmin[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [tab,          setTab]          = useState<InvitacionTab>('all')
  const [origin,       setOrigin]       = useState<InvitacionOrigin>('all')
  const [deleting,     setDeleting]     = useState<Set<string>>(new Set())

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await adminInvitacionService.getAll({ limit: 100 })
      setInvitaciones(result.data)
    } catch {
      setError('No se pudieron cargar las invitaciones. Verificá que la API esté activa.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Derived data ──────────────────────────────────────────────────────────

  // Invitations filtered by origin (admin-created = usuarioId null; client = otherwise)
  const byOrigin = useMemo(() => {
    if (origin === 'mine') return invitaciones.filter(inv => inv.usuarioId == null)
    if (origin === 'clients') return invitaciones.filter(inv => inv.usuarioId != null)
    return invitaciones
  }, [invitaciones, origin])

  const originCounts = useMemo(() => ({
    all: invitaciones.length,
    mine: invitaciones.filter(inv => inv.usuarioId == null).length,
    clients: invitaciones.filter(inv => inv.usuarioId != null).length,
  }), [invitaciones])

  const counts = useMemo<Record<InvitacionTab, number>>(() => {
    const base = { all: byOrigin.length, active: 0, expiring: 0, expired: 0 }
    for (const inv of byOrigin) {
      base[getInvitacionStatus(inv)]++
    }
    return base
  }, [byOrigin])

  const filtered = useMemo(() => {
    if (tab === 'all') return byOrigin
    return byOrigin.filter(inv => getInvitacionStatus(inv) === tab)
  }, [byOrigin, tab])

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleCopyUrl(inv: InvitacionAdmin) {
    const url = `${window.location.origin}/${inv.id}`
    navigator.clipboard
      ?.writeText(url)
      .then(() => alert(`URL copiada:\n${url}`))
      .catch(() => alert(url))
  }

  function handleView(inv: InvitacionAdmin) {
    navigate(`/admin/invitaciones/${inv.id}`)
  }

  async function handleDelete(inv: InvitacionAdmin) {
    if (!confirm(`¿Eliminar "${inv.titulo}"?\nEsta acción no se puede deshacer.`)) return

    setDeleting(prev => new Set(prev).add(inv.id))
    try {
      await adminInvitacionService.delete(inv.id)
      setInvitaciones(prev => prev.filter(i => i.id !== inv.id))
    } catch {
      alert('No se pudo eliminar la invitación. Intentá de nuevo.')
    } finally {
      setDeleting(prev => {
        const next = new Set(prev)
        next.delete(inv.id)
        return next
      })
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-2 text-[#6b7280]">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Cargando invitaciones...</span>
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-[#fee2e2] rounded-xl text-[#dc2626] max-w-xl">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm flex-1">{error}</span>
      <button
        onClick={fetchAll}
        className="flex items-center gap-1 text-sm font-medium underline hover:no-underline"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Reintentar
      </button>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">Invitaciones</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#2d2926] transition-colors"
            title="Recargar"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar
          </button>
          <button
            onClick={() => navigate('/admin/invitaciones/crear')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2d2926] text-[#fefcf9] text-sm font-medium rounded-lg hover:bg-[#4a4441] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva invitación
          </button>
        </div>
      </div>

      {/* Origin segmented control (admin vs client created) */}
      <div className="inline-flex items-center gap-1 p-1 bg-[#f3f0ea] rounded-lg mb-4">
        {ORIGIN_TABS.map(o => (
          <button
            key={o.id}
            onClick={() => setOrigin(o.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-[.8rem] font-medium rounded-md transition-colors ${
              origin === o.id
                ? 'bg-white text-[#2d2926] shadow-sm'
                : 'text-[#6b7280] hover:text-[#2d2926]'
            }`}
          >
            {o.label}
            <span className={`text-[.7rem] px-1.5 py-0.5 rounded-full font-semibold ${
              origin === o.id ? 'bg-[#c5a572] text-white' : 'bg-[#e5e7eb] text-[#6b7280]'
            }`}>
              {originCounts[o.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Tabs with live counts */}
      <InvitacionesTabs activeTab={tab} counts={counts} onChange={setTab} />

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#f0f0f0] shadow-sm p-5">
        <InvitacionesTable
          invitaciones={filtered}
          deleting={deleting}
          onCopyUrl={handleCopyUrl}
          onView={handleView}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
