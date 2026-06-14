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
      <h2 className="text-lg font-semibold mb-1">Invitados</h2>
      <p className="text-[.82rem] text-[#6b7280] mb-5">
        Opcional: cargá un invitado por fila o usá la carga masiva para personalizar la URL de cada uno.
      </p>

      <GuestListEditor
        guests={state.guests}
        onChange={handleGuestsChange}
        variant="admin"
      />

      {!hasAny && (
        <div className="mt-4 bg-[#f4f5f7] rounded-lg px-4 py-3 text-[.82rem] text-[#6b7280]">
          💡 Sin lista de invitados se generará una <strong>URL genérica</strong> para compartir con todos.
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] font-medium hover:border-[#2d2926] transition-colors">
          ← Anterior
        </button>
        <button type="button" onClick={onNext}
          className="px-5 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.88rem] font-medium hover:bg-[#4a4441] transition-colors">
          Siguiente →
        </button>
      </div>
    </div>
  )
}
