import type { WizardStep5, GuestEntry } from '@/types/crearInvitacion'
import { GuestListEditor } from '@/components/shared/crear-invitacion/GuestListEditor'

interface Props {
  state: WizardStep5
  onChange: (updates: Partial<WizardStep5>) => void
  onNext: () => void
  onPrev: () => void
}

export function Step5Invitados({ state, onChange, onNext, onPrev }: Props) {
  function handleGuestsChange(guests: GuestEntry[]) {
    const guestText = guests
      .filter(g => g.nombre.trim() || g.apellido.trim())
      .map(g => `${g.nombre} ${g.apellido}`.trim())
      .join(', ')
    onChange({ guests, guestText })
  }

  const hasAny = state.guests.some(g => g.nombre.trim() || g.apellido.trim())

  return (
    <div>
      <h2 className="text-xl font-display font-semibold mb-2">Invitados</h2>
      <p className="text-[.84rem] text-[#6b7280] mb-6">
        Opcional: cargá un invitado por fila o usá la carga masiva para personalizar la URL de cada uno.
      </p>

      <GuestListEditor
        guests={state.guests}
        onChange={handleGuestsChange}
        variant="client"
      />

      {!hasAny && (
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
