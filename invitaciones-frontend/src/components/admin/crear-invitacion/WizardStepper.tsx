// Horizontal tab-style progress indicator for multi-step wizards.
// Completed steps show a checkmark and are clickable to navigate back.

export interface StepDef {
  num: number
  label: string
}

const DEFAULT_STEPS: StepDef[] = [
  { num: 1, label: 'Template' },
  { num: 2, label: 'Evento' },
  { num: 3, label: 'Servicios' },
  { num: 4, label: 'Contenido' },
  { num: 5, label: 'Invitados' },
  { num: 6, label: 'Revisar' },
]

interface Props {
  current: number
  onGoBack: (step: number) => void
  steps?: StepDef[]
}

export function WizardStepper({ current, onGoBack, steps = DEFAULT_STEPS }: Props) {
  return (
    <div className="flex items-end gap-0 overflow-x-auto pb-px mb-8 border-b border-[#e5e7eb]">
      {steps.map((step) => {
        const isDone   = step.num < current
        const isActive = step.num === current

        return (
          <button
            key={step.num}
            type="button"
            onClick={() => isDone && onGoBack(step.num)}
            disabled={!isDone}
            title={isDone ? `Volver a ${step.label}` : undefined}
            className={[
              'flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 whitespace-nowrap text-[.75rem] sm:text-[.82rem] border-b-2 -mb-px transition-all duration-200',
              isActive  ? 'text-[#2d2926] font-semibold border-[#c5a572]'
              : isDone  ? 'text-[#16a34a] font-semibold border-[#16a34a]/50 hover:border-[#16a34a] cursor-pointer'
              :           'text-[#9ca3af] border-transparent cursor-default',
            ].join(' ')}
          >
            <span className={[
              'w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[.65rem] sm:text-[.7rem] font-bold border-[1.5px] shrink-0 transition-colors',
              isActive ? 'bg-[#c5a572] border-[#c5a572] text-white'
              : isDone ? 'bg-[#16a34a] border-[#16a34a] text-white'
              :          'border-[#d1d5db] text-[#9ca3af]',
            ].join(' ')}>
              {isDone ? '✓' : step.num}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </button>
        )
      })}
    </div>
  )
}
