import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import apiClient from '@/services/apiClient'
import { WizardLivePreview } from '@/components/admin/crear-invitacion/WizardLivePreview'
import { useAuth } from '@/context/useAuth'

import type { WizardFormState, ServiceToggle, HistoriaSeccion } from '@/types/crearInvitacion'
import { createInitialFormState, INITIAL_CAMPOS } from '@/types/crearInvitacion'
import { adminInvitacionService } from '@/services/adminInvitacionService'
import { templateService } from '@/services/templateService'
import { servicioService } from '@/services/servicioService'
import type { Template } from '@/services/templateService'
import { useWizardPersistence, loadSavedDraft } from '@/hooks/useWizardPersistence'
import type { SerializableWizardState } from '@/hooks/useWizardPersistence'
import { ResumeDraftModal } from '@/components/client/crear-invitacion/ResumeDraftModal'

// ── Use admin step components directly (identical UX, just no pedido selector) ──
import { Step1DatosBasicos } from '@/components/admin/crear-invitacion/Step1DatosBasicos'
import { Step2Evento }       from '@/components/admin/crear-invitacion/Step2Evento'
import { Step3Servicios }    from '@/components/admin/crear-invitacion/Step3Servicios'
import { Step4Contenido }    from '@/components/admin/crear-invitacion/Step4Contenido'
import { Step5Invitados }    from '@/components/admin/crear-invitacion/Step5Invitados'
import { Step6Revisar }      from '@/components/client/crear-invitacion/Step6Revisar'
import { Step6Pago }         from '@/components/client/crear-invitacion/Step6Pago'

const STEPS = [
  { num: 1, label: 'Diseño' },
  { num: 2, label: 'Evento' },
  { num: 3, label: 'Servicios' },
  { num: 4, label: 'Contenido' },
  { num: 5, label: 'Invitados' },
  { num: 6, label: 'Revisar' },
  { num: 7, label: 'Pagar' },
]

export default function CrearInvitacionWizard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')
  const { user } = useAuth()
  const userId = user?.id ?? 0

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [templates, setTemplates] = useState<Template[]>([])
  const [formState, setFormState] = useState<WizardFormState>(createInitialFormState())
  const [isPaid, setIsPaid] = useState(false)
  const [originalHistoriaIds, setOriginalHistoriaIds] = useState<number[]>([])

  // Draft resume modal
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [savedDraftForResume, setSavedDraftForResume] = useState<SerializableWizardState | null>(null)
  const hasCheckedDraftRef = useRef(false)

  // Persistence: paused while loading or while the resume modal is open (to
  // avoid overwriting the saved draft with the initial empty form state).
  const persistencePaused = loading || showResumeModal || !!editId
  const { clearSavedDraft } = useWizardPersistence(userId, formState, persistencePaused)

  useEffect(() => {
    async function loadData() {
      try {
        const [tempRes, svcsRes] = await Promise.all([
          templateService.getAll(),
          servicioService.getAll(),
        ])
        setTemplates(tempRes)

        const servicios: ServiceToggle[] = svcsRes
          .filter(s => s.activo)
          .map(s => ({
            id: s.id,
            nombre: s.nombre,
            descripcion: s.descripcion,
            precio: s.precio,
            incluidoEnBase: s.incluidoEnBase,
            enabled: s.incluidoEnBase,
          }))

        setFormState(prev => ({ ...prev, step3: { servicios } }))

        if (editId) {
          const [invRes, musicaRes, historiasRes] = await Promise.all([
            apiClient.get(`/client/invitaciones/${editId}`),
            apiClient.get(`/invitaciones/${editId}/musica`).catch(() => ({ data: null })),
            apiClient.get(`/invitaciones/${editId}/historias`).catch(() => ({ data: [] })),
          ])
          const inv = invRes.data
          const musica = musicaRes.data
          const historiasRaw: { id: number; texto: string; orden: number; imagenUrl: string | null }[] =
            historiasRes.data ?? []

          const mappedHistorias: HistoriaSeccion[] = historiasRaw.map(h => ({
            id: crypto.randomUUID(),
            texto: h.texto,
            orden: h.orden,
            imagen: null,
            imagenPreview: null,
            serverId: h.id,
            existingImagenUrl: h.imagenUrl,
          }))
          setOriginalHistoriaIds(historiasRaw.map(h => h.id))

          setIsPaid(inv.estadoPago === 'PAGADO')
          setFormState(prev => ({
            ...prev,
            step1: {
              ...prev.step1,
              tipoEventoId: inv.tipoEvento?.id ?? null,
              templateId: inv.template?.id ?? null,
              titulo: inv.titulo ?? '',
              colorPrimario: inv.colorPrimario ?? '',
            },
            step2: {
              ...prev.step2,
              fechaEvento: inv.fechaEvento ? new Date(inv.fechaEvento).toISOString().split('T')[0] : '',
              horaEvento: inv.horaEvento ?? '',
              ubicacion: inv.ubicacion === 'multiple' ? 'multiple' : (inv.ubicacion ?? ''),
              direccion: inv.direccion === 'multiple' ? 'multiple' : (inv.direccion ?? ''),
              colorPrimario: inv.colorPrimario ?? '',
              ubicaciones: inv.camposEspecificos?.ubicaciones ?? [],
              camposEspecificos: inv.camposEspecificos ?? {},
            },
            step4: {
              ...prev.step4,
              existingFotos: (inv.fotosAnfitrion ?? []).map((f: { id: number; url: string }) => ({ id: f.id, url: f.url })),
              existingMusica: musica ? { id: musica.id, archivoUrl: musica.archivoUrl } : null,
              historias: mappedHistorias,
            },
          }))
        }
      } catch (err) {
        console.error('Error cargando datos', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [editId])

  // Once loading finishes, check for a saved draft (only for new invitations)
  useEffect(() => {
    if (loading || hasCheckedDraftRef.current) return
    hasCheckedDraftRef.current = true

    if (!editId && userId) {
      const saved = loadSavedDraft(userId)
      if (saved) {
        setSavedDraftForResume(saved)
        setShowResumeModal(true)
      }
    }
  }, [loading, editId, userId])

  // ── Resume handlers ───────────────────────────────────────────────────────────

  function handleResume() {
    if (!savedDraftForResume) return
    setFormState(prev => ({
      ...savedDraftForResume,
      // Keep API-loaded services (up-to-date prices) but restore user's enabled choices
      step3: {
        servicios: prev.step3.servicios.map(svc => {
          const saved = savedDraftForResume.step3.servicios.find(s => s.id === svc.id)
          return saved ? { ...svc, enabled: saved.enabled } : svc
        }),
      },
      // Strip any non-serializable residue (fotos/musica must be re-uploaded)
      step4: {
        ...savedDraftForResume.step4,
        fotos: [],
        fotosPreviews: [],
        musica: null,
        existingFotos: [],
        removedFotoIds: [],
        existingMusica: null,
      },
    }))
    setShowResumeModal(false)
  }

  function handleStartFresh() {
    clearSavedDraft()
    setShowResumeModal(false)
  }

  // ── Updaters ─────────────────────────────────────────────────────────────────

  const updateStep1 = useCallback((updates: Partial<WizardFormState['step1']>) => {
    setFormState(prev => {
      const next = { ...prev, step1: { ...prev.step1, ...updates } }

      if ('tipoEventoId' in updates && updates.tipoEventoId !== prev.step1.tipoEventoId) {
        next.step2 = {
          ...prev.step2,
          camposEspecificos: updates.tipoEventoId
            ? { ...(INITIAL_CAMPOS[updates.tipoEventoId] ?? {}) }
            : {},
        }
      }

      if ('colorPrimario' in updates) {
        next.step2 = { ...next.step2, colorPrimario: updates.colorPrimario ?? '' }
      }

      return next
    })
  }, [])

  const updateStep2 = useCallback((u: Partial<WizardFormState['step2']>) =>
    setFormState(p => ({ ...p, step2: { ...p.step2, ...u } })), [])

  const updateStep3 = useCallback((u: Partial<WizardFormState['step3']>) =>
    setFormState(p => ({ ...p, step3: { ...p.step3, ...u } })), [])

  const updateStep4 = useCallback((u: Partial<WizardFormState['step4']>) =>
    setFormState(p => ({ ...p, step4: { ...p.step4, ...u } })), [])

  const updateStep5 = useCallback((u: Partial<WizardFormState['step5']>) =>
    setFormState(p => ({ ...p, step5: { ...p.step5, ...u } })), [])

  const handleNext = () => { setError(null); setStep(s => Math.min(s + 1, STEPS.length)) }
  const handlePrev = () => { setError(null); setStep(s => Math.max(s - 1, 1)) }
  const goTo = (s: number) => { if (s >= 1 && s <= STEPS.length) { setError(null); setStep(s) } }

  // ── Payload builder ───────────────────────────────────────────────────────────

  const buildPayload = () => {
    const { step1, step2, step3 } = formState
    const colorPrimario = step2.colorPrimario || step1.colorPrimario
    return {
      tipoEventoId: step1.tipoEventoId,
      templateId:   step1.templateId,
      titulo:        step1.titulo,
      ...(colorPrimario ? { colorPrimario } : {}),
      fechaEvento:   step2.fechaEvento,
      horaEvento:    step2.horaEvento,
      ubicacion:     step2.ubicacion,
      direccion:     step2.direccion,
      latitud:       step2.latitud || 0,
      longitud:      step2.longitud || 0,
      ...(step2.contrasenaAsistentes ? { contrasenaAsistentes: step2.contrasenaAsistentes } : {}),
      camposEspecificos: {
        ...step2.camposEspecificos,
        ubicaciones: step2.ubicaciones,
      },
      serviciosIds: step3.servicios.filter(s => s.enabled).map(s => s.id),
    }
  }

  async function saveInvitacion(): Promise<string> {
    const payload = buildPayload()
    let currentId = editId

    if (!currentId) {
      const res = await apiClient.post('/client/invitaciones', payload)
      currentId = res.data.id as string
    } else {
      await apiClient.put(`/client/invitaciones/${currentId}`, payload)
    }

    if (formState.step4.fotos.length > 0) {
      const fd = new FormData()
      formState.step4.fotos.forEach(f => fd.append('fotos', f))
      await apiClient.post(`/client/invitaciones/${currentId}/fotos-anfitrion`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    for (const fotoId of formState.step4.removedFotoIds) {
      await apiClient.delete(`/client/invitaciones/${currentId}/fotos-anfitrion/${fotoId}`)
    }

    if (formState.step4.removeMusica && formState.step4.existingMusica) {
      await apiClient.delete(`/invitaciones/${currentId}/musica`)
    }

    if (formState.step4.musica) {
      const fd = new FormData()
      fd.append('archivo', formState.step4.musica)
      await apiClient.post(`/invitaciones/${currentId}/musica`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    const currentServerIds = new Set(
      formState.step4.historias.filter(h => h.serverId !== undefined).map(h => h.serverId!)
    )
    for (const serverId of originalHistoriaIds) {
      if (!currentServerIds.has(serverId)) {
        await adminInvitacionService.deleteHistoria(currentId!, serverId)
      }
    }
    for (const h of formState.step4.historias) {
      if (h.serverId !== undefined) {
        const removeImagen = h.existingImagenUrl === null && h.imagen === null
        await adminInvitacionService.updateHistoria(currentId!, h.serverId, h.texto, h.orden, h.imagen, removeImagen)
      } else {
        await adminInvitacionService.createHistoria(currentId!, h.texto, h.orden, h.imagen)
      }
    }

    if (formState.step5.guests.length > 0) {
      await apiClient.post(`/invitaciones/${currentId}/invitados`, {
        invitados: formState.step5.guests,
      })
    }

    return currentId!
  }

  const calcularTotal = () =>
    formState.step3.servicios
      .filter(s => s.incluidoEnBase || s.enabled)
      .reduce((sum, s) => sum + Number(s.precio ?? 0), 0)

  const handlePay = async (codigoDescuento?: string) => {
    if (isPaid) {
      setError('Esta invitación ya fue pagada y no puede volver a procesarse.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const currentId = await saveInvitacion()
      // Server now owns the data — clear local draft
      clearSavedDraft()

      const prefRes = await apiClient.post(`/pagos/crear-preferencia/${currentId}`, {
        title: formState.step1.titulo,
        price: calcularTotal(),
        ...(codigoDescuento ? { codigoDescuento } : {}),
      })

      if (prefRes.data.tipo === 'GRATUITO') {
        navigate('/client/dashboard?payment=success')
        return
      }

      window.location.href = prefRes.data.init_point
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.message ?? 'Error al procesar el pago. Por favor intenta nuevamente.'
      setError(msg)
      setSaving(false)
    }
  }

  const handleActivarGratis = async (codigoDescuento: string) => {
    await handlePay(codigoDescuento)
  }

  const handleValidarCodigo = async (codigo: string) => {
    const res = await apiClient.post('/codigos-descuento/validar', { codigo })
    return res.data as { valido: boolean; porcentaje: number; mensaje: string }
  }

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfaf8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c5a572]" />
      </div>
    )
  }

  // ── Preview data ──────────────────────────────────────────────────────────────

  const selectedTemplate = templates.find(t => t.id === formState.step1.templateId)

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#fcfaf8] text-[#2d2926]">

      {showResumeModal && (
        <ResumeDraftModal onResume={handleResume} onStartFresh={handleStartFresh} />
      )}

      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-[#f3f0ea] px-6 md:px-8 py-4 flex items-center justify-between z-10 shadow-sm">
        <div
          className="font-display text-2xl font-semibold cursor-pointer"
          onClick={() => navigate('/client/dashboard')}
        >
          festejá<span className="text-[#c5a572] italic">.</span>
        </div>
        <span className="text-[.78rem] text-[#9ca3af] hidden sm:block">
          Paso {step} de {STEPS.length}
        </span>
        <button
          onClick={() => navigate('/client/dashboard')}
          className="px-3 py-1.5 text-[.82rem] font-medium text-[#6b7280] border border-[#e5e7eb] rounded-lg hover:border-[#c5a572] hover:text-[#2d2926] hover:bg-[#fdf8f0] transition-colors"
        >
          Cancelar
        </button>
      </header>

      {/* Main: form (left) + preview (right) */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

            {/* Stepper */}
            <div className="flex items-end gap-0 overflow-x-auto pb-px mb-8 border-b border-[#e5e7eb]">
              {STEPS.map((s) => {
                const isDone   = s.num < step
                const isActive = s.num === step
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => isDone && goTo(s.num)}
                    disabled={!isDone}
                    className={[
                      'flex items-center gap-1.5 px-2 sm:px-3 py-2.5 whitespace-nowrap text-[.75rem] sm:text-[.82rem] border-b-2 -mb-px transition-all duration-200',
                      isActive  ? 'text-[#2d2926] font-semibold border-[#c5a572]'
                      : isDone  ? 'text-[#16a34a] font-semibold border-[#16a34a]/50 hover:border-[#16a34a] cursor-pointer'
                      :           'text-[#9ca3af] border-transparent cursor-default',
                    ].join(' ')}
                  >
                    <span className={[
                      'w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[.65rem] sm:text-[.7rem] font-semibold border-[1.5px] shrink-0 transition-colors',
                      isActive ? 'bg-[#c5a572] border-[#c5a572] text-white'
                      : isDone ? 'bg-[#16a34a] border-[#16a34a] text-white'
                      :          'border-[#d1d5db] text-[#9ca3af]',
                    ].join(' ')}>
                      {isDone ? '✓' : s.num}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Step content */}
            <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-6 sm:p-8">

              {step === 1 && (
                <Step1DatosBasicos
                  state={formState.step1}
                  templates={templates}
                  pedidos={[]}
                  onChange={updateStep1}
                  onNext={handleNext}
                />
              )}

              {step === 2 && (
                <Step2Evento
                  state={formState.step2}
                  tipoEventoId={formState.step1.tipoEventoId}
                  templateSlug={templates.find(t => t.id === formState.step1.templateId)?.slug ?? null}
                  onChange={updateStep2}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              )}

              {step === 3 && (
                <Step3Servicios
                  state={formState.step3}
                  onChange={updateStep3}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  contrasenaAsistentes={formState.step2.contrasenaAsistentes}
                  onChangeContrasena={v => updateStep2({ contrasenaAsistentes: v })}
                />
              )}

              {step === 4 && (
                <Step4Contenido
                  state={formState.step4}
                  servicios={formState.step3.servicios}
                  onChange={updateStep4}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              )}

              {step === 5 && (
                <Step5Invitados
                  state={formState.step5}
                  onChange={updateStep5}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              )}

              {step === 6 && (
                <Step6Revisar
                  formState={formState}
                  templates={templates}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  onGoTo={goTo}
                />
              )}

              {step === 7 && (
                <Step6Pago
                  formState={formState}
                  loading={saving}
                  error={error}
                  onGenerateAndPay={handlePay}
                  onActivarGratis={handleActivarGratis}
                  onValidarCodigo={handleValidarCodigo}
                  onPrev={handlePrev}
                />
              )}

            </div>
          </div>
        </div>

        {/* Right: Preview panel */}
        <div className="hidden lg:flex w-[38%] xl:w-[40%] flex-shrink-0 flex-col bg-[#f0ede8] border-l border-[#e5e7eb] overflow-hidden">
          <div className="flex-shrink-0 px-5 py-3.5 bg-white border-b border-[#e5e7eb] flex items-center justify-between">
            <span className="text-[.72rem] font-semibold uppercase tracking-widest text-[#6b7280]">
              Vista previa en vivo
            </span>
            <span className="text-[.7rem] text-[#9ca3af] bg-[#fdf8f0] px-2.5 py-1 rounded-full">
              {selectedTemplate ? selectedTemplate.nombre : 'Sin selección'}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="overflow-hidden shadow-2xl flex-shrink-0"
              style={{
                width: '260px',
                aspectRatio: '9/16',
                borderRadius: '24px',
                border: '8px solid #2d2926',
              }}
            >
              <WizardLivePreview formState={formState} templates={templates} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
