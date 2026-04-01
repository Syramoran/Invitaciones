import { useState, useEffect, useCallback } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { servicioService, type Servicio } from '@/services/servicioService'
import { ServiciosTable, type EditState } from '@/components/admin/ServiciosTable'

export default function ServiciosPage() {
  const [services,  setServices]  = useState<Servicio[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [toggling,  setToggling]  = useState<Set<number>>(new Set())
  const [editState, setEditState] = useState<EditState>({ id: null, value: '' })

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await servicioService.getAll()
      setServices(data)
    } catch {
      setError('No se pudieron cargar los servicios. Verificá que la API esté activa.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchServices() }, [fetchServices])

  // Optimistic toggle: cambia el estado local de inmediato y revierte si falla
  async function handleToggle(id: number) {
    setToggling(prev => new Set(prev).add(id))
    setServices(prev => prev.map(s => s.id === id ? { ...s, activo: !s.activo } : s))
    try {
      const updated = await servicioService.toggle(id)
      // Merge para no perder campos que el backend no devuelva en el toggle
      setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s))
    } catch {
      setServices(prev => prev.map(s => s.id === id ? { ...s, activo: !s.activo } : s))
    } finally {
      setToggling(prev => { const next = new Set(prev); next.delete(id); return next })
    }
  }

  function handleStartEdit(s: Servicio) {
    setEditState({ id: s.id, value: String(s.precio) })
  }

  // Guarda el precio editado; revierte si la API falla
  async function handleCommitEdit() {
    if (editState.id === null) return
    const id     = editState.id
    const precio = parseFloat(editState.value)
    setEditState({ id: null, value: '' })
    if (isNaN(precio) || precio < 0) return

    const original = services.find(s => s.id === id)?.precio
    setServices(prev => prev.map(s => s.id === id ? { ...s, precio } : s))
    try {
      const updated = await servicioService.update(id, { precio })
      setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s))
    } catch {
      if (original !== undefined)
        setServices(prev => prev.map(s => s.id === id ? { ...s, precio: original } : s))
    }
  }

  // ── Render ──────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-2 text-[#6b7280]">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Cargando servicios...</span>
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-[#fee2e2] rounded-xl text-[#dc2626] max-w-xl">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm flex-1">{error}</span>
      <button
        onClick={fetchServices}
        className="flex items-center gap-1 text-sm font-medium underline hover:no-underline"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Reintentar
      </button>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">Gestión de Servicios</h1>
        <button
          onClick={fetchServices}
          className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#2d2926] transition-colors"
          title="Recargar"
        >
          <RefreshCw className="w-4 h-4" />
          Recargar
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#f0f0f0] shadow-sm p-5">
        <ServiciosTable
          services={services}
          toggling={toggling}
          editState={editState}
          onToggle={handleToggle}
          onStartEdit={handleStartEdit}
          onEditChange={value => setEditState(prev => ({ ...prev, value }))}
          onCommitEdit={handleCommitEdit}
          onCancelEdit={() => setEditState({ id: null, value: '' })}
        />
      </div>
    </div>
  )
}
