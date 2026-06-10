import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EVENT_LABELS, btnBack } from './data'
import { fmtPrice } from './utils'
import type { AddonState, AddonData, EventType, PriceBreakdown } from './types'

type FormState   = { name: string; phone: string; email: string }
type TouchedState = { name: boolean; phone: boolean; email: boolean }

const VALIDATE = {
  name:  (v: string) => v.trim().length >= 2,
  phone: (v: string) => /^[\d\s+\-()]{6,30}$/.test(v.trim()),
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
}

const FIELD_ERRORS: Record<keyof FormState, string> = {
  name:  'Ingresá tu nombre completo (mín. 2 caracteres)',
  phone: 'Ingresá un teléfono válido (ej: +54 11 1234-5678)',
  email: 'Ingresá un email válido',
}

const BASE_CLS = 'w-full px-4 py-3.5 rounded-xl border text-sm bg-white dark:bg-charcoal dark:text-champagne-light outline-none transition-all'

interface Props {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  touched: TouchedState
  setTouched: React.Dispatch<React.SetStateAction<TouchedState>>
  isFormValid: boolean
  termsAccepted: boolean
  setTermsAccepted: (v: boolean) => void
  addons: AddonState
  secondVersion: boolean
  addonsData: AddonData[]
  basePrice: number
  eventType: EventType
  templateName: string | null
  prices: PriceBreakdown
  isSubmitting: boolean
  submitError: string | null
  onSubmit: () => void
  onPrev: () => void
}

export function StepContacto({
  form, setForm, touched, setTouched,
  isFormValid, termsAccepted, setTermsAccepted,
  addons, secondVersion,
  addonsData, basePrice,
  eventType, templateName, prices,
  isSubmitting, submitError, onSubmit, onPrev,
}: Props) {
  const { subtotal, secondCost, total } = prices

  function fieldCls(field: keyof FormState) {
    if (!touched[field] || form[field] === '') return `${BASE_CLS} border-champagne-dark focus:border-gold focus:shadow-[0_0_0_3px_rgba(197,165,114,0.15)]`
    if (!VALIDATE[field](form[field]))          return `${BASE_CLS} border-[#c0392b] focus:shadow-[0_0_0_3px_rgba(192,57,43,0.1)]`
    return `${BASE_CLS} border-[#6a9e6a] focus:shadow-[0_0_0_3px_rgba(106,158,106,0.1)]`
  }

  function fieldError(field: keyof FormState) {
    if (!touched[field] || VALIDATE[field](form[field])) return null
    return (
      <p className="text-xs text-[#c0392b] mt-1.5 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {FIELD_ERRORS[field]}
      </p>
    )
  }

  return (
    <>
      <h2 className="font-display text-4xl font-semibold text-center mb-2 dark:text-champagne-light">Últimos datos para confirmar</h2>
      <p className="text-warm-gray text-center font-light mb-12">Completá el formulario y enviá tu solicitud</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start max-w-4xl mx-auto">
        {/* Form */}
        <div>
          <h4 className="font-display text-xl font-semibold mb-6 dark:text-champagne-light">Tus datos de contacto</h4>

          <div className="mb-5">
            <label className="block text-sm font-medium mb-1.5 dark:text-champagne-light">Nombre completo <span className="text-[#c0392b]">*</span></label>
            <input
              type="text" maxLength={200} placeholder="Ej: María García"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onBlur={() => setTouched(t => ({ ...t, name: true }))}
              className={fieldCls('name')}
            />
            {fieldError('name')}
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium mb-1.5 dark:text-champagne-light">Teléfono <span className="text-[#c0392b]">*</span></label>
            <input
              type="tel" maxLength={30} placeholder="Ej: +54 11 1234-5678"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              onBlur={() => setTouched(t => ({ ...t, phone: true }))}
              className={fieldCls('phone')}
            />
            {fieldError('phone')}
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium mb-1.5 dark:text-champagne-light">Email <span className="text-[#c0392b]">*</span></label>
            <input
              type="email" maxLength={255} placeholder="Ej: maria@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              className={fieldCls('email')}
            />
            {fieldError('email')}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white dark:bg-charcoal rounded-2xl border border-black/[0.06] dark:border-white/5 p-7">
          <h4 className="font-display text-xl font-semibold mb-5 dark:text-champagne-light">Resumen del pedido</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-warm-gray font-light">Invitación base</span><span className="font-medium">{fmtPrice(basePrice)}</span></div>
            {addonsData.map(a => !a.incluidoEnBase && addons[a.id] ? (
              <div key={a.id} className="flex justify-between"><span className="text-warm-gray font-light">{a.label}</span><span>{fmtPrice(a.price)}</span></div>
            ) : null)}
            {secondVersion && <div className="flex justify-between"><span className="text-warm-gray font-light">2da versión (50%)</span><span>+{fmtPrice(secondCost)}</span></div>}
          </div>
          {subtotal !== basePrice && <div className="h-px bg-ivory dark:bg-white/10 my-3" />}
          <div className="h-px bg-ivory dark:bg-white/10 my-4" />
          <div className="flex justify-between items-center mb-4">
            <span className="font-display text-lg font-semibold">Total</span>
            <span className="font-display text-3xl font-bold">{fmtPrice(total)}</span>
          </div>
          <div className="border-t border-ivory dark:border-white/10 pt-4 space-y-1 text-sm">
            <div><span className="text-warm-gray font-light">Evento: </span>{EVENT_LABELS[eventType]}</div>
            <div><span className="text-warm-gray font-light">Template: </span>{templateName || '-'}</div>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="max-w-4xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />{submitError}
        </div>
      )}

      {/* Terms acceptance */}
      <div className="max-w-4xl mx-auto mt-8">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-5 h-5 rounded border-2 border-champagne-dark peer-checked:bg-gold peer-checked:border-gold transition-all flex items-center justify-center">
              {termsAccepted && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm font-light text-charcoal-soft dark:text-champagne-light/90 leading-relaxed">
            Leí y acepto los{' '}
            <Link to="/terminos" target="_blank" className="text-gold hover:underline font-medium">
              Términos de Servicio
            </Link>{' '}
            y la{' '}
            <Link to="/privacidad" target="_blank" className="text-gold hover:underline font-medium">
              Política de Privacidad
            </Link>
            . Entiendo que mis datos serán utilizados para coordinar el servicio de invitación digital.
          </span>
        </label>
      </div>

      <div className="flex justify-between items-center mt-6 max-w-4xl mx-auto">
        <button onClick={onPrev} className={btnBack}><ChevronLeft className="w-4 h-4" /> Anterior</button>
        <button
          disabled={!isFormValid || !termsAccepted || isSubmitting}
          onClick={onSubmit}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-dark text-white px-10 py-4 rounded-full font-medium text-base disabled:opacity-35 disabled:cursor-not-allowed hover:shadow-[0_8px_24px_rgba(197,165,114,0.35)] hover:-translate-y-0.5 transition-all"
        >
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : 'Solicitar Invitación'}
        </button>
      </div>
    </>
  )
}
