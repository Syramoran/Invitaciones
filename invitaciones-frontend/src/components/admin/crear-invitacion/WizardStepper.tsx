// Horizontal progress indicator for multi-step wizards.
// Completed steps show a checkmark and are clickable to navigate back.

import { Fragment } from 'react'
import { Check } from 'lucide-react'

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
    <div className="mb-10 px-1 overflow-x-auto">
      <div className="flex items-start min-w-max">
        {steps.map((step, i) => {
          const isDone   = step.num < current
          const isActive = step.num === current

          return (
            <Fragment key={step.num}>
              {/* Step circle + label */}
              <div className="flex flex-col items-center shrink-0">
                <button
                  type="button"
                  onClick={() => isDone && onGoBack(step.num)}
                  disabled={!isDone}
                  title={isDone ? `Volver a ${step.label}` : undefined}
                  className={[
                    'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[.7rem] sm:text-[.78rem] font-bold border-2 transition-all duration-200',
                    isActive
                      ? 'bg-[#c5a572] border-[#c5a572] text-white shadow-[0_0_0_4px_rgba(197,165,114,.18)]'
                      : isDone
                        ? 'bg-[#2d2926] border-[#2d2926] text-white cursor-pointer hover:bg-[#4a4441] hover:scale-105'
                        : 'bg-white border-[#d1d5db] text-[#b0b7c3]',
                  ].join(' ')}
                >
                  {isDone ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : step.num}
                </button>
                <span
                  className={[
                    'mt-1 sm:mt-1.5 text-[.6rem] sm:text-[.67rem] font-medium text-center leading-tight hidden sm:block w-[48px] sm:w-[52px]',
                    isActive ? 'text-[#2d2926] font-semibold' : isDone ? 'text-[#6b7280]' : 'text-[#b0b7c3]',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="flex-1 mt-3 sm:mt-4 mx-0.5 sm:mx-1 sm:mx-1.5 relative h-[2px] bg-[#e5e7eb] rounded-full overflow-hidden self-start min-w-[8px] sm:min-w-[12px]">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#2d2926] rounded-full transition-all duration-500"
                    style={{ width: isDone ? '100%' : '0%' }}
                  />
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
