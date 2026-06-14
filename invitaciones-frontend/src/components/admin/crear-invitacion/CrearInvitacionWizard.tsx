import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

import type { WizardFormState, ServiceToggle } from '@/types/crearInvitacion'
import { createInitialFormState, INITIAL_CAMPOS } from '@/types/crearInvitacion'

import { templateService }          from '@/services/templateService'
import { servicioService }           from '@/services/servicioService'
import { adminPedidoService }        from '@/services/adminPedidoService'
import { crearInvitacionService }    from '@/services/crearInvitacionService'
import type { Template }             from '@/services/templateService'
import type { Pedido }               from '@/types/adminPedido'
import type { CrearInvitacionResult } from '@/types/crearInvitacion'

import { WizardStepper }    from './WizardStepper'
import { WizardLivePreview } from './WizardLivePreview'
import { Step1DatosBasicos } from './Step1DatosBasicos'
import { Step2Evento }       from './Step2Evento'
import { Step3Servicios }    from './Step3Servicios'
import { Step4Contenido }    from './Step4Contenido'
import { Step5Invitados }    from './Step5Invitados'
import { Step6Revisar }      from './Step6Revisar'
import { ResultScreen }      from './ResultScreen'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocationState {
  pedidoId?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CrearInvitacionWizard() {
  const location   = useLocation()
  const locState   = (location.state ?? {}) as LocationState

  // ── Remote data ──────────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<Template[]>([])
  const [pedidos,   setPedidos]   = useState<Pedido[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [dataError,   setDataError]   = useState<string | null>(null)

  // ── Wizard state ─────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1)
  const [formState,   setFormState]   = useState<WizardFormState>(createInitialFormState)

  // ── Submission state ─────────────────────────────────────────────────────────
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result,      setResult]      = useState<CrearInvitacionResult | null>(null)

  // ─── Load remote data on mount ───────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [tpls, svcs, pedidosPage] = await Promise.all([
          templateService.getAll(),
          servicioService.getAll(),
          adminPedidoService.getAll({ limit: 100 }),
        ])

        if (cancelled) return

        setTemplates(tpls)
        setPedidos(pedidosPage.data)

        // Build service toggles (active services only)
        const servicios: ServiceToggle[] = svcs
          .filter(s => s.activo)
          .map(s => ({
            id: s.id,
            nombre: s.nombre,
            descripcion: s.descripcion,
            incluidoEnBase: s.incluidoEnBase,
            enabled: s.incluidoEnBase, // base services start enabled
          }))

        setFormState(prev => ({
          ...prev,
          step3: { servicios },
        }))

        // Prefill from navigation state
        if (locState.pedidoId) {
          const pedido = pedidosPage.data.find(p => p.id === locState.pedidoId)
          if (pedido) prefillFromPedido(pedido, servicios)
        }
      } catch {
        if (!cancelled) setDataError('Error al cargar datos. Recargá la página.')
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }

    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Prefill from pedido ─────────────────────────────────────────────────────

  function prefillFromPedido(pedido: Pedido, servicioBase: ServiceToggle[]) {
    const pedidoServiceIds = new Set(pedido.servicios.map(s => s.servicioId))
    const servicios = servicioBase.map(s => ({
      ...s,
      enabled: s.incluidoEnBase || pedidoServiceIds.has(s.id),
    }))

    const campos = INITIAL_CAMPOS[pedido.tipoEventoId] ?? {}

    setFormState(prev => ({
      ...prev,
      step1: {
        pedidoId:    String(pedido.id),
        tipoEventoId: pedido.tipoEventoId,
        templateId:   pedido.templateId,
        titulo:       prev.step1.titulo,
        colorPrimario: prev.step1.colorPrimario,
      },
      step2: {
        ...prev.step2,
        camposEspecificos: { ...campos },
      },
      step3: { servicios },
    }))
  }

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const updateStep1 = useCallback((updates: Partial<WizardFormState['step1']>) => {
    setFormState(prev => {
      const next = { ...prev, step1: { ...prev.step1, ...updates } }

      // When tipoEventoId changes, reset camposEspecificos
      if ('tipoEventoId' in updates && updates.tipoEventoId !== prev.step1.tipoEventoId) {
        next.step2 = {
          ...prev.step2,
          camposEspecificos: updates.tipoEventoId
            ? { ...(INITIAL_CAMPOS[updates.tipoEventoId] ?? {}) }
            : {},
        }
      }

      // When colorPrimario changes, sync to step2
      if ('colorPrimario' in updates) {
        next.step2 = { ...next.step2, colorPrimario: updates.colorPrimario ?? '' }
      }

      // When pedidoId changes, sync services from the selected pedido
      if ('pedidoId' in updates && updates.pedidoId && updates.pedidoId !== prev.step1.pedidoId) {
        const pedido = pedidos.find(p => String(p.id) === updates.pedidoId)
        if (pedido) {
          const pedidoServiceIds = new Set(pedido.servicios.map(s => s.servicioId))
          next.step3 = {
            servicios: prev.step3.servicios.map(s => ({
              ...s,
              enabled: s.incluidoEnBase || pedidoServiceIds.has(s.id),
            })),
          }
        }
      }

      return next
    })
  }, [pedidos])

  const updateStep2 = useCallback((updates: Partial<WizardFormState['step2']>) => {
    setFormState(prev => ({ ...prev, step2: { ...prev.step2, ...updates } }))
  }, [])

  const updateStep3 = useCallback((updates: Partial<WizardFormState['step3']>) => {
    setFormState(prev => ({ ...prev, step3: { ...prev.step3, ...updates } }))
  }, [])

  const updateStep4 = useCallback((updates: Partial<WizardFormState['step4']>) => {
    setFormState(prev => ({ ...prev, step4: { ...prev.step4, ...updates } }))
  }, [])

  const updateStep5 = useCallback((updates: Partial<WizardFormState['step5']>) => {
    setFormState(prev => ({ ...prev, step5: { ...prev.step5, ...updates } }))
  }, [])

  // ── Navigation ───────────────────────────────────────────────────────────────

  function goTo(step: number) {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step)
      setSubmitError(null)
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  async function handleGenerate() {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const created = await crearInvitacionService.crear(formState)
      setResult(created)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Error al generar la invitación. Intentá de nuevo.'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  function handleCreateAnother() {
    setResult(null)
    setSubmitError(null)
    setCurrentStep(1)
    setFormState(createInitialFormState())
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-24 text-[#6b7280] text-[.9rem]">
        <span className="animate-spin mr-2 inline-block w-5 h-5 border-2 border-[#c5a572] border-t-transparent rounded-full" />
        Cargando datos…
      </div>
    )
  }

  if (dataError) {
    return (
      <div className="py-16 text-center text-[#dc2626] text-[.9rem]">{dataError}</div>
    )
  }

  if (result) {
    return (
      <ResultScreen
        result={result}
        guests={formState.step5.guests}
        onCreateAnother={handleCreateAnother}
      />
    )
  }

  const selectedTemplate = templates.find(t => t.id === formState.step1.templateId)

  return (
    <div className="flex gap-0 items-start">

      {/* Left: Form */}
      <div className="flex-1 min-w-0">
        <WizardStepper current={currentStep} onGoBack={goTo} />

        <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-6 sm:p-8">
          {currentStep === 1 && (
            <Step1DatosBasicos
              state={formState.step1}
              templates={templates}
              pedidos={pedidos}
              onChange={updateStep1}
              onNext={() => goTo(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2Evento
              state={formState.step2}
              tipoEventoId={formState.step1.tipoEventoId}
              templateSlug={templates.find(t => t.id === formState.step1.templateId)?.slug ?? null}
              onChange={updateStep2}
              onNext={() => goTo(3)}
              onPrev={() => goTo(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3Servicios
              state={formState.step3}
              onChange={updateStep3}
              onNext={() => goTo(4)}
              onPrev={() => goTo(2)}
              contrasenaAsistentes={formState.step2.contrasenaAsistentes}
              onChangeContrasena={v => updateStep2({ contrasenaAsistentes: v })}
            />
          )}

          {currentStep === 4 && (
            <Step4Contenido
              state={formState.step4}
              onChange={updateStep4}
              servicios={formState.step3.servicios}
              onNext={() => goTo(5)}
              onPrev={() => goTo(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5Invitados
              state={formState.step5}
              onChange={updateStep5}
              onNext={() => goTo(6)}
              onPrev={() => goTo(4)}
            />
          )}

          {currentStep === 6 && (
            <Step6Revisar
              formState={formState}
              templates={templates}
              loading={submitting}
              error={submitError}
              onGenerate={handleGenerate}
              onPrev={() => goTo(5)}
              onGoTo={goTo}
            />
          )}
        </div>
      </div>

      {/* Right: Preview panel */}
      <div className="hidden xl:flex w-[300px] flex-shrink-0 flex-col ml-6 sticky top-0 rounded-2xl overflow-hidden border border-[#e5e7eb] bg-[#f0ede8]" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
        <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-[#e5e7eb] flex items-center justify-between">
          <span className="text-[.7rem] font-semibold uppercase tracking-widest text-[#6b7280]">
            Vista previa en vivo
          </span>
          <span className="text-[.68rem] text-[#9ca3af] bg-[#fdf8f0] px-2 py-0.5 rounded-full">
            {selectedTemplate?.nombre ?? 'Sin selección'}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="overflow-hidden shadow-2xl flex-shrink-0"
            style={{
              width: '210px',
              aspectRatio: '9/16',
              borderRadius: '20px',
              border: '7px solid #2d2926',
            }}
          >
            <WizardLivePreview formState={formState} templates={templates} />
          </div>
        </div>
      </div>

    </div>
  )
}
