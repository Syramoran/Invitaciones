import { Check } from 'lucide-react'
import { STEP_LABELS } from './data'

interface Props {
  step: number
  goToStep: (n: number) => void
}

export function SolicitarStepper({ step, goToStep }: Props) {
  return (
    <div className="bg-white border-b border-black/[0.05] py-5 sticky top-[57px] z-40">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-[18px] left-[18px] right-[18px] h-[2px] bg-champagne-dark" />
          <div
            className="absolute top-[18px] left-[18px] h-[2px] bg-gold transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / (STEP_LABELS.length - 1)) * 100}%` }}
          />
          {STEP_LABELS.map((label, i) => {
            const n = i + 1
            const isDone   = n < step
            const isActive = n === step
            return (
              <button
                key={n}
                onClick={() => goToStep(n)}
                disabled={n >= step}
                className="flex flex-col items-center gap-1.5 relative z-10 disabled:cursor-default"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                  isDone   ? 'bg-[#6a9e6a] border-[#6a9e6a] text-white' :
                  isActive ? 'bg-gold border-gold text-white' :
                             'bg-white border-champagne-dark text-warm-gray-light'
                }`}>
                  {isDone ? <Check className="w-4 h-4" /> : n}
                </div>
                <span className={`text-[0.65rem] hidden sm:block transition-colors ${
                  isActive ? 'text-charcoal font-medium' : isDone ? 'text-[#6a9e6a]' : 'text-warm-gray-light'
                }`}>{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
