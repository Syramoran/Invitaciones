import { useState, useEffect, useCallback } from 'react'
import { Loader2, AlertCircle, RefreshCw, Plus } from 'lucide-react'
import { templateService, TIPO_LABEL, type Template } from '@/services/templateService'
import { TemplateCard } from '@/components/admin/TemplateCard'
import { CreateTemplateModal } from '@/components/admin/CreateTemplateModal'

const TABS = [
  { label: 'Todos',        tipoId: null },
  { label: 'Boda',         tipoId: 1    },
  { label: 'Quinceañera',  tipoId: 2    },
  { label: 'Cumpleaños',   tipoId: 3    },
]

export default function TemplatesPage() {
  const [templates,     setTemplates]     = useState<Template[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [toggling,      setToggling]      = useState<Set<number>>(new Set())
  const [activeTab,     setActiveTab]     = useState<number | null>(null)
  const [showInactive,  setShowInactive]  = useState(false)
  const [showCreate,    setShowCreate]    = useState(false)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const all = await templateService.getAll()
      setTemplates(all)
    } catch {
      setError('No se pudieron cargar los templates. Verificá que la API esté activa.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  async function handleToggle(id: number) {
    setToggling(prev => new Set(prev).add(id))
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, activo: !t.activo } : t))
    try {
      const updated = await templateService.toggle(id)
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t))
    } catch {
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, activo: !t.activo } : t))
    } finally {
      setToggling(prev => { const next = new Set(prev); next.delete(id); return next })
    }
  }

  const byTab = activeTab === null
    ? templates
    : templates.filter(t => t.tipoEventoId === activeTab)

  const filtered = showInactive ? byTab : byTab.filter(t => t.activo)

  // Conteo por tipo (sobre todos, no solo visible)
  const count = (tipoId: number | null) =>
    tipoId === null ? templates.length : templates.filter(t => t.tipoEventoId === tipoId).length

  const inactiveCount = templates.filter(t => !t.activo).length

  // ── Render ──────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-2 text-[#6b7280]">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Cargando templates...</span>
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-[#fee2e2] rounded-xl text-[#dc2626] max-w-xl">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm flex-1">{error}</span>
      <button onClick={fetchTemplates} className="flex items-center gap-1 text-sm font-medium underline hover:no-underline">
        <RefreshCw className="w-3.5 h-3.5" /> Reintentar
      </button>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">Gestión de Templates</h1>
        <div className="flex items-center gap-4">
          {/* Nueva template */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 text-sm font-medium bg-[#2d2926] text-white px-4 py-2 rounded-lg hover:bg-[#1a1f2e] transition-colors"
          >
            <Plus className="w-4 h-4" /> Nueva template
          </button>
          {/* Toggle mostrar inactivos */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm text-[#6b7280]">
              Mostrar inactivos
              {inactiveCount > 0 && (
                <span className="ml-1 text-[.7rem] bg-[#e5e7eb] text-[#6b7280] px-1.5 py-0.5 rounded-full">{inactiveCount}</span>
              )}
            </span>
            <div className={`relative w-9 h-5 rounded-full transition-colors ${showInactive ? 'bg-[#c5a572]' : 'bg-[#d1d5db]'}`}
              onClick={() => setShowInactive(v => !v)}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${showInactive ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
          </label>
          <button
            onClick={fetchTemplates}
            className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#2d2926] transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Recargar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b-2 border-[#e5e7eb] mb-6">
        {TABS.map(tab => (
          <button
            key={String(tab.tipoId)}
            onClick={() => setActiveTab(tab.tipoId)}
            className={`px-5 py-2.5 text-[.85rem] font-medium border-b-2 -mb-0.5 transition-all ${
              activeTab === tab.tipoId
                ? 'text-[#2d2926] border-[#c5a572]'
                : 'text-[#6b7280] border-transparent hover:text-[#2d2926]'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[.72rem] text-[#9ca3af]">({count(tab.tipoId)})</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#9ca3af]">
          <p className="text-sm">
            No hay templates para {activeTab ? TIPO_LABEL[activeTab] : 'este filtro'} todavía.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              toggling={toggling.has(t.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      <p className="text-[.72rem] text-[#9ca3af] mt-4">
        El toggle desactiva el template para nuevos pedidos. Los existentes no se ven afectados.
      </p>

      {showCreate && (
        <CreateTemplateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchTemplates() }}
        />
      )}
    </div>
  )
}
