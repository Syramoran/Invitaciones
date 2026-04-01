import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { crearPedido } from '@/services/pedidoService'
import type { PedidoResponseDto } from '@/services/pedidoService'
import { templateService, type Template } from '@/services/templateService'

import { TIPO_EVENTO_IDS, SERVICIO_DB_IDS } from '@/components/solicitar/data'
import { calcPrices } from '@/components/solicitar/utils'
import { SolicitarStepper } from '@/components/solicitar/SolicitarStepper'
import { StepEvento } from '@/components/solicitar/StepEvento'
import { StepDiseno } from '@/components/solicitar/StepDiseno'
import { StepServicios } from '@/components/solicitar/StepServicios'
import { StepPreview } from '@/components/solicitar/StepPreview'
import { StepContacto } from '@/components/solicitar/StepContacto'
import { StepConfirmacion } from '@/components/solicitar/StepConfirmacion'
import type { EventType, AddonState } from '@/components/solicitar/types'

export default function SolicitarPage() {
  // ── Wizard navigation ──────────────────────────────────────────────────────
  const [step, setStep] = useState(1)

  function goNext() {
    setStep(s => { const n = s + 1; return n })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function goPrev() {
    if (step > 1) { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }
  function goToStep(n: number) {
    if (n < step && n >= 1) { setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }

  // ── Templates desde API ────────────────────────────────────────────────────
  const [apiTemplates,     setApiTemplates]     = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)

  useEffect(() => {
    templateService.getAll()
      .then(setApiTemplates)
      .catch(() => {})
      .finally(() => setTemplatesLoading(false))
  }, [])

  // ── Selections ─────────────────────────────────────────────────────────────
  const [eventType,     setEventType]     = useState<EventType | null>(null)
  const [templateId,    setTemplateId]    = useState<number | null>(null)
  const [color,         setColor]         = useState('#c5a572')
  const [addons,        setAddons]        = useState<AddonState>({ rsvp: false, countdown: false, music: false, history: false, gallery: false })
  const [secondVersion, setSecondVersion] = useState(false)

  function toggleAddon(id: keyof AddonState) {
    setAddons(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // ── Contact form ───────────────────────────────────────────────────────────
  const [form,    setForm]    = useState({ name: '', phone: '', email: '' })
  const [touched, setTouched] = useState({ name: false, phone: false, email: false })

  const isFormValid =
    form.name.trim().length >= 2 &&
    /^[\d\s+\-()]{6,30}$/.test(form.phone.trim()) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())

  // ── Submission ─────────────────────────────────────────────────────────────
  const [isSubmitting,   setIsSubmitting]   = useState(false)
  const [submitError,    setSubmitError]    = useState<string | null>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<PedidoResponseDto | null>(null)

  async function submitOrder() {
    if (!isFormValid || !eventType || !templateId || isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)

    const serviciosIds = Object.entries(addons)
      .filter(([, active]) => active)
      .map(([key]) => SERVICIO_DB_IDS[key])
      .filter(Boolean)

    try {
      const result = await crearPedido({
        nombreCliente: form.name.trim(),
        telefono:      form.phone.trim(),
        email:         form.email.trim(),
        tipoEventoId:  TIPO_EVENTO_IDS[eventType],
        templateId:    templateId!,
        serviciosIds,
      })
      setConfirmedOrder(result)
      setStep(6)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setSubmitError('Hubo un error al enviar tu pedido. Por favor intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const prices         = calcPrices(addons, secondVersion)
  const templateName   = apiTemplates.find(t => t.id === templateId)?.nombre ?? null
  const stepTemplates  = eventType
    ? apiTemplates.filter(t => t.tipoEventoId === TIPO_EVENTO_IDS[eventType] && t.activo)
    : []

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream text-charcoal font-body">

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-black/[0.05] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-semibold text-charcoal tracking-tight">
            festejá<span className="text-gold italic">.</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-charcoal transition-colors">
            <ChevronLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </header>

      <SolicitarStepper step={step} goToStep={goToStep} />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10 pb-36">
        <div key={step} className="animate-step-in">
          {step === 1 && (
            <StepEvento
              eventType={eventType}
              setEventType={t => { setEventType(t); setTemplateId(null) }}
              onNext={goNext}
            />
          )}
          {step === 2 && eventType && (
            <StepDiseno
              eventType={eventType}
              templates={stepTemplates}
              templatesLoading={templatesLoading}
              templateId={templateId}
              setTemplateId={setTemplateId}
              color={color}
              setColor={setColor}
              onNext={goNext}
              onPrev={goPrev}
            />
          )}
          {step === 3 && (
            <StepServicios
              addons={addons}
              toggleAddon={toggleAddon}
              secondVersion={secondVersion}
              setSecondVersion={setSecondVersion}
              prices={prices}
              onNext={goNext}
              onPrev={goPrev}
            />
          )}
          {step === 4 && eventType && (
            <StepPreview
              eventType={eventType}
              templateName={templateName}
              color={color}
              addons={addons}
              secondVersion={secondVersion}
              prices={prices}
              onNext={goNext}
              onPrev={goPrev}
            />
          )}
          {step === 5 && eventType && (
            <StepContacto
              form={form}
              setForm={setForm}
              touched={touched}
              setTouched={setTouched}
              isFormValid={isFormValid}
              addons={addons}
              secondVersion={secondVersion}
              eventType={eventType}
              templateName={templateName}
              prices={prices}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onSubmit={submitOrder}
              onPrev={goPrev}
            />
          )}
          {step === 6 && eventType && (
            <StepConfirmacion
              confirmedOrder={confirmedOrder}
              eventType={eventType}
              templateName={templateName}
              form={form}
              addons={addons}
              secondVersion={secondVersion}
              prices={prices}
            />
          )}
        </div>
      </main>

      {/* Mobile price bar — visible only on step 3 */}
      {step === 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 shadow-lg z-40 px-6 py-4 flex items-center justify-between lg:hidden">
          <div>
            <div className="text-xs text-warm-gray">Total estimado</div>
            <div className="font-display text-xl font-bold">${prices.total.toLocaleString('es-AR')}</div>
          </div>
          <button onClick={goNext} className="text-sm font-medium bg-charcoal text-champagne-light px-6 py-2.5 rounded-full">
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
