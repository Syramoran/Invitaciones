import type { WizardStep5, GuestEntry } from '@/types/crearInvitacion'

const PLACEHOLDER_JSON = `[
  { "nombre": "Juan", "apellido": "Pérez" },
  { "nombre": "María", "apellido": "García" }
]`

interface Props {
  state: WizardStep5
  onChange: (updates: Partial<WizardStep5>) => void
  onNext: () => void
  onPrev: () => void
}

function GuestTable({ guests }: { guests: GuestEntry[] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <p className="text-[.82rem] font-medium text-[#2d2926] mb-2">
        {guests.length} invitado{guests.length !== 1 ? 's' : ''} cargado{guests.length !== 1 ? 's' : ''}
      </p>
      <table className="w-full text-[.82rem]">
        <thead>
          <tr className="border-b border-[#e5e7eb]">
            <th className="text-left pb-1.5 pr-3 font-semibold text-[#6b7280] uppercase text-[.68rem] tracking-wide">#</th>
            <th className="text-left pb-1.5 pr-3 font-semibold text-[#6b7280] uppercase text-[.68rem] tracking-wide">Nombre</th>
            <th className="text-left pb-1.5 pr-3 font-semibold text-[#6b7280] uppercase text-[.68rem] tracking-wide">Apellido</th>
            <th className="text-left pb-1.5 font-semibold text-[#6b7280] uppercase text-[.68rem] tracking-wide">URL personalizada</th>
          </tr>
        </thead>
        <tbody>
          {guests.slice(0, 8).map((g, i) => (
            <tr key={i} className="border-b border-[#f0f0f0]">
              <td className="py-2 pr-3 text-[#9ca3af]">{i + 1}</td>
              <td className="py-2 pr-3">{g.nombre}</td>
              <td className="py-2 pr-3">{g.apellido}</td>
              <td className="py-2 font-mono text-[.72rem] text-[#6b7280] truncate max-w-[200px]">
                …/{g.nombre.toLowerCase()}-{g.apellido.toLowerCase()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {guests.length > 8 && (
        <p className="text-[.75rem] text-[#9ca3af] mt-2">
          + {guests.length - 8} invitado{guests.length - 8 !== 1 ? 's' : ''} más…
        </p>
      )}
    </div>
  )
}

export function Step5Invitados({ state, onChange, onNext, onPrev }: Props) {
  function handleToggle(checked: boolean) {
    onChange({ generateGuestUrls: checked })
    if (!checked) onChange({ generateGuestUrls: false, guests: [], parseError: null })
  }

  function handleParseJson() {
    try {
      const parsed = JSON.parse(state.guestJson)
      if (!Array.isArray(parsed)) throw new Error('Debe ser un array JSON')
      const guests: GuestEntry[] = parsed.map((item: Record<string, string>, i: number) => {
        if (!item.nombre || !item.apellido) {
          throw new Error(`Fila ${i + 1}: faltan campos "nombre" o "apellido"`)
        }
        return { nombre: String(item.nombre), apellido: String(item.apellido) }
      })
      onChange({ guests, parseError: null })
    } catch (e) {
      onChange({ guests: [], parseError: (e as Error).message })
    }
  }

  function handleClear() {
    onChange({ guestJson: '', guests: [], parseError: null })
  }

  const canProceed = !state.generateGuestUrls || (state.guests.length > 0 && !state.parseError)

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Invitados</h2>
      <p className="text-[.82rem] text-[#6b7280] mb-5">
        Opcional: cargá la lista de invitados para generar URLs personalizadas con saludo individual.
      </p>

      {/* Toggle */}
      <div className={[
        'flex items-center gap-4 px-4 py-3 rounded-xl border-[1.5px] transition-colors mb-5',
        state.generateGuestUrls ? 'border-[#c5a572] bg-[rgba(197,165,114,.04)]' : 'border-[#f0f0f0] bg-white',
      ].join(' ')}>
        <label className="relative w-11 h-6 shrink-0 cursor-pointer">
          <input
            type="checkbox"
            checked={state.generateGuestUrls}
            onChange={e => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <span className={['absolute inset-0 rounded-full transition-colors cursor-pointer', state.generateGuestUrls ? 'bg-[#c5a572]' : 'bg-[#d1d5db]'].join(' ')} />
          <span className={['absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform', state.generateGuestUrls ? 'translate-x-[22px]' : 'translate-x-[3px]'].join(' ')} />
        </label>
        <div className="flex-1">
          <div className="font-medium text-[.9rem] text-[#2d2926]">Generar URLs personalizadas por invitado</div>
          <div className="text-[.76rem] text-[#6b7280] mt-0.5">
            Cada invitado tendrá su propia URL con su nombre en el saludo
          </div>
        </div>
      </div>

      {/* JSON input section */}
      {state.generateGuestUrls && (
        <div>
          <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
            Lista de invitados (JSON)
          </label>
          <textarea
            rows={7}
            value={state.guestJson}
            onChange={e => onChange({ guestJson: e.target.value, guests: [], parseError: null })}
            placeholder={PLACEHOLDER_JSON}
            className="w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.82rem] font-mono focus:border-[#c5a572] focus:outline-none resize-none transition-colors"
          />
          <p className="text-[.72rem] text-[#6b7280] mt-1 mb-3">
            Formato: <code className="bg-[#f4f5f7] px-1 rounded">{`[{"nombre":"...","apellido":"..."}]`}</code>
          </p>

          {/* Error */}
          {state.parseError && (
            <div className="px-3 py-2 mb-3 bg-[#fee2e2] text-[#dc2626] rounded-lg text-[.8rem]">
              ⚠ {state.parseError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleParseJson}
              disabled={!state.guestJson.trim()}
              className="px-4 py-2 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.82rem] font-medium hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Validar y cargar
            </button>
            {(state.guests.length > 0 || state.guestJson) && (
              <button type="button" onClick={handleClear}
                className="px-4 py-2 border border-[#d1d5db] rounded-lg text-[.82rem] hover:border-[#dc2626] hover:text-[#dc2626] transition-colors">
                Limpiar
              </button>
            )}
          </div>

          {/* Preview table */}
          {state.guests.length > 0 && <GuestTable guests={state.guests} />}
        </div>
      )}

      {!state.generateGuestUrls && (
        <div className="bg-[#f4f5f7] rounded-lg px-4 py-3 text-[.82rem] text-[#6b7280]">
          💡 Sin lista de invitados se generará una <strong>URL genérica</strong> para compartir con todos.
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] font-medium hover:border-[#2d2926] transition-colors">
          ← Anterior
        </button>
        <button type="button" onClick={onNext} disabled={!canProceed}
          className="px-5 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.88rem] font-medium hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Siguiente →
        </button>
      </div>
    </div>
  )
}
