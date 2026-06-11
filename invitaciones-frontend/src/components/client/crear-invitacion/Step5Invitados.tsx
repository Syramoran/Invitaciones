import type { WizardStep5, GuestEntry } from '@/types/crearInvitacion'

const PLACEHOLDER_TEXT = 'Juan Pérez, Familia García, Sofía, Martín y Laura'

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
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            const csvContent = "Nombre,URL Personalizada\n" + guests.map(g => {
              const url = `https://festeja.com.ar/INVITACION_ID?guest=${encodeURIComponent(g.nombre)}`
              return `"${g.nombre}","${url}"`
            }).join("\n")
            
            const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'invitados_festeja.csv')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }}
          className="px-4 py-2 bg-[#16a34a] text-white rounded-lg text-[.82rem] font-medium hover:bg-[#15803d] transition-colors"
        >
          Descargar Excel (CSV)
        </button>
      </div>
    </div>
  )
}

export function Step5Invitados({ state, onChange, onNext, onPrev }: Props) {
  function handleToggle(checked: boolean) {
    onChange({ generateGuestUrls: checked })
    if (!checked) onChange({ generateGuestUrls: false, guests: [], parseError: null })
  }

  function handleParseText() {
    try {
      if (!state.guestText.trim()) throw new Error('Ingresá al menos un nombre')
      
      const names = state.guestText.split(',').map(n => n.trim()).filter(n => n.length > 0)
      if (names.length === 0) throw new Error('No se encontraron nombres válidos')
      
      const guests: GuestEntry[] = names.map((name) => {
        // Asignar todo a "nombre" ya que es un string libre, o separar por espacio
        return { nombre: name, apellido: '' }
      })
      onChange({ guests, parseError: null })
    } catch (e) {
      onChange({ guests: [], parseError: (e as Error).message })
    }
  }

  function handleClear() {
    onChange({ guestText: '', guests: [], parseError: null })
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

      {/* Text input section */}
      {state.generateGuestUrls && (
        <div>
          <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
            Nombres de invitados separados por coma
          </label>
          <textarea
            rows={5}
            value={state.guestText}
            onChange={e => onChange({ guestText: e.target.value, guests: [], parseError: null })}
            placeholder={PLACEHOLDER_TEXT}
            className="w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.82rem] focus:border-[#c5a572] focus:outline-none resize-none transition-colors"
          />
          <p className="text-[.72rem] text-[#6b7280] mt-1 mb-3">
            Escribí o pegá los nombres separados por una coma ( , )
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
              onClick={handleParseText}
              disabled={!state.guestText.trim()}
              className="px-4 py-2 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.82rem] font-medium hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Procesar lista
            </button>
            {(state.guests.length > 0 || state.guestText) && (
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
