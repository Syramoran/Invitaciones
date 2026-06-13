import { useState, useEffect, useCallback } from 'react'
import {
  Loader2, AlertCircle, RefreshCw, Plus, Tag, Trash2,
  ToggleLeft, ToggleRight, Wand2,
} from 'lucide-react'
import {
  codigosDescuentoService,
  type CodigoDescuento,
  type CrearCodigoDescuentoDto,
} from '@/services/codigosDescuentoService'

function generateCodigo(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const INIT_FORM: CrearCodigoDescuentoDto = {
  codigo: '',
  porcentaje: 100,
  descripcion: '',
  fechaExpiracion: '',
  limiteUsos: undefined,
}

export default function CodigosDescuentoPage() {
  const [codigos, setCodigos] = useState<CodigoDescuento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState<Set<number>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CrearCodigoDescuentoDto>(INIT_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchCodigos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await codigosDescuentoService.listar()
      setCodigos(data)
    } catch {
      setError('No se pudieron cargar los códigos. Verificá que la API esté activa.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCodigos() }, [fetchCodigos])

  async function handleToggle(id: number) {
    setToggling(prev => new Set(prev).add(id))
    setCodigos(prev => prev.map(c => c.id === id ? { ...c, activo: !c.activo } : c))
    try {
      const updated = await codigosDescuentoService.toggle(id)
      setCodigos(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
    } catch {
      setCodigos(prev => prev.map(c => c.id === id ? { ...c, activo: !c.activo } : c))
    } finally {
      setToggling(prev => { const next = new Set(prev); next.delete(id); return next })
    }
  }

  async function handleDelete(id: number) {
    setDeleting(prev => new Set(prev).add(id))
    try {
      await codigosDescuentoService.eliminar(id)
      setCodigos(prev => prev.filter(c => c.id !== id))
    } catch {
      setError('Error al eliminar el código.')
    } finally {
      setDeleting(prev => { const next = new Set(prev); next.delete(id); return next })
      setConfirmDelete(null)
    }
  }

  function openModal() {
    setForm(INIT_FORM)
    setFormError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setFormError(null)
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.codigo.trim()) { setFormError('El código es obligatorio.'); return }
    if (form.porcentaje < 1 || form.porcentaje > 100) { setFormError('El porcentaje debe estar entre 1 y 100.'); return }

    setCreating(true)
    try {
      const dto: CrearCodigoDescuentoDto = {
        codigo: form.codigo.trim().toUpperCase(),
        porcentaje: form.porcentaje,
        ...(form.descripcion?.trim() ? { descripcion: form.descripcion.trim() } : {}),
        ...(form.fechaExpiracion ? { fechaExpiracion: form.fechaExpiracion } : {}),
        ...(form.limiteUsos ? { limiteUsos: Number(form.limiteUsos) } : {}),
      }
      const nuevo = await codigosDescuentoService.crear(dto)
      setCodigos(prev => [nuevo, ...prev])
      closeModal()
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Error al crear el código.')
    } finally {
      setCreating(false)
    }
  }

  const formatFecha = (f: string | null) => {
    if (!f) return '—'
    return new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-[#2d2926] flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#c5a572]" />
            Códigos de Descuento
          </h1>
          <p className="text-[#6b7280] text-sm mt-1">
            Creá y gestioná códigos para aplicar descuentos en la creación de invitaciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCodigos}
            className="p-2 text-[#6b7280] hover:text-[#2d2926] hover:bg-[#f3f0ea] rounded-lg transition-colors"
            title="Recargar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#c5a572] text-white rounded-lg hover:bg-[#b8945f] transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuevo Código
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-[#c5a572]" />
          </div>
        ) : codigos.length === 0 ? (
          <div className="py-16 text-center text-[#9ca3af]">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay códigos creados</p>
            <p className="text-sm mt-1">Creá tu primer código de descuento</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#fafaf9] border-b border-[#f0f0f0]">
              <tr>
                <th className="px-4 py-3 text-left text-[.8rem] font-semibold text-[#6b7280] uppercase tracking-wide">Código</th>
                <th className="px-4 py-3 text-left text-[.8rem] font-semibold text-[#6b7280] uppercase tracking-wide">Descuento</th>
                <th className="px-4 py-3 text-left text-[.8rem] font-semibold text-[#6b7280] uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3 text-left text-[.8rem] font-semibold text-[#6b7280] uppercase tracking-wide">Usos</th>
                <th className="px-4 py-3 text-left text-[.8rem] font-semibold text-[#6b7280] uppercase tracking-wide">Vencimiento</th>
                <th className="px-4 py-3 text-left text-[.8rem] font-semibold text-[#6b7280] uppercase tracking-wide">Descripción</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f0ea]">
              {codigos.map(c => (
                <tr key={c.id} className="hover:bg-[#fafaf9] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-[#2d2926] bg-[#f3f0ea] px-2 py-1 rounded-md text-[.82rem]">
                      {c.codigo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${c.porcentaje === 100 ? 'text-green-600' : 'text-[#c5a572]'}`}>
                      {c.porcentaje}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(c.id)}
                      disabled={toggling.has(c.id)}
                      className="flex items-center gap-1.5 text-sm disabled:opacity-50 transition-colors"
                    >
                      {toggling.has(c.id) ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      ) : c.activo ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                      <span className={c.activo ? 'text-green-600' : 'text-[#9ca3af]'}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[#6b7280]">
                    {c.limiteUsos !== null
                      ? `${c.usosActuales} / ${c.limiteUsos}`
                      : `${c.usosActuales} / ∞`}
                  </td>
                  <td className="px-4 py-3 text-[#6b7280]">
                    {formatFecha(c.fechaExpiracion)}
                  </td>
                  <td className="px-4 py-3 text-[#6b7280] max-w-[200px] truncate">
                    {c.descripcion ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {confirmDelete === c.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600 font-medium">¿Confirmar?</span>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting.has(c.id)}
                          className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleting.has(c.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sí'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(c.id)}
                        className="p-1.5 text-[#9ca3af] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-[#2d2926] mb-5 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#c5a572]" />
              Nuevo Código de Descuento
            </h2>

            <form onSubmit={handleCrear} className="space-y-4">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))}
                    placeholder="Ej: BODA100"
                    maxLength={50}
                    className="flex-1 px-3 py-2 border border-[#d1d5db] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40 focus:border-[#c5a572] font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, codigo: generateCodigo() }))}
                    className="px-3 py-2 border border-[#d1d5db] rounded-lg text-[#6b7280] hover:bg-[#f3f0ea] hover:text-[#2d2926] transition-colors"
                    title="Generar código aleatorio"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Porcentaje */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Descuento <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={form.porcentaje}
                    onChange={e => setForm(f => ({ ...f, porcentaje: Number(e.target.value) }))}
                    className="flex-1 accent-[#c5a572]"
                  />
                  <div className="flex items-center gap-1 w-20">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.porcentaje}
                      onChange={e => setForm(f => ({ ...f, porcentaje: Math.min(100, Math.max(1, Number(e.target.value))) }))}
                      className="w-16 px-2 py-1.5 border border-[#d1d5db] rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40"
                    />
                    <span className="text-[#6b7280]">%</span>
                  </div>
                </div>
                {form.porcentaje === 100 && (
                  <p className="text-xs text-green-600 mt-1">La invitación se activará sin cobrar.</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Descripción <span className="text-[#9ca3af] font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={form.descripcion ?? ''}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Ej: Código para clientes VIP"
                  maxLength={255}
                  className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40 focus:border-[#c5a572]"
                />
              </div>

              {/* Fecha expiración */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Fecha de vencimiento <span className="text-[#9ca3af] font-normal">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={form.fechaExpiracion ?? ''}
                  onChange={e => setForm(f => ({ ...f, fechaExpiracion: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40 focus:border-[#c5a572]"
                />
              </div>

              {/* Límite de usos */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Límite de usos <span className="text-[#9ca3af] font-normal">(vacío = ilimitado)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.limiteUsos ?? ''}
                  onChange={e => setForm(f => ({ ...f, limiteUsos: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="Ilimitado"
                  className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40 focus:border-[#c5a572]"
                />
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="px-4 py-2 border border-[#d1d5db] rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-[#c5a572] text-white rounded-lg text-sm font-medium hover:bg-[#b8945f] disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Crear Código
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
