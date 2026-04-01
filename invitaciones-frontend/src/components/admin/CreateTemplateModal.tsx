import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { templateService, type CreateTemplatePayload } from '@/services/templateService'
import { TIPO_LABEL } from '@/services/templateService'
import { registeredSlugs } from '@/components/invitations/registry'

const TIPO_OPTIONS = [
  { id: 1, label: 'Boda' },
  { id: 2, label: 'Quinceañera' },
  { id: 3, label: 'Cumpleaños' },
]

interface Props {
  onClose: () => void
  onCreated: () => void
}

const EMPTY: CreateTemplatePayload = {
  tipoEventoId: 1,
  nombre: '',
  slug: registeredSlugs[0] ?? '',
  thumbnailUrl: '',
  descripcion: '',
}

export function CreateTemplateModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<CreateTemplatePayload>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof CreateTemplatePayload>(k: K, v: CreateTemplatePayload[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.slug) return
    setSubmitting(true)
    setError(null)
    try {
      const payload: CreateTemplatePayload = {
        tipoEventoId: form.tipoEventoId,
        nombre: form.nombre.trim(),
        slug: form.slug,
        ...(form.thumbnailUrl?.trim() ? { thumbnailUrl: form.thumbnailUrl.trim() } : {}),
        ...(form.descripcion?.trim() ? { descripcion: form.descripcion.trim() } : {}),
      }
      await templateService.create(payload)
      onCreated()
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'No se pudo crear la template.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-lg font-semibold text-[#2d2926]">Nueva template</h2>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#2d2926] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Tipo de evento */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">Tipo de evento</label>
            <select
              value={form.tipoEventoId}
              onChange={e => set('tipoEventoId', Number(e.target.value))}
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40 focus:border-[#c5a572]"
            >
              {TIPO_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="ej: Elegante Dorado"
              maxLength={150}
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40 focus:border-[#c5a572]"
              required
            />
          </div>

          {/* Componente (slug) */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Componente React
              <span className="ml-1.5 text-[0.7rem] text-[#9ca3af] font-normal">slug de la carpeta en /invitations/</span>
            </label>
            {registeredSlugs.length > 0 ? (
              <select
                value={form.slug}
                onChange={e => set('slug', e.target.value)}
                className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40 focus:border-[#c5a572]"
              >
                {registeredSlugs.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.slug}
                onChange={e => set('slug', e.target.value)}
                placeholder="ej: invitation-basic"
                className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40 focus:border-[#c5a572]"
              />
            )}
            <p className="mt-1 text-[0.7rem] text-[#9ca3af]">
              El slug debe coincidir exactamente con el nombre de la carpeta en{' '}
              <code className="bg-[#f3f4f6] px-1 rounded">src/components/invitations/</code>
            </p>
          </div>

          {/* Thumbnail URL (opcional) */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Thumbnail URL <span className="text-[#9ca3af] font-normal">(opcional)</span>
            </label>
            <input
              type="url"
              value={form.thumbnailUrl}
              onChange={e => set('thumbnailUrl', e.target.value)}
              placeholder="https://..."
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40 focus:border-[#c5a572]"
            />
          </div>

          {/* Descripción (opcional) */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Descripción <span className="text-[#9ca3af] font-normal">(opcional)</span>
            </label>
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              rows={2}
              placeholder="Breve descripción del diseño..."
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40 focus:border-[#c5a572]"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-[#dc2626] bg-[#fee2e2] rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#6b7280] hover:text-[#2d2926] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !form.nombre.trim() || !form.slug}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-[#2d2926] text-white rounded-lg hover:bg-[#1a1f2e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear template
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
