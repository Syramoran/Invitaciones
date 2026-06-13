import type { WizardStep5, GuestEntry } from '@/types/crearInvitacion'

interface Props {
  state: WizardStep5
  onChange: (updates: Partial<WizardStep5>) => void
  onNext: () => void
  onPrev: () => void
}

function parseGuests(text: string): GuestEntry[] {
  return text
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(name => {
      const parts = name.split(/\s+/)
      return { nombre: parts[0], apellido: parts.slice(1).join(' ') }
    })
}

export function Step5Invitados({ state, onChange, onNext, onPrev }: Props) {
  function handleChange(text: string) {
    onChange({ guestText: text, guests: parseGuests(text) })
  }

  return (
    <div>
      <h2 className="text-xl font-display font-semibold mb-2">Invitados</h2>
      <p className="text-[.84rem] text-[#6b7280] mb-6">
        Opcional: ingresá los nombres separados por coma para personalizar la URL de cada invitado.
      </p>

      <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
        Lista de invitados
      </label>
      <textarea
        rows={5}
        value={state.guestText}
        onChange={e => handleChange(e.target.value)}
        placeholder="Juan Pérez, María García, Carlos López"
        className="w-full px-3.5 py-3 border-[1.5px] border-[#d1d5db] rounded-xl text-[.9rem] focus:border-[#c5a572] focus:outline-none resize-none transition-colors"
      />
      <p className="text-[.75rem] text-[#6b7280] mt-1.5">
        Escribí los nombres separados por comas. Cada invitado recibirá su propia URL personalizada.
      </p>

      {state.guests.length > 0 && (
        <p className="mt-3 text-[.84rem] text-[#16a34a] font-medium">
          ✓ {state.guests.length} invitado{state.guests.length !== 1 ? 's' : ''} cargado{state.guests.length !== 1 ? 's' : ''}
        </p>
      )}

      {!state.guestText.trim() && (
        <div className="mt-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-4 py-3 text-[.84rem] text-[#6b7280]">
          💡 Sin lista de invitados se generará una <strong>URL genérica</strong> para compartir con todos.
        </div>
      )}

      <div className="flex justify-between mt-8 pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev}
          className="px-6 py-2.5 border-[1.5px] border-[#d1d5db] rounded-full text-[.95rem] font-medium hover:bg-gray-50 transition-colors">
          ← Anterior
        </button>
        <button type="button" onClick={onNext}
          className="px-8 py-3 bg-[#2d2926] text-white rounded-full text-[.95rem] font-medium hover:bg-[#4a4441] transition-colors">
          Siguiente →
        </button>
      </div>
    </div>
  )
}
