import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import apiClient from '@/services/apiClient'

import type { WizardFormState, ServiceToggle } from '@/types/crearInvitacion'
import { createInitialFormState } from '@/types/crearInvitacion'
import { templateService } from '@/services/templateService'
import { servicioService } from '@/services/servicioService'
import type { Template } from '@/services/templateService'
import { getEventConfig } from '@/config/eventoConfig'

import { Step1DatosBasicos } from '@/components/client/crear-invitacion/Step1DatosBasicos'
import { Step2Evento } from '@/components/client/crear-invitacion/Step2Evento'
import { Step3Servicios } from '@/components/client/crear-invitacion/Step3Servicios'
import { Step4Contenido } from '@/components/client/crear-invitacion/Step4Contenido'
import { Step6Pago } from '@/components/client/crear-invitacion/Step6Pago'

const STEPS = [
  { num: 1, label: 'Básico' },
  { num: 2, label: 'Servicios' },
  { num: 3, label: 'Evento' },
  { num: 4, label: 'Contenido' },
  { num: 5, label: 'Pago' },
]
import { useAuth } from '@/context/useAuth'

export default function CrearInvitacionWizard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [templates, setTemplates] = useState<Template[]>([])
  const [formState, setFormState] = useState<WizardFormState>(createInitialFormState())
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [tempRes, svcsRes] = await Promise.all([
          templateService.getAll(),
          servicioService.getAll(),
        ])
        setTemplates(tempRes)

        // Build service toggles
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
          // Implementar precarga de datos para edición de borradores
          const invRes = await apiClient.get(`/client/invitaciones/${editId}`)
          const inv = invRes.data
          setIsPaid(inv.estadoPago === 'PAGADO')
          // Precarga básica por ahora
          setFormState(prev => ({
            ...prev,
            step1: {
              ...prev.step1,
              tipoEventoId: inv.tipoEvento?.id || null,
              templateId: inv.template?.id || null,
              titulo: inv.titulo || '',
              nombreHomenajeados: inv.camposEspecificos?.nombreHomenajeados || inv.camposEspecificos?.nombre || '',
              nombreNovio1: inv.camposEspecificos?.novio1 || '',
              nombreNovio2: inv.camposEspecificos?.novio2 || '',
              colorPrimario: inv.colorPrimario || '',
            },
            step2: {
              ...prev.step2,
              fechaEvento: inv.fechaEvento ? new Date(inv.fechaEvento).toISOString().split('T')[0] : '',
              horaEvento: inv.horaEvento || '',
              ubicacion: inv.ubicacion === 'multiple' ? 'multiple' : (inv.ubicacion || ''),
              direccion: inv.direccion === 'multiple' ? 'multiple' : (inv.direccion || ''),
              googleMapsUrl: inv.camposEspecificos?.googleMapsUrl || '',
              ubicaciones: inv.camposEspecificos?.ubicaciones || [],
              camposEspecificos: inv.camposEspecificos || {},
            }
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

  // Updaters
  const updateStep1 = useCallback((updates: Partial<WizardFormState['step1']>) => {
    setFormState(prev => {
      const next = { ...prev, step1: { ...prev.step1, ...updates } }
      if ('tipoEventoId' in updates && updates.tipoEventoId !== prev.step1.tipoEventoId) {
        const config = getEventConfig(updates.tipoEventoId ?? null)
        next.step2 = {
          ...prev.step2,
          camposEspecificos: { ...(config.initialCampos) },
        }
      }
      return next
    })
  }, [])
  const updateStep2 = useCallback((u: Partial<WizardFormState['step2']>) => setFormState(p => ({ ...p, step2: { ...p.step2, ...u } })), [])
  const updateStep3 = useCallback((u: Partial<WizardFormState['step3']>) => setFormState(p => ({ ...p, step3: { ...p.step3, ...u } })), [])
  const updateStep4 = useCallback((u: Partial<WizardFormState['step4']>) => setFormState(p => ({ ...p, step4: { ...p.step4, ...u } })), [])

  const handleNext = () => { setError(null); setStep(s => s + 1) }
  const handlePrev = () => { setError(null); setStep(s => s - 1) }
  const goTo = (s: number) => { if (s >= 1 && s <= 5) { setError(null); setStep(s) } }

  const buildPayload = () => {
    let novio1 = formState.step2.camposEspecificos.novio1 || ''
    let novio2 = formState.step2.camposEspecificos.novio2 || ''
    let nombre = formState.step2.camposEspecificos.nombre || ''

    const config = getEventConfig(formState.step1.tipoEventoId)

    if (config.nombresType === 'novios') {
      novio1 = formState.step1.nombreNovio1?.trim() || novio1
      novio2 = formState.step1.nombreNovio2?.trim() || novio2
    } else if (config.nombresType === 'homenajeado' && formState.step1.nombreHomenajeados) {
      nombre = formState.step1.nombreHomenajeados.trim()
    }

    return {
      tipoEventoId: formState.step1.tipoEventoId,
      templateId: formState.step1.templateId,
      titulo: formState.step1.titulo,
      colorPrimario: formState.step1.colorPrimario,
      fechaEvento: formState.step2.fechaEvento,
      horaEvento: formState.step2.horaEvento,
      ubicacion: formState.step2.ubicacion,
      direccion: formState.step2.direccion,
      latitud: 0,
      longitud: 0,
      camposEspecificos: {
        ...formState.step2.camposEspecificos,
        nombreHomenajeados: formState.step1.nombreHomenajeados,
        googleMapsUrl: formState.step2.googleMapsUrl,
        ubicaciones: formState.step2.ubicaciones,
        novio1,
        novio2,
        nombre,
      },
      serviciosIds: formState.step3.servicios.filter(s => s.enabled).map(s => s.id)
    }
  }


  const handlePay = async () => {
    setSaving(true)
    setError(null)
    try {
      // 1. Asegurar guardado básico
      let currentId = editId
      const payload = buildPayload() as any
      
      if (!currentId) {
        const res = await apiClient.post('/client/invitaciones', payload)
        currentId = res.data.id
      } else {
        await apiClient.put(`/client/invitaciones/${currentId}`, payload)
      }

      // TODO: Guardar servicios, fotos, historias e invitados usando el service si fuera necesario.

      // 2. Crear preferencia MP
      const totalPrecio = 30000 + formState.step3.servicios.filter(s => !s.incluidoEnBase && s.enabled).reduce((sum, s) => sum + Number(s.precio), 0)

      const prefRes = await apiClient.post(`/pagos/crear-preferencia/${currentId}`, {
        title: formState.step1.titulo,
        price: totalPrecio
      })

      // 3. Redirigir a MercadoPago
      window.location.href = prefRes.data.init_point
    } catch (err) {
      console.error(err)
      setError('Error al procesar el pago. Por favor intenta nuevamente.')
      setSaving(false)
    }
  }

  const handleSimulatePay = async () => {
    setSaving(true)
    setError(null)
    try {
      let currentId = editId
      const payload = buildPayload() as any
      
      if (!currentId) {
        const res = await apiClient.post('/client/invitaciones', payload)
        currentId = res.data.id
      } else {
        await apiClient.put(`/client/invitaciones/${currentId}`, payload)
      }

      await apiClient.post(`/pagos/simular-pago-exitoso/${currentId}`)
      navigate('/client/dashboard?payment=success')
    } catch (err) {
      console.error(err)
      setError('Error al simular el pago localmente.')
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fcfaf8]"><Loader2 className="w-8 h-8 animate-spin text-[#c5a572]" /></div>

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#2d2926] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#f3f0ea] px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="font-display text-2xl font-semibold cursor-pointer" onClick={() => navigate('/client/dashboard')}>
          festejá<span className="text-[#c5a572] italic">.</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <button onClick={() => navigate('/client/dashboard')} className="text-[.85rem] font-medium text-[#6b7280] hover:text-[#2d2926]">Cancelar</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10">

        {/* Stepper */}
        <div className="flex items-end gap-0 overflow-x-auto pb-1 mb-8 border-b border-[#e5e7eb] hide-scrollbar">
          {STEPS.map((s, i) => {
            const isDone = s.num < step
            const isActive = s.num === step
            return (
              <div key={s.num} className="flex items-center">
                <button
                  type="button"
                  onClick={() => isDone && goTo(s.num)}
                  disabled={!isDone}
                  className={[
                    'flex items-center gap-2 px-3 py-2.5 whitespace-nowrap text-[.82rem] border-b-2 -mb-px transition-colors',
                    isActive ? 'text-[#2d2926] font-semibold border-[#c5a572]'
                      : isDone ? 'text-[#16a34a] border-transparent hover:border-[#16a34a]/40 cursor-pointer'
                        : 'text-[#9ca3af] border-transparent cursor-default',
                  ].join(' ')}
                >
                  <span className={[
                    'w-6 h-6 rounded-full flex items-center justify-center text-[.7rem] font-semibold border-[1.5px] shrink-0 transition-colors',
                    isActive ? 'bg-[#c5a572] border-[#c5a572] text-white'
                      : isDone ? 'bg-[#16a34a] border-[#16a34a] text-white'
                        : 'border-[#d1d5db] text-[#9ca3af]',
                  ].join(' ')}>
                    {isDone ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <div className="w-4 sm:w-8 h-px bg-[#e5e7eb] shrink-0 mx-0.5 mb-0.5" />}
              </div>
            )
          })}
        </div>

        {/* Form Steps */}
        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-sm border border-[#f3f0ea]">
          {step === 1 && (
            <Step1DatosBasicos state={formState.step1} onChange={updateStep1} templates={templates} onNext={handleNext} isPaid={isPaid} />
          )}

          {step === 2 && (
            <Step3Servicios state={formState.step3} onChange={updateStep3} onNext={handleNext} onPrev={handlePrev} />
          )}

          {step === 3 && (
            <Step2Evento state={formState.step2} servicios={formState.step3.servicios} tipoEventoId={formState.step1.tipoEventoId} templateSlug={templates.find(t => t.id === formState.step1.templateId)?.slug ?? null} colorPrimario={formState.step1.colorPrimario} onColorChange={(c) => updateStep1({ colorPrimario: c })} onChange={updateStep2} onNext={handleNext} onPrev={handlePrev} />
          )}

          {step === 4 && (
            <Step4Contenido state={formState.step4} servicios={formState.step3.servicios} onChange={updateStep4} onNext={handleNext} onPrev={handlePrev} />
          )}

          {step === 5 && (
            <Step6Pago formState={formState} loading={saving} error={error} onGenerateAndPay={handlePay} onPrev={handlePrev} onSimulateDevPayment={handleSimulatePay} />
          )}
        </div>
      </main>
    </div>
  )
}
