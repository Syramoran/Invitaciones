// Horizontal 6-step progress indicator for the "Crear Invitación" wizard.
// Completed steps are clickable (navigate back); future steps are disabled.

const STEPS = [
  { num: 1, label: 'Datos Básicos' },
  { num: 2, label: 'Evento' },
  { num: 3, label: 'Servicios' },
  { num: 4, label: 'Contenido' },
  { num: 5, label: 'Invitados' },
  { num: 6, label: 'Revisar' },
] as const

interface Props {
  current: number
  onGoBack: (step: number) => void
}

export function WizardStepper({ current, onGoBack }: Props) {
  return (
    <div className="flex items-end gap-0 overflow-x-auto pb-1 mb-8 border-b border-[#e5e7eb]">
      {STEPS.map((step, i) => {
        const isDone   = step.num < current
        const isActive = step.num === current

        return (
          <div key={step.num} className="flex items-center">
            <button
              type="button"
              onClick={() => isDone && onGoBack(step.num)}
              disabled={!isDone}
              className={[
                'flex items-center gap-2 px-3 py-2.5 whitespace-nowrap text-[.82rem] border-b-2 -mb-px transition-colors',
                isActive
                  ? 'text-[#2d2926] font-semibold border-[#c5a572]'
                  : isDone
                    ? 'text-[#16a34a] border-transparent hover:border-[#16a34a]/40 cursor-pointer'
                    : 'text-[#9ca3af] border-transparent cursor-default',
              ].join(' ')}
            >
              {/* Circle */}
              <span
                className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-[.7rem] font-semibold border-[1.5px] shrink-0 transition-colors',
                  isActive
                    ? 'bg-[#c5a572] border-[#c5a572] text-white'
                    : isDone
                      ? 'bg-[#16a34a] border-[#16a34a] text-white'
                      : 'border-[#d1d5db] text-[#9ca3af]',
                ].join(' ')}
              >
                {isDone ? '✓' : step.num}
              </span>

              {/* Label */}
              <span className="hidden sm:inline">{step.label}</span>
            </button>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className="w-5 h-px bg-[#e5e7eb] shrink-0 mx-0.5 mb-0.5" />
            )}
          </div>
        )
      })}
    </div>
  )
}
