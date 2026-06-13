import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, X, Music, ImagePlus, PlusCircle, Trash2, Check, Heart, Crown, Cake, Pencil } from 'lucide-react'

import { adminInvitacionService } from '@/services/adminInvitacionService'
import apiClient from '@/services/apiClient'
import type { HistoriaSeccionResponse, MusicaResponse } from '@/services/adminInvitacionService'
import { templateService } from '@/services/templateService'
import { servicioService } from '@/services/servicioService'
import type { Template } from '@/services/templateService'
import type { InvitacionAdmin } from '@/types/adminInvitacion'
import type { WizardStep1, WizardStep2, WizardStep3, ServiceToggle, TipoUbicacion } from '@/types/crearInvitacion'
import { INITIAL_CAMPOS, TEMPLATE_COLORS, COLORES_PALETA } from '@/types/crearInvitacion'
import { TIPO_LABEL } from '@/services/templateService'

import { WizardStepper } from '@/components/admin/crear-invitacion/WizardStepper'
import type { StepDef } from '@/components/admin/crear-invitacion/WizardStepper'
import { Step2Evento } from '@/components/admin/crear-invitacion/Step2Evento'
import { Step3Servicios } from '@/components/admin/crear-invitacion/Step3Servicios'
import { InvitationPreview } from '@/components/landing/InvitationPreview'

// ─── Edit wizard steps ────────────────────────────────────────────────────────

const EDIT_STEPS: StepDef[] = [
  { num: 1, label: 'Template' },
  { num: 2, label: 'Evento' },
  { num: 3, label: 'Servicios' },
  { num: 4, label: 'Contenido' },
  { num: 5, label: 'Guardar' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExistingFoto { id: number; url: string }

interface HistoriaEditable {
  localId: string
  serverId?: number
  texto: string
  orden: number
  imagen: File | null
  imagenPreview: string | null
  existingImagenUrl: string | null
}

interface EditFormState {
  step1: WizardStep1
  step2: WizardStep2
  step3: WizardStep3
  existingFotos: ExistingFoto[]
  removedFotoIds: number[]
  newFotos: File[]
  newFotosPreviews: string[]
  existingMusica: MusicaResponse | null
  removeMusica: boolean
  newMusica: File | null
  newMusicaNombre: string
  historias: HistoriaEditable[]
  activa: boolean
}

// ─── Tipo event options ───────────────────────────────────────────────────────

const TIPO_OPTIONS = [
  { id: 1, label: 'Boda',       icon: Heart, bgColor: '#fce4ec', iconColor: '#c2185b', description: 'Matrimonios y casamientos' },
  { id: 2, label: 'Quinceañera', icon: Crown, bgColor: '#f3e5f5', iconColor: '#7b1fa2', description: 'Celebración de 15 años' },
  { id: 3, label: 'Cumpleaños', icon: Cake,  bgColor: '#fff8e1', iconColor: '#f57f17', description: 'Fiestas de cumpleaños' },
] as const

// ─── Constants ────────────────────────────────────────────────────────────────

const INPUT_CLS = 'w-full px-4 py-3 border-[1.5px] border-[#d1d5db] rounded-xl text-[.9rem] focus:border-[#c5a572] focus:outline-none bg-white transition-colors placeholder:text-[#b0b7c3]'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapInvitacionToFormState(
  inv: InvitacionAdmin,
  historias: HistoriaSeccionResponse[],
  musica: MusicaResponse | null,
  allServices: { id: number; nombre: string; descripcion: string | null; incluidoEnBase: boolean; activo: boolean }[],
): EditFormState {
  const campos = (inv.camposEspecificos ?? {}) as Record<string, unknown>
  const ubicacionesRaw = campos.ubicaciones as unknown[] | undefined
  const modoMultiple = inv.ubicacion === 'multiple' && Array.isArray(ubicacionesRaw) && ubicacionesRaw.length > 0

  const ubicaciones = modoMultiple
    ? (ubicacionesRaw as { tipo: string; nombre: string; direccion: string; latitud: number | string; longitud: number | string; hora?: string }[]).map(u => ({
        tipo: u.tipo as TipoUbicacion,
        nombre: u.nombre,
        direccion: u.direccion,
        latitud: String(u.latitud),
        longitud: String(u.longitud),
        hora: u.hora ?? '',
      }))
    : []

  const { ubicaciones: _ub, ...camposRest } = campos
  const camposEspecificos: Record<string, string> = {}
  for (const [k, v] of Object.entries(camposRest)) {
    camposEspecificos[k] = String(v ?? '')
  }

  const enabledServiceIds = new Set(inv.servicios.filter(s => s.habilitado).map(s => s.servicioId))
  const servicios: ServiceToggle[] = allServices
    .filter(s => s.activo)
    .map(s => ({
      id: s.id,
      nombre: s.nombre,
      descripcion: s.descripcion,
      incluidoEnBase: s.incluidoEnBase,
      enabled: enabledServiceIds.has(s.id),
    }))

  const historiasEdit: HistoriaEditable[] = historias.map(h => ({
    localId: crypto.randomUUID(),
    serverId: h.id,
    texto: h.texto,
    orden: h.orden,
    imagen: null,
    imagenPreview: null,
    existingImagenUrl: h.imagenUrl,
  }))

  const existingFotos: ExistingFoto[] = (inv.fotosAnfitrion ?? []).map(f => ({ id: f.id, url: f.url }))

  const fechaEvento = typeof inv.fechaEvento === 'string'
    ? inv.fechaEvento.split('T')[0]
    : String(inv.fechaEvento)

  return {
    step1: {
      pedidoId: String(inv.pedidoId ?? ''),
      tipoEventoId: inv.tipoEventoId,
      templateId: inv.templateId,
      titulo: inv.titulo,
      colorPrimario: inv.colorPrimario ?? '',
    },
    step2: {
      fechaEvento,
      horaEvento: (inv.horaEvento ?? '').slice(0, 5),
      ubicacion: modoMultiple ? 'multiple' : inv.ubicacion,
      direccion: modoMultiple ? 'multiple' : inv.direccion,
      latitud: modoMultiple ? '0' : String(inv.latitud),
      longitud: modoMultiple ? '0' : String(inv.longitud),
      colorPrimario: inv.colorPrimario ?? '',
      contrasenaAsistentes: inv.contrasenaAsistentes ?? '',
      maxFotos: inv.maxFotos,
      camposEspecificos,
      ubicaciones,
    },
    step3: { servicios },
    existingFotos,
    removedFotoIds: [],
    newFotos: [],
    newFotosPreviews: [],
    existingMusica: musica,
    removeMusica: false,
    newMusica: null,
    newMusicaNombre: '',
    historias: historiasEdit,
    activa: inv.activa,
  }
}

// ─── Step 1 — Template & Datos Básicos ───────────────────────────────────────

function Step1Edit({
  state,
  templates,
  colorPrimario,
  onChange,
  onColorChange,
  onNext,
}: {
  state: WizardStep1
  templates: Template[]
  colorPrimario: string
  onChange: (u: Partial<WizardStep1>) => void
  onColorChange: (color: string) => void
  onNext: () => void
}) {
  const filtered = templates.filter(t => t.activo && (state.tipoEventoId === null || t.tipoEventoId === state.tipoEventoId))
  const canProceed = state.tipoEventoId !== null && state.templateId !== null && state.titulo.trim().length > 0

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-xl font-semibold text-[#2d2926]">Tipo de evento y diseño</h2>
        <p className="text-[.84rem] text-[#6b7280] mt-1">
          Modificá el tipo de celebración, el diseño y el título de la invitación.
        </p>
      </div>

      {/* Read-only pedido badge */}
      {state.pedidoId && (
        <div className="mb-7 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 flex items-center gap-2.5">
          <span className="text-[.78rem] text-[#6b7280]">Pedido asociado:</span>
          <span className="text-[.78rem] font-semibold px-2.5 py-0.5 bg-[#c5a572]/15 text-[#9e7f4e] rounded-full">
            PED-{state.pedidoId.padStart(3, '0')}
          </span>
        </div>
      )}

      {/* Tipo de evento */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[.78rem] font-semibold uppercase tracking-widest text-[#6b7280]">Tipo de evento</span>
          <span className="text-[#dc2626] text-sm leading-none">*</span>
        </div>
        <p className="text-[.76rem] text-[#9ca3af] mb-3">Seleccioná el tipo de celebración para filtrar los diseños disponibles</p>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {TIPO_OPTIONS.map(tipo => {
            const Icon = tipo.icon
            const isSelected = state.tipoEventoId === tipo.id
            return (
              <button
                key={tipo.id}
                type="button"
                onClick={() => onChange({ tipoEventoId: tipo.id, templateId: state.tipoEventoId !== tipo.id ? null : state.templateId })}
                className={[
                  'relative flex flex-col items-center gap-2.5 sm:gap-3 px-2 py-4 sm:p-5 rounded-2xl border-2 transition-all duration-200',
                  isSelected
                    ? 'border-[#c5a572] bg-[#c5a572]/6 shadow-md'
                    : 'border-[#e5e7eb] bg-white hover:border-[#c5a572]/50 hover:shadow-sm hover:-translate-y-0.5',
                ].join(' ')}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-[#c5a572] rounded-full flex items-center justify-center shadow">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
                <div
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: tipo.bgColor }}
                >
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: tipo.iconColor }} />
                </div>
                <div className="text-center">
                  <div className={[
                    'font-semibold text-[.88rem] sm:text-[.95rem] leading-tight',
                    isSelected ? 'text-[#2d2926]' : 'text-[#4a4441]',
                  ].join(' ')}>
                    {tipo.label}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Template gallery */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[.78rem] font-semibold uppercase tracking-widest text-[#6b7280]">Diseño de invitación</span>
          <span className="text-[#dc2626] text-sm leading-none">*</span>
        </div>
        <p className="text-[.76rem] text-[#9ca3af] mb-3">
          {state.tipoEventoId === null
            ? 'Seleccioná primero el tipo de evento'
            : `${filtered.length} diseño${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''} para ${TIPO_LABEL[state.tipoEventoId] ?? 'este tipo'}`}
        </p>

        {state.tipoEventoId === null ? (
          <div className="flex flex-col items-center justify-center py-14 rounded-2xl border-2 border-dashed border-[#e5e7eb] bg-[#fafafa]">
            <div className="w-14 h-14 rounded-2xl bg-[#f0ede8] flex items-center justify-center mb-3">
              <span className="text-2xl">🎨</span>
            </div>
            <p className="text-[.86rem] text-[#9ca3af]">Elegí un tipo de evento para ver los diseños</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center rounded-2xl border border-[#f0f0f0] bg-[#fafafa]">
            <p className="text-[.84rem] text-[#9ca3af]">
              No hay diseños activos para {TIPO_LABEL[state.tipoEventoId] ?? 'este tipo'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map(t => {
              const selected = state.templateId === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChange({ templateId: t.id })}
                  className={[
                    'group relative rounded-2xl overflow-hidden text-left transition-all duration-200',
                    selected
                      ? 'ring-2 ring-[#c5a572] ring-offset-2 shadow-lg'
                      : 'ring-1 ring-[#e5e7eb] hover:ring-[#c5a572]/60 hover:shadow-md hover:-translate-y-0.5',
                  ].join(' ')}
                >
                  <div className="w-full h-64 relative overflow-hidden bg-[#f5f5f5]">
                    <InvitationPreview slug={t.slug} interactive={false} paused={true} />
                    {!selected && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
                    )}
                    {selected && (
                      <div className="absolute inset-0 bg-[#c5a572]/25 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 bg-[#c5a572] rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={['px-3 py-2.5 transition-colors', selected ? 'bg-[#c5a572]/10' : 'bg-white'].join(' ')}>
                    <p className={['text-[.78rem] font-semibold truncate', selected ? 'text-[#9e7f4e]' : 'text-[#2d2926]'].join(' ')}>
                      {t.nombre}
                    </p>
                    {t.descripcion && (
                      <p className="text-[.68rem] text-[#9ca3af] mt-0.5 truncate">{t.descripcion}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Color primario */}
      {state.tipoEventoId && state.templateId && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[.78rem] font-semibold uppercase tracking-widest text-[#6b7280]">Color primario</span>
          </div>
          <p className="text-[.76rem] text-[#9ca3af] mb-3">
            Personaliza el color temático de la invitación.
          </p>
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                title="Predeterminado (según diseño)"
                onClick={() => onColorChange('')}
                className="relative w-9 h-9 rounded-full border-2 transition-all duration-150 hover:scale-110 bg-white overflow-hidden"
                style={{
                  borderColor: colorPrimario === '' ? '#9ca3af' : '#e5e7eb',
                  boxShadow: colorPrimario === '' ? '0 0 0 2px white, 0 0 0 4px #9ca3af' : 'none',
                }}
              >
                <span
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, transparent calc(50% - 1.5px), #dc2626 calc(50% - 1.5px), #dc2626 calc(50% + 1.5px), transparent calc(50% + 1.5px))',
                  }}
                />
                {colorPrimario === '' && <Check className="w-3 h-3 absolute inset-0 m-auto text-gray-600 drop-shadow" />}
              </button>
              {(() => {
                const template = templates.find(t => t.id === state.templateId)
                const paleta = template?.slug && TEMPLATE_COLORS[template.slug]
                  ? (TEMPLATE_COLORS[template.slug] as { hex: string; label: string }[])
                  : (COLORES_PALETA as unknown as { hex: string; label: string }[])
                return paleta.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    onClick={() => onColorChange(c.hex)}
                    className="relative w-9 h-9 rounded-full border-2 transition-all duration-150 hover:scale-110"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: colorPrimario?.toLowerCase() === c.hex.toLowerCase() ? c.hex : 'transparent',
                      boxShadow: colorPrimario?.toLowerCase() === c.hex.toLowerCase()
                        ? `0 0 0 2px white, 0 0 0 4px ${c.hex}`
                        : 'none',
                    }}
                  >
                    {colorPrimario?.toLowerCase() === c.hex.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 absolute inset-0 m-auto drop-shadow text-white" />
                    )}
                  </button>
                ))
              })()}
            </div>
            <p className="mt-2.5 text-[.75rem] text-[#9ca3af]">
              {colorPrimario === '' ? 'Predeterminado (según diseño)' : `Color: ${colorPrimario}`}
            </p>
          </div>
        </div>
      )}

      {/* Título */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[.78rem] font-semibold uppercase tracking-widest text-[#6b7280]">Título del evento</span>
          <span className="text-[#dc2626] text-sm leading-none">*</span>
        </div>
        <p className="text-[.76rem] text-[#9ca3af] mb-2">
          Aparece en el encabezado de la invitación tal cual lo escribís aquí.
        </p>
        <input
          type="text" maxLength={200}
          placeholder="Ej: Boda de María & Joaquín"
          value={state.titulo}
          onChange={e => onChange({ titulo: e.target.value })}
          className={INPUT_CLS}
        />
        <div className="flex justify-end mt-1">
          <span className="text-[.7rem] text-[#b0b7c3]">{state.titulo.length}/200</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
        <div className="text-[.78rem] text-[#9ca3af]">
          {!state.tipoEventoId && 'Seleccioná el tipo de evento'}
          {state.tipoEventoId && !state.templateId && 'Seleccioná un diseño'}
          {state.tipoEventoId && state.templateId && !state.titulo.trim() && 'Completá el título'}
          {canProceed && <span className="text-[#16a34a] font-medium">✓ Listo para continuar</span>}
        </div>
        <button type="button" onClick={onNext} disabled={!canProceed}
          className="px-6 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-xl text-[.88rem] font-semibold hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Continuar →
        </button>
      </div>
    </div>
  )
}

// ─── Step 4 — Contenido (edit-aware) ─────────────────────────────────────────

function Step4ContenidoEdit({
  state,
  servicios,
  onChange,
  onNext,
  onPrev,
}: {
  state: EditFormState
  servicios: ServiceToggle[]
  onChange: (updates: Partial<EditFormState>) => void
  onNext: () => void
  onPrev: () => void
}) {
  const fotosInputRef = useRef<HTMLInputElement>(null)
  const musicaInputRef = useRef<HTMLInputElement>(null)

  function normalize(str: string) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }
  const showMusica   = servicios.some(s => s.enabled && normalize(s.nombre).includes('musica'))
  const showHistoria = servicios.some(s => s.enabled && normalize(s.nombre).includes('historia'))

  // Photos
  function handleNewFotos(files: FileList | null) {
    if (!files) return
    const totalExisting = state.existingFotos.length - state.removedFotoIds.length
    const canAdd = 5 - totalExisting - state.newFotos.length
    const added = Array.from(files).slice(0, canAdd)
    const previews = added.map(f => URL.createObjectURL(f))
    onChange({ newFotos: [...state.newFotos, ...added], newFotosPreviews: [...state.newFotosPreviews, ...previews] })
  }

  function removeExistingFoto(id: number) {
    onChange({ removedFotoIds: [...state.removedFotoIds, id] })
  }

  function undoRemoveExistingFoto(id: number) {
    onChange({ removedFotoIds: state.removedFotoIds.filter(x => x !== id) })
  }

  function removeNewFoto(idx: number) {
    URL.revokeObjectURL(state.newFotosPreviews[idx])
    onChange({
      newFotos: state.newFotos.filter((_, i) => i !== idx),
      newFotosPreviews: state.newFotosPreviews.filter((_, i) => i !== idx),
    })
  }

  const totalFotos = state.existingFotos.length - state.removedFotoIds.length + state.newFotos.length
  const canAddMore  = totalFotos < 5

  // Music
  function handleMusicaFile(files: FileList | null) {
    if (!files?.[0]) return
    onChange({ newMusica: files[0], newMusicaNombre: files[0].name, removeMusica: false })
  }

  // Historias
  function updateHistoria(localId: string, updates: Partial<HistoriaEditable>) {
    onChange({ historias: state.historias.map(h => h.localId === localId ? { ...h, ...updates } : h) })
  }

  function removeHistoria(localId: string) {
    const h = state.historias.find(x => x.localId === localId)
    if (h?.imagenPreview) URL.revokeObjectURL(h.imagenPreview)
    onChange({ historias: state.historias.filter(h => h.localId !== localId) })
  }

  function addHistoria() {
    if (state.historias.length >= 3) return
    onChange({
      historias: [...state.historias, {
        localId: crypto.randomUUID(),
        texto: '',
        orden: state.historias.length + 1,
        imagen: null,
        imagenPreview: null,
        existingImagenUrl: null,
      }],
    })
  }

  function handleHistoriaImage(localId: string, files: FileList | null) {
    if (!files?.[0]) return
    const prev = state.historias.find(h => h.localId === localId)
    if (prev?.imagenPreview) URL.revokeObjectURL(prev.imagenPreview)
    updateHistoria(localId, { imagen: files[0], imagenPreview: URL.createObjectURL(files[0]) })
  }

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-xl font-semibold text-[#2d2926]">Contenido Multimedia</h2>
        <p className="text-[.84rem] text-[#6b7280] mt-1">
          Administrá las fotos, música e historia de la invitación.
        </p>
      </div>

      {/* Fotos */}
      <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 mb-4">
        <h3 className="font-semibold text-[.9rem] mb-3">📷 Fotos del Anfitrión</h3>

        {state.existingFotos.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {state.existingFotos.map((foto, i) => {
              const removed = state.removedFotoIds.includes(foto.id)
              return (
                <div key={foto.id} className={['relative w-20 h-20 rounded-lg overflow-hidden bg-[#f4f5f7] shrink-0', removed ? 'opacity-40' : ''].join(' ')}>
                  <img src={foto.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && !removed && (
                    <span className="absolute bottom-0 left-0 right-0 text-[.6rem] text-center bg-black/50 text-white py-0.5">Header</span>
                  )}
                  {removed ? (
                    <button type="button" onClick={() => undoRemoveExistingFoto(foto.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-[.6rem] font-medium">
                      Deshacer
                    </button>
                  ) : (
                    <button type="button" onClick={() => removeExistingFoto(foto.id)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-[#dc2626] text-white flex items-center justify-center hover:bg-[#b91c1c]">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {state.newFotosPreviews.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {state.newFotosPreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#f4f5f7] shrink-0">
                <img src={src} alt={`Nueva ${i + 1}`} className="w-full h-full object-cover" />
                <span className="absolute top-0 left-0 bg-[#c5a572] text-white text-[.55rem] px-1 py-0.5">Nueva</span>
                <button type="button" onClick={() => removeNewFoto(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-[#dc2626] text-white flex items-center justify-center hover:bg-[#b91c1c]">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {canAddMore && (
          <button type="button" onClick={() => fotosInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-[#d1d5db] rounded-lg hover:border-[#c5a572] hover:bg-[rgba(197,165,114,.03)] transition-colors text-[#6b7280]">
            <ImagePlus className="w-6 h-6 mb-1.5" />
            <span className="text-[.82rem]">Agregar fotos</span>
            <span className="text-[.7rem] text-[#9ca3af] mt-0.5">JPG, PNG, WebP · Máx. 5 MB c/u · {5 - totalFotos} restante{5 - totalFotos !== 1 ? 's' : ''}</span>
          </button>
        )}
        <input ref={fotosInputRef} type="file" accept="image/*" multiple hidden onChange={e => handleNewFotos(e.target.files)} />
      </div>

      {/* Música */}
      {showMusica && (
        <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 mb-4">
          <h3 className="font-semibold text-[.9rem] mb-1">🎵 Música</h3>
          <p className="text-[.76rem] text-[#6b7280] mb-3">Se reproduce automáticamente al abrir la invitación. MP3 · Máx. 20 MB.</p>

          {state.existingMusica && !state.removeMusica && !state.newMusica && (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[#f4f5f7] rounded-lg mb-2">
              <Music className="w-4 h-4 text-[#c5a572] shrink-0" />
              <span className="text-[.82rem] flex-1 truncate text-[#2d2926]">Música actual (subida)</span>
              <button type="button" onClick={() => onChange({ removeMusica: true })}
                className="text-[#9ca3af] hover:text-[#dc2626] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {state.removeMusica && !state.newMusica && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#fee2e2] text-[#dc2626] rounded-lg mb-2 text-[.8rem]">
              <span className="flex-1">La música se eliminará al guardar.</span>
              <button type="button" onClick={() => onChange({ removeMusica: false })} className="underline shrink-0">Deshacer</button>
            </div>
          )}

          {state.newMusica ? (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[#f4f5f7] rounded-lg">
              <Music className="w-4 h-4 text-[#c5a572] shrink-0" />
              <span className="text-[.82rem] flex-1 truncate">{state.newMusicaNombre}</span>
              <button type="button" onClick={() => onChange({ newMusica: null, newMusicaNombre: '' })}
                className="text-[#9ca3af] hover:text-[#dc2626] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => musicaInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full py-5 border-2 border-dashed border-[#d1d5db] rounded-lg hover:border-[#c5a572] hover:bg-[rgba(197,165,114,.03)] transition-colors text-[#6b7280]">
              <Music className="w-5 h-5 mb-1.5" />
              <span className="text-[.82rem]">{state.existingMusica ? 'Reemplazar música' : 'Subir música (MP3)'}</span>
            </button>
          )}
          <input ref={musicaInputRef} type="file" accept=".mp3,audio/mpeg" hidden onChange={e => handleMusicaFile(e.target.files)} />
        </div>
      )}

      {/* Historias */}
      {showHistoria && (
        <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 mb-4">
          <h3 className="font-semibold text-[.9rem] mb-1">📖 Historia</h3>
          <p className="text-[.76rem] text-[#6b7280] mb-3">Hasta 3 secciones con texto e imagen opcional.</p>

          {state.historias.map((h, i) => (
            <div key={h.localId} className="bg-[#f4f5f7] rounded-lg p-3 mb-2 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[.78rem] font-semibold text-[#2d2926]">
                  Sección {i + 1} de 3{h.serverId ? '' : ' (nueva)'}
                </span>
                <button type="button" onClick={() => removeHistoria(h.localId)}
                  className="text-[#6b7280] hover:text-[#dc2626] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                maxLength={3000} rows={3} placeholder="Contá tu historia..."
                value={h.texto}
                onChange={e => updateHistoria(h.localId, { texto: e.target.value })}
                className="w-full px-3 py-2 border-[1.5px] border-[#d1d5db] rounded-lg text-[.85rem] focus:border-[#c5a572] focus:outline-none resize-none bg-white transition-colors mb-2"
              />
              <div className="flex items-center gap-2">
                {(h.imagenPreview || h.existingImagenUrl) ? (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#d1d5db] shrink-0">
                    <img src={h.imagenPreview ?? h.existingImagenUrl!} alt="preview" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => updateHistoria(h.localId, { imagen: null, imagenPreview: null, existingImagenUrl: null })}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d1d5db] rounded-lg text-[.76rem] text-[#6b7280] cursor-pointer hover:border-[#c5a572] transition-colors bg-white">
                    <ImagePlus className="w-3.5 h-3.5" />
                    Imagen
                    <input type="file" accept="image/*" hidden onChange={e => handleHistoriaImage(h.localId, e.target.files)} />
                  </label>
                )}
                <span className="text-[.7rem] text-[#9ca3af] ml-auto">{h.texto.length}/3000</span>
              </div>
            </div>
          ))}

          {state.historias.length < 3 && (
            <button type="button" onClick={addHistoria}
              className="flex items-center gap-2 px-3 py-2 text-[.82rem] text-[#6b7280] hover:text-[#2d2926] border border-dashed border-[#d1d5db] rounded-lg hover:border-[#2d2926] transition-colors w-full justify-center mt-1">
              <PlusCircle className="w-4 h-4" />
              Agregar sección
            </button>
          )}
        </div>
      )}

      {!showMusica && !showHistoria && (
        <p className="text-[.82rem] text-[#9ca3af] bg-[#f4f5f7] rounded-lg px-4 py-3 mb-4">
          💡 Habilitá los servicios de Música o Historia en el paso anterior para ver más opciones aquí.
        </p>
      )}

      <div className="flex justify-between mt-2 pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-xl text-[.88rem] font-medium hover:border-[#2d2926] transition-colors">
          ← Anterior
        </button>
        <button type="button" onClick={onNext}
          className="px-6 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-xl text-[.88rem] font-semibold hover:bg-[#4a4441] transition-colors">
          Revisar →
        </button>
      </div>
    </div>
  )
}

// ─── Step 5 — Revisar y Guardar ───────────────────────────────────────────────

function Step5Guardar({
  state,
  templates,
  loading,
  error,
  onSave,
  onPrev,
  onGoTo,
  onToggleActiva,
}: {
  state: EditFormState
  templates: Template[]
  loading: boolean
  error: string | null
  onSave: () => void
  onPrev: () => void
  onGoTo: (step: number) => void
  onToggleActiva: (val: boolean) => void
}) {
  const tpl       = templates.find(t => t.id === state.step1.templateId)
  const esMultiple = state.step2.ubicacion === 'multiple'
  const enabled   = state.step3.servicios.filter(s => s.enabled)

  const ubicacionOk = esMultiple
    ? state.step2.ubicaciones.length >= 1 &&
      state.step2.ubicaciones.every(u => u.nombre.trim() && u.direccion.trim() && u.latitud && u.longitud)
    : !!(state.step2.ubicacion && state.step2.direccion && state.step2.latitud && state.step2.longitud)

  const checks = [
    { ok: !!state.step1.tipoEventoId && !!state.step1.templateId && !!state.step1.titulo.trim(), text: 'Tipo, template y título definidos', step: 1 },
    { ok: !!(state.step2.fechaEvento && state.step2.horaEvento) && ubicacionOk, text: 'Datos del evento completos', step: 2 },
    { ok: state.step3.servicios.length > 0, text: 'Servicios configurados', step: 3 },
  ]
  const canSave = checks.every(c => c.ok)

  function ReviewCard({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
    return (
      <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[.78rem] font-semibold text-[#6b7280] uppercase tracking-wider">{title}</h4>
          <button
            type="button"
            onClick={() => onGoTo(step)}
            className="flex items-center gap-1 text-[.72rem] text-[#c5a572] hover:text-[#9e7f4e] font-medium transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Editar
          </button>
        </div>
        <div className="space-y-1.5 text-[.84rem]">{children}</div>
      </div>
    )
  }

  function Row({ label, value, dim }: { label: string; value: React.ReactNode; dim?: boolean }) {
    return (
      <div className="flex gap-2 flex-wrap leading-snug">
        <span className="text-[#9ca3af] shrink-0 min-w-[80px]">{label}</span>
        <span className={dim ? 'text-[#9ca3af] italic' : 'text-[#2d2926] font-medium'}>{value ?? '—'}</span>
      </div>
    )
  }

  function CheckItem({ ok, text }: { ok: boolean; text: string }) {
    return (
      <div className="flex items-center gap-2.5 text-[.84rem]">
        <span className={['w-5 h-5 rounded-full flex items-center justify-center text-[.65rem] font-bold text-white shrink-0', ok ? 'bg-[#16a34a]' : 'bg-[#dc2626]'].join(' ')}>
          {ok ? '✓' : '✕'}
        </span>
        <span className={ok ? 'text-[#2d2926]' : 'text-[#dc2626]'}>{text}</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-xl font-semibold text-[#2d2926]">Revisar y guardar</h2>
        <p className="text-[.84rem] text-[#6b7280] mt-1">
          Revisá los datos antes de guardar. Podés editar cada sección haciendo click en "Editar".
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <ReviewCard title="Tipo y diseño" step={1}>
          <Row label="Tipo"    value={TIPO_LABEL[state.step1.tipoEventoId!] ?? '—'} />
          <Row label="Diseño"  value={tpl?.nombre ?? '—'} />
          <Row label="Título"  value={state.step1.titulo || '—'} dim={!state.step1.titulo} />
          {state.step1.pedidoId && <Row label="Pedido" value={`PED-${state.step1.pedidoId.padStart(3, '0')}`} />}
        </ReviewCard>

        <ReviewCard title="Fecha y lugar" step={2}>
          <Row label="Fecha"  value={state.step2.fechaEvento || '—'} dim={!state.step2.fechaEvento} />
          <Row label="Hora"   value={state.step2.horaEvento || '—'} dim={!state.step2.horaEvento} />
          {esMultiple
            ? state.step2.ubicaciones.map(u => <Row key={u.tipo} label={u.tipo} value={u.nombre || '—'} />)
            : <Row label="Lugar" value={state.step2.ubicacion || '—'} dim={!state.step2.ubicacion} />
          }
        </ReviewCard>

        <ReviewCard title="Servicios" step={3}>
          {enabled.length === 0
            ? <span className="text-[#9ca3af] italic text-[.84rem]">Ninguno seleccionado</span>
            : (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {enabled.map(s => (
                  <span key={s.id} className={[
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[.74rem] font-medium',
                    s.incluidoEnBase ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#f4f0ea] text-[#4a4441]',
                  ].join(' ')}>
                    {s.nombre}{s.incluidoEnBase && <span className="text-[.6rem]">✓</span>}
                  </span>
                ))}
              </div>
            )
          }
        </ReviewCard>

        <ReviewCard title="Contenido" step={4}>
          <Row label="Fotos exist."
            value={`${state.existingFotos.length - state.removedFotoIds.length} (−${state.removedFotoIds.length} eliminadas)`}
          />
          <Row label="Fotos nuevas" value={state.newFotos.length > 0 ? `${state.newFotos.length} para subir` : 'ninguna'} dim={state.newFotos.length === 0} />
          <Row label="Música"
            value={state.removeMusica ? 'Se eliminará' : state.newMusica ? state.newMusicaNombre : state.existingMusica ? 'Sin cambios' : 'Sin música'}
            dim={!state.removeMusica && !state.newMusica && !state.existingMusica}
          />
          <Row label="Historias" value={`${state.historias.length} sección${state.historias.length !== 1 ? 'es' : ''}`} />
        </ReviewCard>
      </div>

      {/* Estado activa toggle */}
      <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 sm:p-5 mb-5 flex items-center gap-4">
        <label className="relative w-11 h-6 shrink-0 cursor-pointer">
          <input type="checkbox" checked={state.activa}
            onChange={e => onToggleActiva(e.target.checked)}
            className="sr-only peer" />
          <span className={['absolute inset-0 rounded-full transition-colors cursor-pointer', state.activa ? 'bg-[#c5a572]' : 'bg-[#d1d5db]'].join(' ')} />
          <span className={['absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform', state.activa ? 'translate-x-[22px]' : 'translate-x-[3px]'].join(' ')} />
        </label>
        <div>
          <div className="font-medium text-[.9rem] text-[#2d2926]">Invitación {state.activa ? 'activa' : 'inactiva'}</div>
          <div className="text-[.76rem] text-[#6b7280]">{state.activa ? 'Visible para los invitados' : 'No visible para los invitados'}</div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 sm:p-5 mb-5">
        <h4 className="text-[.78rem] font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Checklist de requisitos</h4>
        <div className="space-y-2">
          {checks.map((c, i) => <CheckItem key={i} ok={c.ok} text={c.text} />)}
        </div>
        {!canSave && (
          <p className="mt-3 text-[.78rem] text-[#f59e0b] bg-[#fffbeb] rounded-lg px-3 py-2">
            ⚠ Completá los items marcados en rojo antes de guardar.
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 bg-[#fee2e2] text-[#dc2626] rounded-2xl mb-4 text-[.85rem]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev} disabled={loading}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-xl text-[.88rem] font-medium hover:border-[#2d2926] disabled:opacity-40 transition-colors">
          ← Anterior
        </button>
        <button type="button" onClick={onSave} disabled={!canSave || loading}
          className="flex items-center gap-2.5 px-7 py-3 bg-[#c5a572] text-white rounded-xl text-[.95rem] font-semibold hover:bg-[#9e7f4e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Guardando…' : '💾 Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function EditarInvitacionPage({ variant = 'admin' }: { variant?: 'admin' | 'client' } = {}) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const backPath = variant === 'client' ? '/client/dashboard' : '/admin/invitaciones'

  const [loadingData, setLoadingData] = useState(true)
  const [dataError,   setDataError]   = useState<string | null>(null)
  const [templates,   setTemplates]   = useState<Template[]>([])
  const [formState,   setFormState]   = useState<EditFormState | null>(null)
  const [originalHistoriaIds, setOriginalHistoriaIds] = useState<number[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [saving,      setSaving]      = useState(false)
  const [saveError,   setSaveError]   = useState<string | null>(null)
  const [saved,       setSaved]       = useState(false)

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      try {
        const invPromise = variant === 'client'
          ? apiClient.get<InvitacionAdmin>(`/client/invitaciones/${id!}`).then(r => r.data)
          : adminInvitacionService.getById(id!)
        const [inv, historias, musica, tpls, svcs] = await Promise.all([
          invPromise,
          adminInvitacionService.getHistorias(id!),
          adminInvitacionService.getMusica(id!),
          templateService.getAll(),
          servicioService.getAll(),
        ])
        if (cancelled) return

        setTemplates(tpls)
        setOriginalHistoriaIds(historias.map(h => h.id))
        setFormState(mapInvitacionToFormState(inv, historias, musica, svcs))
      } catch {
        if (!cancelled) setDataError('Error al cargar la invitación. Verificá que el ID sea correcto.')
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  // ── Updaters ───────────────────────────────────────────────────────────────

  const updateStep1 = useCallback((updates: Partial<WizardStep1>) => {
    setFormState(prev => {
      if (!prev) return prev
      const next = { ...prev, step1: { ...prev.step1, ...updates } }
      if ('tipoEventoId' in updates && updates.tipoEventoId !== prev.step1.tipoEventoId) {
        next.step2 = {
          ...prev.step2,
          camposEspecificos: updates.tipoEventoId ? { ...(INITIAL_CAMPOS[updates.tipoEventoId] ?? {}) } : {},
        }
      }
      return next
    })
  }, [])

  const updateStep2 = useCallback((updates: Partial<WizardStep2>) => {
    setFormState(prev => prev ? { ...prev, step2: { ...prev.step2, ...updates } } : prev)
  }, [])

  const updateStep3 = useCallback((updates: Partial<WizardStep3>) => {
    setFormState(prev => prev ? { ...prev, step3: { ...prev.step3, ...updates } } : prev)
  }, [])

  const updateFormState = useCallback((updates: Partial<EditFormState>) => {
    setFormState(prev => prev ? { ...prev, ...updates } : prev)
  }, [])

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!formState || !id) return
    setSaving(true)
    setSaveError(null)

    const { step1, step2, step3 } = formState
    const modoMultiple = step2.ubicaciones.length > 0

    const camposBase   = { ...step2.camposEspecificos }
    const camposFinales = modoMultiple
      ? { ...camposBase, ubicaciones: step2.ubicaciones }
      : camposBase

    const serviciosIds = step3.servicios.filter(s => s.enabled).map(s => s.id)

    try {
      const updatePayload = {
        templateId:   step1.templateId!,
        tipoEventoId: step1.tipoEventoId!,
        titulo:       step1.titulo.trim(),
        fechaEvento:  step2.fechaEvento,
        horaEvento:   step2.horaEvento,
        ubicacion:    modoMultiple ? 'multiple' : step2.ubicacion.trim(),
        direccion:    modoMultiple ? 'multiple' : step2.direccion.trim(),
        latitud:      modoMultiple ? 0 : Number(step2.latitud),
        longitud:     modoMultiple ? 0 : Number(step2.longitud),
        colorPrimario: step2.colorPrimario || null,
        contrasenaAsistentes: step2.contrasenaAsistentes.trim() || undefined,
        maxFotos:     step2.maxFotos,
        camposEspecificos: Object.keys(camposFinales).length > 0 ? camposFinales : undefined,
        serviciosIds,
        activa: formState.activa,
      }

      if (variant === 'client') {
        await apiClient.put(`/client/invitaciones/${id}`, updatePayload)
      } else {
        await adminInvitacionService.update(id, updatePayload)
      }

      for (const fotoId of formState.removedFotoIds) {
        if (variant === 'client') {
          await apiClient.delete(`/client/invitaciones/${id}/fotos-anfitrion/${fotoId}`)
        } else {
          await adminInvitacionService.deleteFotoAnfitrion(id, fotoId)
        }
      }

      if (formState.newFotos.length > 0) {
        if (variant === 'client') {
          const fd = new FormData()
          formState.newFotos.forEach(f => fd.append('fotos', f))
          await apiClient.post(`/client/invitaciones/${id}/fotos-anfitrion`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } else {
          await adminInvitacionService.addFotosAnfitrion(id, formState.newFotos)
        }
      }

      if (formState.removeMusica && formState.existingMusica) {
        await adminInvitacionService.deleteMusica(id)
      }
      if (formState.newMusica) {
        await adminInvitacionService.uploadMusica(id, formState.newMusica)
      }

      const currentServerIds = new Set(
        formState.historias.filter(h => h.serverId !== undefined).map(h => h.serverId!)
      )

      for (const serverId of originalHistoriaIds) {
        if (!currentServerIds.has(serverId)) {
          await adminInvitacionService.deleteHistoria(id, serverId)
        }
      }

      for (const h of formState.historias) {
        if (h.serverId !== undefined) {
          const removeImagen = h.existingImagenUrl === null && h.imagen === null
          await adminInvitacionService.updateHistoria(id, h.serverId, h.texto, h.orden, h.imagen, removeImagen)
        } else {
          await adminInvitacionService.createHistoria(id, h.texto, h.orden, h.imagen)
        }
      }

      setSaved(true)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setSaveError(Array.isArray(msg) ? msg.join('. ') : (msg ?? 'Error al guardar. Intentá de nuevo.'))
    } finally {
      setSaving(false)
    }
  }

  function goTo(step: number) {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step)
      setSaveError(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  // For the client variant the page renders standalone (no AdminLayout),
  // so it provides its own top bar. For admin it renders inline as before.
  function Shell({ children }: { children: React.ReactNode }) {
    if (variant !== 'client') return <>{children}</>
    return (
      <div className="min-h-screen bg-[#fcfaf8] text-[#2d2926]">
        <header className="bg-white border-b border-[#f3f0ea] px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="font-display text-2xl font-semibold">
            festejá<span className="text-[#c5a572] italic">.</span>
          </div>
          <button
            onClick={() => navigate(backPath)}
            className="text-[.9rem] font-medium text-[#6b7280] hover:text-[#2d2926] transition-colors"
          >
            ← Volver a mi panel
          </button>
        </header>
        <main className="max-w-5xl mx-auto px-6 sm:px-8 py-10">{children}</main>
      </div>
    )
  }

  if (loadingData) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-24 text-[#6b7280] text-[.9rem]">
          <span className="animate-spin mr-2 inline-block w-5 h-5 border-2 border-[#c5a572] border-t-transparent rounded-full" />
          Cargando invitación…
        </div>
      </Shell>
    )
  }

  if (dataError) {
    return <Shell><div className="py-16 text-center text-[#dc2626] text-[.9rem]">{dataError}</div></Shell>
  }

  if (!formState) return null

  if (saved) {
    return (
      <Shell>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[#dcfce7] flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-[#16a34a]" />
        </div>
        <h2 className="text-xl font-semibold text-[#2d2926] mb-2">¡Cambios guardados!</h2>
        <p className="text-[.88rem] text-[#6b7280] mb-6">La invitación fue actualizada correctamente.</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setSaved(false); setSaveError(null) }}
            className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-xl text-[.88rem] font-medium hover:border-[#2d2926] transition-colors"
          >
            Seguir editando
          </button>
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="px-5 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-xl text-[.88rem] font-medium hover:bg-[#4a4441] transition-colors"
          >
            {variant === 'client' ? 'Volver a mi panel' : 'Volver al listado'}
          </button>
        </div>
      </div>
      </Shell>
    )
  }

  return (
    <Shell>
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-[#2d2926]">Editar Invitación</h1>
        <span className="text-[.78rem] text-[#9ca3af] font-mono">{id}</span>
      </div>
      <p className="text-[.84rem] text-[#6b7280] mb-8">
        Modificá los datos, diseño y contenido de la invitación paso a paso.
      </p>

      <WizardStepper current={currentStep} onGoBack={goTo} steps={EDIT_STEPS} />

      <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-6 sm:p-8">
        {currentStep === 1 && (
          <Step1Edit
            state={formState.step1}
            templates={templates}
            colorPrimario={formState.step2.colorPrimario}
            onChange={updateStep1}
            onColorChange={color => updateStep2({ colorPrimario: color })}
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
          />
        )}

        {currentStep === 4 && (
          <Step4ContenidoEdit
            state={formState}
            servicios={formState.step3.servicios}
            onChange={updateFormState}
            onNext={() => goTo(5)}
            onPrev={() => goTo(3)}
          />
        )}

        {currentStep === 5 && (
          <Step5Guardar
            state={formState}
            templates={templates}
            loading={saving}
            error={saveError}
            onSave={handleSave}
            onPrev={() => goTo(4)}
            onGoTo={goTo}
            onToggleActiva={val => setFormState(prev => prev ? { ...prev, activa: val } : prev)}
          />
        )}
      </div>
    </div>
    </Shell>
  )
}
