import type { WizardStep1 } from '@/types/crearInvitacion'
import type { Pedido } from '@/types/adminPedido'
import type { Template } from '@/services/templateService'
import { TIPO_LABEL } from '@/services/templateService'

// Cycle through these gradients for template card previews
const GRADIENTS = [
  'linear-gradient(135deg,#f7ede3,#efe0cc)',
  'linear-gradient(135deg,#e8f0e6,#d4ddd0)',
  'linear-gradient(135deg,#fff,#f5f5f5)',
  'linear-gradient(135deg,#fce4ec,#f8d0dc)',
  'linear-gradient(135deg,#1a1a3a,#2a2a5a)',
  'linear-gradient(135deg,#fef9f0,#fdf0f5)',
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#f5f0ea,#ebe5dd)',
  'linear-gradient(135deg,#fff3e0,#ffe0b2)',
]

const GRADIENT_TEXT = [
  '#2d2926','#3a5a3a','#2d2926','#5a3a4a',
  '#e0d0ff','#6a4a5a','#ff6fd8','#2d2926','#e65100',
]

// Supported tipoEvento options (matching the API seeded data)
const TIPO_OPTIONS = [
  { id: 1, label: 'Boda' },
  { id: 2, label: 'Quinceañera' },
  { id: 3, label: 'Cumpleaños' },
]

interface Props {
  state: WizardStep1
  onChange: (updates: Partial<WizardStep1>) => void
  pedidos: Pedido[]
  templates: Template[]
  onNext: () => void
}

export function Step1DatosBasicos({ state, onChange, pedidos, templates, onNext }: Props) {
  const filteredTemplates = templates.filter(
    t => t.activo && (state.tipoEventoId === null || t.tipoEventoId === state.tipoEventoId),
  )

  function handlePedidoChange(pedidoId: string) {
    onChange({ pedidoId })
    if (!pedidoId) return
    const p = pedidos.find(x => String(x.id) === pedidoId)
    if (p) onChange({ pedidoId, tipoEventoId: p.tipoEventoId, templateId: p.templateId })
  }

  const canProceed = state.tipoEventoId !== null && state.templateId !== null && state.titulo.trim().length > 0

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">Datos Básicos</h2>

      {/* Pedido asociado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
            Pedido asociado <span className="text-[#9ca3af] font-normal">(opcional)</span>
          </label>
          <select
            value={state.pedidoId}
            onChange={e => handlePedidoChange(e.target.value)}
            className="w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] focus:border-[#c5a572] focus:ring-0 focus:outline-none bg-white transition-colors"
          >
            <option value="">— Seleccionar —</option>
            {pedidos.map(p => (
              <option key={p.id} value={String(p.id)}>
                PED-{String(p.id).padStart(3, '0')} · {p.nombreCliente} · {p.tipoEventoNombre}
              </option>
            ))}
          </select>
          <p className="text-[.72rem] text-[#6b7280] mt-1">
            Al seleccionar un pedido se precarga tipo de evento y template
          </p>
        </div>

        {/* Tipo de evento */}
        <div>
          <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
            Tipo de evento <span className="text-[#dc2626]">*</span>
          </label>
          <select
            value={state.tipoEventoId ?? ''}
            onChange={e => onChange({ tipoEventoId: e.target.value ? Number(e.target.value) : null, templateId: null })}
            className="w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] focus:border-[#c5a572] focus:outline-none bg-white transition-colors"
          >
            <option value="">— Seleccionar —</option>
            {TIPO_OPTIONS.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Template grid */}
      <div className="mb-5">
        <label className="block text-[.8rem] font-medium mb-2 text-[#2d2926]">
          Template <span className="text-[#dc2626]">*</span>
        </label>

        {state.tipoEventoId === null ? (
          <p className="text-[.82rem] text-[#9ca3af] py-4">
            Seleccioná un tipo de evento para ver los templates disponibles
          </p>
        ) : filteredTemplates.length === 0 ? (
          <p className="text-[.82rem] text-[#9ca3af] py-4">
            No hay templates activos para {TIPO_LABEL[state.tipoEventoId] ?? 'este tipo'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredTemplates.map((t, i) => {
              const selected = state.templateId === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChange({ templateId: t.id })}
                  className={[
                    'rounded-xl overflow-hidden border-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                    selected ? 'border-[#c5a572] shadow-md' : 'border-transparent',
                  ].join(' ')}
                >
                  {/* Preview */}
                  <div
                    className="h-[110px] flex items-center justify-center font-serif text-[.95rem] font-semibold px-3 text-center"
                    style={{
                      background: t.thumbnailUrl ? undefined : GRADIENTS[i % GRADIENTS.length],
                      backgroundImage: t.thumbnailUrl ? `url(${t.thumbnailUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: GRADIENT_TEXT[i % GRADIENT_TEXT.length],
                    }}
                  >
                    {!t.thumbnailUrl && t.nombre}
                  </div>
                  <div className="px-3 py-2 bg-white text-[.78rem] font-medium text-[#2d2926] truncate">
                    {t.nombre}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Título */}
      <div className="mb-6">
        <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
          Título del evento <span className="text-[#dc2626]">*</span>
        </label>
        <input
          type="text"
          maxLength={200}
          placeholder="Ej: Boda de María & Joaquín"
          value={state.titulo}
          onChange={e => onChange({ titulo: e.target.value })}
          className="w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] focus:border-[#c5a572] focus:outline-none transition-colors"
        />
        <div className="flex justify-end mt-0.5">
          <span className="text-[.7rem] text-[#9ca3af]">{state.titulo.length}/200</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t border-[#f0f0f0]">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="px-5 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.88rem] font-medium hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
