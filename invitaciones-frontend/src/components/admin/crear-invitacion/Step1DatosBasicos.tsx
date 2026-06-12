import { useState } from 'react'
import { Heart, Crown, Cake, Check, Link2, ChevronDown, ChevronUp } from 'lucide-react'
import type { WizardStep1 } from '@/types/crearInvitacion'
import type { Pedido } from '@/types/adminPedido'
import type { Template } from '@/services/templateService'
import { TIPO_LABEL } from '@/services/templateService'
import { TEMPLATE_COLORS, COLORES_PALETA } from '@/types/crearInvitacion'
import { InvitationPreview } from '@/components/landing/InvitationPreview'

// ─── Event type options ───────────────────────────────────────────────────────

const TIPO_OPTIONS = [
  {
    id: 1,
    label: 'Boda',
    icon: Heart,
    description: 'Matrimonios y casamientos',
    bgColor: '#fce4ec',
    iconColor: '#c2185b',
  },
  {
    id: 2,
    label: 'Quinceañera',
    icon: Crown,
    description: 'Celebración de 15 años',
    bgColor: '#f3e5f5',
    iconColor: '#7b1fa2',
  },
  {
    id: 3,
    label: 'Cumpleaños',
    icon: Cake,
    description: 'Fiestas de cumpleaños',
    bgColor: '#fff8e1',
    iconColor: '#f57f17',
  },
] as const

const TITULO_PLACEHOLDERS: Record<number, string> = {
  1: 'Ej: Nos casamos',
  2: 'Ej: Mis quince',
  3: 'Ej: Mi cumple',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  state: WizardStep1
  onChange: (updates: Partial<WizardStep1>) => void
  pedidos: Pedido[]
  templates: Template[]
  onNext: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step1DatosBasicos({ state, onChange, pedidos, templates, onNext }: Props) {
  const [showPedido, setShowPedido] = useState(!!state.pedidoId)

  const filteredTemplates = templates.filter(
    t => t.activo && (state.tipoEventoId === null || t.tipoEventoId === state.tipoEventoId),
  )

  function handlePedidoChange(pedidoId: string) {
    onChange({ pedidoId })
    if (!pedidoId) return
    const p = pedidos.find(x => String(x.id) === pedidoId)
    if (p) onChange({ pedidoId, tipoEventoId: p.tipoEventoId, templateId: p.templateId })
  }

  function handleTipoChange(tipoEventoId: number) {
    if (tipoEventoId === state.tipoEventoId) return
    onChange({ tipoEventoId, templateId: null })
  }

  const canProceed =
    state.tipoEventoId !== null &&
    state.templateId !== null &&
    state.titulo.trim().length > 0

  const linkedPedido = pedidos.find(p => String(p.id) === state.pedidoId)

  return (
    <div>
      {/* Step header */}
      <div className="mb-7">
        <h2 className="text-xl font-semibold text-[#2d2926]">Tipo de evento y diseño</h2>
        <p className="text-[.84rem] text-[#6b7280] mt-1">
          Elegí la categoría de celebración, el diseño de la invitación y completá el título.
        </p>
      </div>

      {/* ── Pedido asociado (collapsible utility) ── */}
      {pedidos.length > 0 && (
        <div className="mb-7 rounded-xl border border-[#e5e7eb] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPedido(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Link2 className="w-4 h-4 text-[#6b7280] shrink-0" />
              <span className="text-[.84rem] font-medium text-[#2d2926]">Vincular a un pedido</span>
              {linkedPedido && (
                <span className="text-[.7rem] px-2 py-0.5 bg-[#c5a572]/15 text-[#9e7f4e] rounded-full font-semibold">
                  PED-{String(linkedPedido.id).padStart(3, '0')} · {linkedPedido.nombreCliente}
                </span>
              )}
            </div>
            {showPedido
              ? <ChevronUp className="w-4 h-4 text-[#9ca3af] shrink-0" />
              : <ChevronDown className="w-4 h-4 text-[#9ca3af] shrink-0" />}
          </button>

          {showPedido && (
            <div className="px-4 py-3.5 bg-white border-t border-[#f0f0f0]">
              <p className="text-[.75rem] text-[#6b7280] mb-2">
                Al vincular un pedido se precargan tipo, diseño y servicios automáticamente.
              </p>
              <select
                value={state.pedidoId}
                onChange={e => handlePedidoChange(e.target.value)}
                className="w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] focus:border-[#c5a572] focus:outline-none bg-white transition-colors"
              >
                <option value="">— Sin pedido asociado —</option>
                {pedidos.map(p => (
                  <option key={p.id} value={String(p.id)}>
                    PED-{String(p.id).padStart(3, '0')} · {p.nombreCliente} · {p.tipoEventoNombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ── Tipo de evento ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[.78rem] font-semibold uppercase tracking-widest text-[#6b7280]">Tipo de evento</span>
          <span className="text-[#dc2626] text-sm leading-none">*</span>
        </div>
        <p className="text-[.76rem] text-[#9ca3af] mb-3">Seleccioná el tipo de celebración para filtrar los diseños disponibles</p>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {TIPO_OPTIONS.map(tipo => {
            const Icon = tipo.icon
            const isSelected = state.tipoEventoId === tipo.id

            return (
              <button
                key={tipo.id}
                type="button"
                onClick={() => handleTipoChange(tipo.id)}
                className={[
                  'relative flex flex-col items-center gap-2.5 sm:gap-3 px-2 py-4 sm:p-5 rounded-2xl border-2 transition-all duration-200',
                  isSelected
                    ? 'border-[#c5a572] bg-[#c5a572]/6 shadow-md'
                    : 'border-[#e5e7eb] bg-white hover:border-[#c5a572]/50 hover:shadow-sm hover:-translate-y-0.5',
                ].join(' ')}
              >
                {/* Selected badge */}
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-[#c5a572] rounded-full flex items-center justify-center shadow">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}

                {/* Icon */}
                <div
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: tipo.bgColor }}
                >
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: tipo.iconColor }} />
                </div>

                {/* Label */}
                <div className="text-center">
                  <div className={[
                    'font-semibold text-[.88rem] sm:text-[.95rem] leading-tight',
                    isSelected ? 'text-[#2d2926]' : 'text-[#4a4441]',
                  ].join(' ')}>
                    {tipo.label}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Template gallery ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[.78rem] font-semibold uppercase tracking-widest text-[#6b7280]">Diseño de invitación</span>
          <span className="text-[#dc2626] text-sm leading-none">*</span>
        </div>
        <p className="text-[.76rem] text-[#9ca3af] mb-3">
          {state.tipoEventoId === null
            ? 'Seleccioná primero el tipo de evento'
            : `${filteredTemplates.length} diseño${filteredTemplates.length !== 1 ? 's' : ''} disponible${filteredTemplates.length !== 1 ? 's' : ''} para ${TIPO_LABEL[state.tipoEventoId] ?? 'este tipo'}`}
        </p>

        {state.tipoEventoId === null ? (
          <div className="flex flex-col items-center justify-center py-14 rounded-2xl border-2 border-dashed border-[#e5e7eb] bg-[#fafafa]">
            <div className="w-14 h-14 rounded-2xl bg-[#f0ede8] flex items-center justify-center mb-3">
              <span className="text-2xl">🎨</span>
            </div>
            <p className="text-[.86rem] text-[#9ca3af]">Elegí un tipo de evento para ver los diseños</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-10 text-center rounded-2xl border border-[#f0f0f0] bg-[#fafafa]">
            <p className="text-[.84rem] text-[#9ca3af]">
              No hay diseños activos para {TIPO_LABEL[state.tipoEventoId] ?? 'este tipo'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredTemplates.map((t) => {
              const selected = state.templateId === t.id

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChange({ templateId: t.id })}
                  className={[
                    'group relative rounded-2xl overflow-hidden text-left transition-all duration-200',
                    selected
                      ? 'ring-2 ring-[#c5a572] ring-offset-2 shadow-lg'
                      : 'ring-1 ring-[#e5e7eb] hover:ring-[#c5a572]/60 hover:shadow-md hover:-translate-y-0.5',
                  ].join(' ')}
                >
                  {/* Portrait preview area */}
                  <div className="w-full h-64 relative overflow-hidden bg-[#f5f5f5]">
                    <InvitationPreview
                      slug={t.slug}
                      interactive={false}
                      paused={true}
                    />

                    {/* Hover overlay */}
                    {!selected && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
                    )}

                    {/* Selected overlay */}
                    {selected && (
                      <div className="absolute inset-0 bg-[#c5a572]/25 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 bg-[#c5a572] rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Name footer */}
                  <div className={[
                    'px-3 py-2.5 transition-colors',
                    selected ? 'bg-[#c5a572]/10' : 'bg-white',
                  ].join(' ')}>
                    <p className={[
                      'text-[.78rem] font-semibold truncate',
                      selected ? 'text-[#9e7f4e]' : 'text-[#2d2926]',
                    ].join(' ')}>
                      {t.nombre}
                    </p>
                    {t.descripcion && (
                      <p className="text-[.68rem] text-[#9ca3af] mt-0.5 truncate">{t.descripcion}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Color primario (si se seleccionó tipo y template) ── */}
      {state.tipoEventoId && state.templateId && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[.78rem] font-semibold uppercase tracking-widest text-[#6b7280]">Color primario</span>
          </div>
          <p className="text-[.76rem] text-[#9ca3af] mb-3">
            Personaliza el color de la invitación. Servirá como color temático principal.
          </p>
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
            <div className="flex flex-wrap gap-2.5">
              {/* Swatch predeterminado */}
              <button
                type="button"
                title="Predeterminado (según diseño)"
                onClick={() => onChange({ colorPrimario: '' })}
                className="relative w-9 h-9 rounded-full border-2 transition-all duration-150 hover:scale-110 bg-white overflow-hidden"
                style={{
                  borderColor: state.colorPrimario === '' ? '#9ca3af' : '#e5e7eb',
                  boxShadow: state.colorPrimario === '' ? '0 0 0 2px white, 0 0 0 4px #9ca3af' : 'none',
                }}
              >
                <span
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, transparent calc(50% - 1.5px), #dc2626 calc(50% - 1.5px), #dc2626 calc(50% + 1.5px), transparent calc(50% + 1.5px))',
                  }}
                />
                {state.colorPrimario === '' && <Check className="w-3 h-3 absolute inset-0 m-auto text-gray-600 drop-shadow" />}
              </button>
              {/* Paleta de colores */}
              {(() => {
                const template = templates.find(t => t.id === state.templateId)
                const paleta = template && template.slug && TEMPLATE_COLORS[template.slug]
                  ? (TEMPLATE_COLORS[template.slug] as { hex: string; label: string }[])
                  : (COLORES_PALETA as unknown as { hex: string; label: string }[])
                return paleta.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    onClick={() => onChange({ colorPrimario: c.hex })}
                    className="relative w-9 h-9 rounded-full border-2 transition-all duration-150 hover:scale-110"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: state.colorPrimario?.toLowerCase() === c.hex.toLowerCase() ? c.hex : 'transparent',
                      boxShadow: state.colorPrimario?.toLowerCase() === c.hex.toLowerCase()
                        ? `0 0 0 2px white, 0 0 0 4px ${c.hex}`
                        : 'none',
                    }}
                  >
                    {state.colorPrimario?.toLowerCase() === c.hex.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 absolute inset-0 m-auto drop-shadow text-white" />
                    )}
                  </button>
                ))
              })()}
            </div>
            <p className="mt-2.5 text-[.75rem] text-[#9ca3af]">
              {state.colorPrimario === '' ? 'Predeterminado (según diseño)' : `Color: ${state.colorPrimario}`}
            </p>
          </div>
        </div>
      )}

      {/* ── Título ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[.78rem] font-semibold uppercase tracking-widest text-[#6b7280]">Título del evento</span>
          <span className="text-[#dc2626] text-sm leading-none">*</span>
        </div>
        <p className="text-[.76rem] text-[#9ca3af] mb-2">
          Aparece en el encabezado de la invitación tal cual lo escribís aquí.
        </p>
        <input
          type="text"
          maxLength={200}
          placeholder={
            state.tipoEventoId ? TITULO_PLACEHOLDERS[state.tipoEventoId] ?? 'Ej: Celebración de María y Juan'
              : 'Ej: Boda de Camila & Joaquín'
          }
          value={state.titulo}
          onChange={e => onChange({ titulo: e.target.value })}
          className="w-full px-4 py-3 border-[1.5px] border-[#d1d5db] rounded-xl text-[.9rem] focus:border-[#c5a572] focus:outline-none transition-colors placeholder:text-[#b0b7c3]"
        />
        <div className="flex justify-end mt-1">
          <span className="text-[.7rem] text-[#b0b7c3]">{state.titulo.length}/200</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
        <div className="text-[.78rem] text-[#9ca3af]">
          {!state.tipoEventoId && 'Seleccioná el tipo de evento'}
          {state.tipoEventoId && !state.templateId && 'Seleccioná un diseño'}
          {state.tipoEventoId && state.templateId && !state.titulo.trim() && 'Completá el título'}
          {canProceed && <span className="text-[#16a34a] font-medium">✓ Listo para continuar</span>}
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-xl text-[.88rem] font-semibold hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
