import { Pencil, AlertCircle } from 'lucide-react'
import type { WizardFormState } from '@/types/crearInvitacion'
import type { Template } from '@/services/templateService'
import { TIPO_LABEL } from '@/services/templateService'
import { validateWizardPayload } from '@/utils/wizardValidation'

interface Props {
  formState: WizardFormState
  templates: Template[]
  onNext: () => void
  onPrev: () => void
  onGoTo: (step: number) => void
}

function Row({ label, value, step, onGoTo }: {
  label: string
  value: React.ReactNode
  step: number
  onGoTo: (s: number) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[#f0f0f0] last:border-0">
      <span className="text-[.82rem] text-[#6b7280] shrink-0 w-28">{label}</span>
      <span className="text-[.88rem] text-[#2d2926] font-medium flex-1">{value ?? '—'}</span>
      <button
        type="button"
        onClick={() => onGoTo(step)}
        className="flex items-center gap-1 text-[.72rem] text-[#c5a572] hover:text-[#9e7f4e] font-medium transition-colors shrink-0"
      >
        <Pencil className="w-3 h-3" /> Editar
      </button>
    </div>
  )
}

export function Step6Revisar({ formState, templates, onNext, onPrev, onGoTo }: Props) {
  const { step1, step2, step3, step5 } = formState
  const tpl = templates.find(t => t.id === step1.templateId)
  const tipoNom = step1.tipoEventoId ? (TIPO_LABEL[step1.tipoEventoId] ?? '—') : '—'
  const enabledServices = step3.servicios.filter(s => s.enabled)
  const esMultiple = step2.ubicacion === 'multiple'

  const { isValid, errors } = validateWizardPayload(formState)

  // Group errors by step for display
  const errorsByStep = errors.reduce<Record<number, { stepLabel: string; messages: string[] }>>(
    (acc, err) => {
      if (!acc[err.step]) acc[err.step] = { stepLabel: err.stepLabel, messages: [] }
      acc[err.step].messages.push(err.message)
      return acc
    },
    {},
  )

  return (
    <div>
      <h2 className="text-xl font-display font-semibold mb-2">Revisión</h2>
      <p className="text-[.84rem] text-[#6b7280] mb-6">
        Revisá los detalles de tu invitación antes de proceder al pago.
      </p>

      <div className="bg-[#fcfaf8] border border-[#f3f0ea] rounded-2xl p-5">
        <Row label="Tipo de evento" value={tipoNom} step={1} onGoTo={onGoTo} />
        <Row label="Diseño"         value={tpl?.nombre ?? '—'} step={1} onGoTo={onGoTo} />
        <Row label="Título"         value={step1.titulo || '—'} step={1} onGoTo={onGoTo} />
        <Row
          label="Fecha"
          value={step2.fechaEvento
            ? new Date(step2.fechaEvento + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
            : '—'}
          step={2}
          onGoTo={onGoTo}
        />
        <Row
          label="Lugar"
          value={esMultiple
            ? (
              <span className="flex flex-col gap-1">
                {step2.ubicaciones.length === 0
                  ? '—'
                  : step2.ubicaciones.map((u, i) => (
                    <span key={i}>
                      <span className="text-[#9ca3af] text-[.75rem] uppercase tracking-wide mr-1">{u.tipo}</span>
                      {u.nombre}{u.direccion ? ` · ${u.direccion}` : ''}
                    </span>
                  ))}
              </span>
            )
            : step2.ubicacion || '—'}
          step={2}
          onGoTo={onGoTo}
        />
        <Row
          label="Servicios"
          value={enabledServices.length > 0
            ? enabledServices.map(s => s.nombre).join(', ')
            : 'Sin servicios adicionales'}
          step={3}
          onGoTo={onGoTo}
        />
        <Row
          label="Invitados"
          value={step5.guests.length > 0
            ? `${step5.guests.length} invitado${step5.guests.length !== 1 ? 's' : ''} con URL personalizada`
            : 'URL genérica'}
          step={5}
          onGoTo={onGoTo}
        />
      </div>

      {/* Validation errors */}
      {!isValid && (
        <div className="mt-5 rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#d97706] shrink-0" />
            <span className="text-[.84rem] font-semibold text-[#92400e]">
              Completá estos campos antes de continuar:
            </span>
          </div>
          {Object.entries(errorsByStep).map(([stepNum, { stepLabel, messages }]) => (
            <div key={stepNum}>
              <button
                type="button"
                onClick={() => onGoTo(Number(stepNum))}
                className="text-[.78rem] font-semibold text-[#c5a572] hover:text-[#9e7f4e] uppercase tracking-wide transition-colors mb-1"
              >
                Paso {stepNum} — {stepLabel} →
              </button>
              <ul className="space-y-0.5 pl-2">
                {messages.map((msg, i) => (
                  <li key={i} className="text-[.82rem] text-[#92400e] before:content-['·'] before:mr-1.5 before:text-[#d97706]">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-8 pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev}
          className="px-6 py-3 border-[1.5px] border-[#d1d5db] rounded-full text-[.95rem] font-medium hover:bg-gray-50 transition-colors">
          ← Anterior
        </button>
        <button type="button" onClick={onNext} disabled={!isValid}
          className="px-8 py-3 bg-[#c5a572] text-white rounded-full text-[.95rem] font-semibold hover:bg-[#9e7f4e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
          Continuar al pago →
        </button>
      </div>
    </div>
  )
}
