import type { WizardStep1 } from '@/types/crearInvitacion'
import { TEMPLATE_COLORS, COLORES_PALETA, DARK_CHECKMARK_SLUGS } from '@/types/crearInvitacion'
import type { Template } from '@/services/templateService'
import type { Pedido } from '@/types/adminPedido'
import { Check } from 'lucide-react'
import { getEventConfig } from '@/config/eventoConfig'
import { InvitationPreview } from '@/components/landing/InvitationPreview'


interface Props {
  state: WizardStep1
  onChange: (updates: Partial<WizardStep1>) => void
  templates: Template[]
  pedidos?: Pedido[]
  onNext: () => void
  isPaid?: boolean
}

export function Step1DatosBasicos({ state, onChange, templates, pedidos, onNext, isPaid }: Props) {
  const filteredTemplates = templates.filter(
    t => t.activo && (state.tipoEventoId === null || t.tipoEventoId === state.tipoEventoId),
  )

  const availableTipoEventosIds = Array.from(new Set(templates.filter(t => t.activo).map(t => t.tipoEventoId)))
  const tipoOptions = availableTipoEventosIds.map(id => getEventConfig(id))

  const currentConfig = getEventConfig(state.tipoEventoId)

  const canProceed = state.tipoEventoId !== null && state.templateId !== null && state.titulo.trim().length > 0

  function handlePedidoChange(pedidoId: string) {
    onChange({ pedidoId })
    if (!pedidoId) return
    const p = pedidos?.find(x => String(x.id) === pedidoId)
    if (p) onChange({ pedidoId, tipoEventoId: p.tipoEventoId, templateId: p.templateId })
  }

  return (
    <div>
      <h2 className="text-xl font-display font-semibold mb-6">Datos de tu evento</h2>

      {pedidos && pedidos.length > 0 && (
        <div className="mb-6">
          <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
            Pedido asociado <span className="text-[#9ca3af] font-normal">(opcional)</span>
          </label>
          <select
            value={state.pedidoId || ''}
            onChange={e => handlePedidoChange(e.target.value)}
            className="w-full max-w-2xl px-3.5 py-3 border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] focus:border-[#c5a572] focus:ring-0 focus:outline-none bg-white transition-colors"
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
      )}

      {/* Tipo de evento */}
      <div className="mb-6">
        <label className="block text-[.8rem] font-medium mb-3 text-[#2d2926]">
          Tipo de evento <span className="text-[#dc2626]">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
          {tipoOptions.map(t => {
            const Icon = t.icon
            const isSelected = state.tipoEventoId === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { if (!isPaid) onChange({ tipoEventoId: t.id, templateId: null, colorPrimario: '' }) }}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${isSelected
                    ? 'border-[#c5a572] bg-[#c5a572]/5 text-[#c5a572] shadow-sm'
                    : isPaid ? 'border-[#e5e7eb] bg-gray-50 text-[#9ca3af] opacity-60 cursor-not-allowed' : 'border-[#e5e7eb] bg-white text-[#6b7280] hover:border-[#c5a572]/50 hover:bg-[#fafafa]'
                  }`}
              >
                <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-[#c5a572]' : 'text-[#9ca3af]'}`} />
                <span className={`text-[.9rem] font-medium ${isSelected ? 'text-[#2d2926]' : ''}`}>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Título y Nombres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mb-8">
        <div className={currentConfig.nombresType === 'novios' ? 'sm:col-span-2' : ''}>
          <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
            Título de la invitación <span className="text-[#dc2626]">*</span>
          </label>
          <input
            type="text"
            maxLength={200}
            placeholder="Titulo"
            value={state.titulo}
            onChange={e => onChange({ titulo: e.target.value })}
            className="w-full px-3.5 py-3 border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] focus:border-[#c5a572] focus:outline-none transition-colors"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[.72rem] text-[#6b7280]">Título principal visible.</span>
            <span className="text-[.7rem] text-[#9ca3af]">{state.titulo.length}/200</span>
          </div>
        </div>

        {/* Nombres */}
        {currentConfig.nombresType === 'novios' && (
          <>
            <div>
              <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
                Nombre novio/a 1 <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder="Ej: Camila"
                value={state.nombreNovio1 || ''}
                onChange={e => onChange({ nombreNovio1: e.target.value })}
                className="w-full px-3.5 py-3 border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] focus:border-[#c5a572] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
                Nombre novio/a 2 <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder="Ej: Joaquín"
                value={state.nombreNovio2 || ''}
                onChange={e => onChange({ nombreNovio2: e.target.value })}
                className="w-full px-3.5 py-3 border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] focus:border-[#c5a572] focus:outline-none transition-colors"
              />
            </div>
          </>
        )}
        {currentConfig.nombresType === 'homenajeado' && (
          <div>
            <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
              Nombre homenajeado/a <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="text"
              maxLength={100}
              placeholder="Ej: Sofi"
              value={state.nombreHomenajeados || ''}
              onChange={e => onChange({ nombreHomenajeados: e.target.value })}
              className="w-full px-3.5 py-3 border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] focus:border-[#c5a572] focus:outline-none transition-colors"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[.72rem] text-[#6b7280]">Aparecerá bajo el título.</span>
            </div>
          </div>
        )}
      </div>

      {/* Template grid */}
      <div className="mb-8">
        <label className="block text-[.8rem] font-medium mb-3 text-[#2d2926]">
          Elegí el diseño (Plantilla) <span className="text-[#dc2626]">*</span>
          {isPaid && <span className="ml-2 text-[.75rem] text-yellow-600 font-normal bg-yellow-50 px-2 py-0.5 rounded">No se puede cambiar porque la invitación está activa</span>}
        </label>

        {state.tipoEventoId === null ? (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center text-[#6b7280] text-sm">
            Seleccioná primero un tipo de evento para ver los diseños disponibles.
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center text-[#6b7280] text-sm">
            No hay diseños disponibles para {currentConfig.label ?? 'este tipo de evento'}.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredTemplates.map((t) => {
              const selected = state.templateId === t.id
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => { if (!isPaid) onChange({ templateId: t.id, colorPrimario: '' }) }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (!isPaid) onChange({ templateId: t.id, colorPrimario: '' }) } }}
                  className={[
                    'rounded-xl overflow-hidden border-2 text-left transition-all bg-white focus:outline-none',
                    selected ? 'border-[#c5a572] shadow-md ring-2 ring-[#c5a572]/20' : isPaid ? 'border-transparent border-gray-200 opacity-60 cursor-not-allowed' : 'border-transparent border-gray-200 hover:-translate-y-1 hover:shadow-md cursor-pointer',
                  ].join(' ')}
                >
                  {/* Preview */}
                  <div className="aspect-[9/16] w-full relative overflow-hidden bg-gray-50 border-b border-gray-100">
                    <div className="absolute inset-0 pointer-events-none">
                      <InvitationPreview
                        slug={t.slug}
                        color={selected && state.colorPrimario ? state.colorPrimario : undefined}
                        interactive={false}
                        paused={!selected}
                      />
                    </div>
                    {/* Block clicks — prevents Router Links inside InvitationPreview from navigating */}
                    <div className="absolute inset-0" />
                  </div>
                  <div className="px-3 py-2.5 text-sm font-medium text-[#2d2926] text-center border-t border-gray-100 truncate">
                    {t.nombre}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Color Picker (solo si hay template seleccionado) */}
      {state.templateId !== null && (() => {
        const template = templates.find(t => t.id === state.templateId)
        const slug = template?.slug ?? ''
        const paleta = TEMPLATE_COLORS[slug] || COLORES_PALETA
        const etiqueta = paleta.find(c => c.hex.toLowerCase() === (state.colorPrimario || '').toLowerCase())?.label ?? state.colorPrimario

        return (
          <div className="mb-8">
            <label className="block text-[.8rem] font-medium mb-3 text-[#2d2926]">
              Color principal del diseño
            </label>
            <div className="flex flex-wrap gap-2">
              {(!TEMPLATE_COLORS[slug]) && (
                <button
                  type="button"
                  title="Predeterminado"
                  onClick={() => onChange({ colorPrimario: '' })}
                  className="relative w-10 h-10 rounded-full border-2 transition-all duration-150 hover:scale-110 bg-white overflow-hidden"
                  style={{
                    borderColor: state.colorPrimario === '' ? '#9ca3af' : 'transparent',
                    boxShadow: state.colorPrimario === '' ? '0 0 0 2px white, 0 0 0 4px #9ca3af' : 'none',
                  }}
                >
                  <span className="absolute inset-0" style={{ background: 'linear-gradient(135deg, transparent calc(50% - 1px), #dc2626 calc(50% - 1px), #dc2626 calc(50% + 1px), transparent calc(50% + 1px))' }} />
                  {state.colorPrimario === '' && (
                    <Check className="w-4 h-4 absolute inset-0 m-auto text-gray-500 drop-shadow" />
                  )}
                </button>
              )}
              {paleta.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.label}
                  onClick={() => onChange({ colorPrimario: c.hex })}
                  className="relative w-10 h-10 rounded-full border-2 transition-all duration-150 hover:scale-110"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: state.colorPrimario?.toLowerCase() === c.hex.toLowerCase() ? c.hex : 'transparent',
                    boxShadow: state.colorPrimario?.toLowerCase() === c.hex.toLowerCase() ? `0 0 0 2px white, 0 0 0 4px ${c.hex}` : 'none',
                  }}
                >
                  {state.colorPrimario?.toLowerCase() === c.hex.toLowerCase() && (
                    <Check className="w-4 h-4 absolute inset-0 m-auto drop-shadow text-white" style={{ color: DARK_CHECKMARK_SLUGS.includes(slug) ? '#555' : 'white' }} />
                  )}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[.8rem] text-[#6b7280]">
              {state.colorPrimario === '' ? 'Predeterminado (según plantilla)' : etiqueta}
            </p>
          </div>
        )
      })()}

      {/* Navigation */}
      <div className="flex justify-end pt-6 border-t border-[#f0f0f0]">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="px-8 py-3 bg-[#2d2926] text-white rounded-full text-[.95rem] font-medium hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
