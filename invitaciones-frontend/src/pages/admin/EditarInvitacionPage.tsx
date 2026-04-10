import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, X, Music, ImagePlus, PlusCircle, Trash2, Check } from 'lucide-react'

import { adminInvitacionService } from '@/services/adminInvitacionService'
import type { HistoriaSeccionResponse, MusicaResponse } from '@/services/adminInvitacionService'
import { templateService } from '@/services/templateService'
import { servicioService } from '@/services/servicioService'
import type { Template } from '@/services/templateService'
import type { InvitacionAdmin } from '@/types/adminInvitacion'
import type { WizardStep1, WizardStep2, WizardStep3, ServiceToggle } from '@/types/crearInvitacion'
import { INITIAL_CAMPOS } from '@/types/crearInvitacion'
import { TIPO_LABEL } from '@/services/templateService'

import { Step2Evento } from '@/components/admin/crear-invitacion/Step2Evento'
import { Step3Servicios } from '@/components/admin/crear-invitacion/Step3Servicios'

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

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPO_OPTIONS = [
  { id: 1, label: 'Boda' },
  { id: 2, label: 'Quinceañera' },
  { id: 3, label: 'Cumpleaños' },
]

const GRADIENTS = [
  'linear-gradient(135deg,#f7ede3,#efe0cc)',
  'linear-gradient(135deg,#e8f0e6,#d4ddd0)',
  'linear-gradient(135deg,#fff,#f5f5f5)',
  'linear-gradient(135deg,#fce4ec,#f8d0dc)',
  'linear-gradient(135deg,#1a1a3a,#2a2a5a)',
  'linear-gradient(135deg,#fef9f0,#fdf0f5)',
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#f5f0ea,#ebe5dd)',
  'linear-gradient(135deg,#fff3e0,#ffe0b2)',
]

const GRADIENT_TEXT = [
  '#2d2926','#3a5a3a','#2d2926','#5a3a4a',
  '#e0d0ff','#6a4a5a','#ff6fd8','#2d2926','#e65100',
]

const INPUT_CLS = 'w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] focus:border-[#c5a572] focus:outline-none bg-white transition-colors'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapInvitacionToFormState(
  inv: InvitacionAdmin,
  historias: HistoriaSeccionResponse[],
  musica: MusicaResponse | null,
  allServices: { id: number; nombre: string; descripcion: string | null; incluidoEnBase: boolean; activo: boolean }[],
): EditFormState {
  // Detect multiple locations mode
  const campos = (inv.camposEspecificos ?? {}) as Record<string, unknown>
  const ubicacionesRaw = campos.ubicaciones as unknown[] | undefined
  const modoMultiple = inv.ubicacion === 'multiple' && Array.isArray(ubicacionesRaw) && ubicacionesRaw.length > 0

  const ubicaciones = modoMultiple
    ? (ubicacionesRaw as { tipo: string; nombre: string; direccion: string; latitud: number | string; longitud: number | string; hora?: string }[]).map(u => ({
        tipo: u.tipo,
        nombre: u.nombre,
        direccion: u.direccion,
        latitud: String(u.latitud),
        longitud: String(u.longitud),
        hora: u.hora ?? '',
      }))
    : []

  // camposEspecificos without ubicaciones key
  const { ubicaciones: _ub, ...camposRest } = campos
  const camposEspecificos: Record<string, string> = {}
  for (const [k, v] of Object.entries(camposRest)) {
    camposEspecificos[k] = String(v ?? '')
  }

  // Build service toggles
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

  // Build historia editables
  const historiasEdit: HistoriaEditable[] = historias.map(h => ({
    localId: crypto.randomUUID(),
    serverId: h.id,
    texto: h.texto,
    orden: h.orden,
    imagen: null,
    imagenPreview: null,
    existingImagenUrl: h.imagenUrl,
  }))

  // Existing fotos
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
    },
    step2: {
      fechaEvento,
      horaEvento: (inv.horaEvento ?? '').slice(0, 5),
      ubicacion: modoMultiple ? 'multiple' : inv.ubicacion,
      direccion: modoMultiple ? 'multiple' : inv.direccion,
      latitud: modoMultiple ? '0' : String(inv.latitud),
      longitud: modoMultiple ? '0' : String(inv.longitud),
      colorPrimario: inv.colorPrimario ?? '#c5a572',
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

// ─── Step indicators ──────────────────────────────────────────────────────────

const STEPS = ['Datos', 'Evento', 'Servicios', 'Contenido', 'Guardar']

function StepBar({ current, onGoTo }: { current: number; onGoTo: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={n} className="flex items-center gap-1 flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => done && onGoTo(n)}
              disabled={!done}
              className={[
                'w-7 h-7 rounded-full text-[.72rem] font-bold flex items-center justify-center shrink-0 transition-colors',
                active ? 'bg-[#c5a572] text-white' : done ? 'bg-[#2d2926] text-white cursor-pointer' : 'bg-[#e5e7eb] text-[#9ca3af]',
              ].join(' ')}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : n}
            </button>
            <span className={['text-[.75rem] hidden sm:block', active ? 'text-[#2d2926] font-semibold' : 'text-[#9ca3af]'].join(' ')}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={['flex-1 h-px mx-1', done ? 'bg-[#2d2926]' : 'bg-[#e5e7eb]'].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1 — Datos Básicos (simplified for edit) ─────────────────────────────

function Step1Edit({
  state,
  templates,
  onChange,
  onNext,
}: {
  state: WizardStep1
  templates: Template[]
  onChange: (u: Partial<WizardStep1>) => void
  onNext: () => void
}) {
  const filtered = templates.filter(t => t.activo && (state.tipoEventoId === null || t.tipoEventoId === state.tipoEventoId))
  const canProceed = state.tipoEventoId !== null && state.templateId !== null && state.titulo.trim().length > 0

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">Datos Básicos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
            Tipo de evento <span className="text-[#dc2626]">*</span>
          </label>
          <select
            value={state.tipoEventoId ?? ''}
            onChange={e => onChange({ tipoEventoId: e.target.value ? Number(e.target.value) : null, templateId: null })}
            className={INPUT_CLS}
          >
            <option value="">— Seleccionar —</option>
            {TIPO_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <p className="text-[.76rem] text-[#6b7280] bg-[#f4f5f7] rounded-lg px-3 py-2.5 w-full">
            Pedido: <strong className="text-[#2d2926]">#{state.pedidoId || '—'}</strong>
          </p>
        </div>
      </div>

      {/* Template grid */}
      <div className="mb-5">
        <label className="block text-[.8rem] font-medium mb-2 text-[#2d2926]">
          Template <span className="text-[#dc2626]">*</span>
        </label>
        {state.tipoEventoId === null ? (
          <p className="text-[.82rem] text-[#9ca3af] py-4">Seleccioná un tipo de evento para ver los templates disponibles</p>
        ) : filtered.length === 0 ? (
          <p className="text-[.82rem] text-[#9ca3af] py-4">No hay templates activos para {TIPO_LABEL[state.tipoEventoId] ?? 'este tipo'}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((t, i) => {
              const selected = state.templateId === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChange({ templateId: t.id })}
                  className={[
                    'rounded-xl overflow-hidden border-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                    selected ? 'border-[#c5a572] shadow-md' : 'border-transparent',
                  ].join(' ')}
                >
                  <div
                    className="h-[110px] flex items-center justify-center font-serif text-[.95rem] font-semibold px-3 text-center"
                    style={{
                      background: t.thumbnailUrl ? undefined : GRADIENTS[i % GRADIENTS.length],
                      backgroundImage: t.thumbnailUrl ? `url(${t.thumbnailUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: GRADIENT_TEXT[i % GRADIENT_TEXT.length],
                    }}
                  >
                    {!t.thumbnailUrl && t.nombre}
                  </div>
                  <div className="px-3 py-2 bg-white text-[.78rem] font-medium text-[#2d2926] truncate">{t.nombre}</div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
          Título del evento <span className="text-[#dc2626]">*</span>
        </label>
        <input
          type="text" maxLength={200}
          placeholder="Ej: Boda de María & Joaquín"
          value={state.titulo}
          onChange={e => onChange({ titulo: e.target.value })}
          className={INPUT_CLS}
        />
        <div className="flex justify-end mt-0.5">
          <span className="text-[.7rem] text-[#9ca3af]">{state.titulo.length}/200</span>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onNext} disabled={!canProceed}
          className="px-5 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.88rem] font-medium hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Siguiente →
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
  const showMusica = servicios.some(s => s.enabled && normalize(s.nombre).includes('usic'))
  const showHistoria = servicios.some(s => s.enabled && normalize(s.nombre).includes('storia'))

  // ── Photos ────────────────────────────────────────────────────────────────

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
  const canAddMore = totalFotos < 5

  // ── Music ─────────────────────────────────────────────────────────────────

  function handleMusicaFile(files: FileList | null) {
    if (!files?.[0]) return
    onChange({ newMusica: files[0], newMusicaNombre: files[0].name, removeMusica: false })
  }

  // ── Historias ─────────────────────────────────────────────────────────────

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
      <h2 className="text-lg font-semibold mb-5">Contenido Multimedia</h2>

      {/* ── Fotos ── */}
      <div className="bg-white border border-[#f0f0f0] rounded-xl p-4 mb-4">
        <h3 className="font-semibold text-[.9rem] mb-3">📷 Fotos del Anfitrión</h3>

        {/* Existing fotos */}
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

        {/* New fotos */}
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
            className="flex flex-col items-center justify-center w-full py-5 border-2 border-dashed border-[#d1d5db] rounded-lg hover:border-[#c5a572] hover:bg-[rgba(197,165,114,.03)] transition-colors text-[#6b7280]">
            <ImagePlus className="w-6 h-6 mb-1.5" />
            <span className="text-[.82rem]">Agregar fotos</span>
            <span className="text-[.7rem] text-[#9ca3af] mt-0.5">JPG, PNG, WebP · Máx. 5 MB c/u · {5 - totalFotos} restante{5 - totalFotos !== 1 ? 's' : ''}</span>
          </button>
        )}
        <input ref={fotosInputRef} type="file" accept="image/*" multiple hidden onChange={e => handleNewFotos(e.target.files)} />
      </div>

      {/* ── Música ── */}
      {showMusica && (
        <div className="bg-white border border-[#f0f0f0] rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-[.9rem] mb-1">🎵 Música</h3>
          <p className="text-[.76rem] text-[#6b7280] mb-3">Se reproduce automáticamente al abrir la invitación. MP3 · Máx. 20 MB.</p>

          {/* Existing music */}
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

          {/* New music */}
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
              className="flex flex-col items-center justify-center w-full py-4 border-2 border-dashed border-[#d1d5db] rounded-lg hover:border-[#c5a572] hover:bg-[rgba(197,165,114,.03)] transition-colors text-[#6b7280]">
              <Music className="w-5 h-5 mb-1.5" />
              <span className="text-[.82rem]">{state.existingMusica ? 'Reemplazar música' : 'Subir música (MP3)'}</span>
            </button>
          )}
          <input ref={musicaInputRef} type="file" accept=".mp3,audio/mpeg" hidden onChange={e => handleMusicaFile(e.target.files)} />
        </div>
      )}

      {/* ── Historias ── */}
      {showHistoria && (
        <div className="bg-white border border-[#f0f0f0] rounded-xl p-4 mb-4">
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
                {/* Show existing or new image */}
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
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] font-medium hover:border-[#2d2926] transition-colors">
          ← Anterior
        </button>
        <button type="button" onClick={onNext}
          className="px-5 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.88rem] font-medium hover:bg-[#4a4441] transition-colors">
          Revisar →
        </button>
      </div>
    </div>
  )
}

// ─── Step 5 — Review & Save ───────────────────────────────────────────────────

function Step5Guardar({
  state,
  templates,
  loading,
  error,
  onSave,
  onPrev,
  onToggleActiva,
}: {
  state: EditFormState
  templates: Template[]
  loading: boolean
  error: string | null
  onSave: () => void
  onPrev: () => void
  onToggleActiva: (val: boolean) => void
}) {
  const tpl = templates.find(t => t.id === state.step1.templateId)
  const esMultiple = state.step2.ubicacion === 'multiple'
  const enabled = state.step3.servicios.filter(s => s.enabled)

  function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className="flex gap-2 flex-wrap text-[.85rem]">
        <span className="text-[#6b7280] shrink-0">{label}:</span>
        <span className="text-[#2d2926] font-medium">{value ?? '—'}</span>
      </div>
    )
  }

  function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="bg-white border border-[#f0f0f0] rounded-xl p-4">
        <h4 className="text-[.82rem] font-semibold text-[#6b7280] uppercase tracking-wider mb-2">{title}</h4>
        <div className="space-y-1">{children}</div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">Revisar y Guardar</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <Card title="Datos Básicos">
          <Row label="Tipo" value={TIPO_LABEL[state.step1.tipoEventoId!] ?? '—'} />
          <Row label="Template" value={tpl?.nombre ?? '—'} />
          <Row label="Título" value={state.step1.titulo || '—'} />
        </Card>

        <Card title="Evento">
          <Row label="Fecha" value={state.step2.fechaEvento || '—'} />
          <Row label="Hora" value={state.step2.horaEvento || '—'} />
          {esMultiple ? (
            state.step2.ubicaciones.map(u => (
              <Row key={u.tipo} label={u.tipo} value={u.nombre || '—'} />
            ))
          ) : (
            <Row label="Lugar" value={state.step2.ubicacion || '—'} />
          )}
        </Card>

        <Card title="Servicios">
          {enabled.length === 0
            ? <span className="text-[.85rem] text-[#9ca3af]">Ninguno</span>
            : enabled.map(s => (
              <span key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f4f5f7] text-[#4a4441] rounded text-[.78rem] mr-1 mb-1">
                {s.nombre}
                {s.incluidoEnBase && <span className="text-[#16a34a] text-[.65rem]">✓</span>}
              </span>
            ))
          }
        </Card>

        <Card title="Contenido">
          <Row label="Fotos existentes" value={`${state.existingFotos.length - state.removedFotoIds.length} (−${state.removedFotoIds.length} eliminadas)`} />
          <Row label="Fotos nuevas" value={state.newFotos.length > 0 ? `${state.newFotos.length} para subir` : 'ninguna'} />
          <Row label="Música" value={state.removeMusica ? 'Se eliminará' : state.newMusica ? state.newMusicaNombre : state.existingMusica ? 'Sin cambios' : 'Sin música'} />
          <Row label="Historias" value={`${state.historias.length} sección${state.historias.length !== 1 ? 'es' : ''}`} />
        </Card>
      </div>

      {/* activa toggle */}
      <div className="bg-white border border-[#f0f0f0] rounded-xl p-4 mb-5 flex items-center gap-4">
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

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 bg-[#fee2e2] text-[#dc2626] rounded-xl mb-4 text-[.85rem]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev} disabled={loading}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] font-medium hover:border-[#2d2926] disabled:opacity-40 transition-colors">
          ← Anterior
        </button>
        <button type="button" onClick={onSave} disabled={loading}
          className="flex items-center gap-2 px-7 py-2.5 bg-[#c5a572] text-white rounded-lg text-[.95rem] font-semibold hover:bg-[#9e7f4e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function EditarInvitacionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [formState, setFormState] = useState<EditFormState | null>(null)
  const [originalHistoriaIds, setOriginalHistoriaIds] = useState<number[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      try {
        const [inv, historias, musica, tpls, svcs] = await Promise.all([
          adminInvitacionService.getById(id!),
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

    // Build camposEspecificos
    const camposBase = { ...step2.camposEspecificos }
    const camposFinales = modoMultiple
      ? { ...camposBase, ubicaciones: step2.ubicaciones }
      : camposBase

    // Build servicios IDs
    const serviciosIds = step3.servicios.filter(s => s.enabled).map(s => s.id)

    try {
      // 1. PUT main invitation data
      await adminInvitacionService.update(id, {
        templateId: step1.templateId!,
        tipoEventoId: step1.tipoEventoId!,
        titulo: step1.titulo.trim(),
        fechaEvento: step2.fechaEvento,
        horaEvento: step2.horaEvento,
        ubicacion: modoMultiple ? 'multiple' : step2.ubicacion.trim(),
        direccion: modoMultiple ? 'multiple' : step2.direccion.trim(),
        latitud: modoMultiple ? 0 : Number(step2.latitud),
        longitud: modoMultiple ? 0 : Number(step2.longitud),
        colorPrimario: step2.colorPrimario || undefined,
        contrasenaAsistentes: step2.contrasenaAsistentes.trim() || undefined,
        maxFotos: step2.maxFotos,
        camposEspecificos: Object.keys(camposFinales).length > 0 ? camposFinales : undefined,
        serviciosIds,
        activa: formState.activa,
      })

      // 2. Delete removed existing fotos
      for (const fotoId of formState.removedFotoIds) {
        await adminInvitacionService.deleteFotoAnfitrion(id, fotoId)
      }

      // 3. Upload new fotos
      if (formState.newFotos.length > 0) {
        await adminInvitacionService.addFotosAnfitrion(id, formState.newFotos)
      }

      // 4. Music management
      if (formState.removeMusica && formState.existingMusica) {
        await adminInvitacionService.deleteMusica(id)
      }
      if (formState.newMusica) {
        await adminInvitacionService.uploadMusica(id, formState.newMusica)
      }

      // 5. Historias management
      const currentServerIds = new Set(
        formState.historias.filter(h => h.serverId !== undefined).map(h => h.serverId!)
      )

      // Delete removed historias (were in original, not in current)
      for (const serverId of originalHistoriaIds) {
        if (!currentServerIds.has(serverId)) {
          await adminInvitacionService.deleteHistoria(id, serverId)
        }
      }

      // Update or create
      for (const h of formState.historias) {
        if (h.serverId !== undefined) {
          // removeImagen = existingImagenUrl was cleared and no new image was provided
          const removeImagen = h.existingImagenUrl === null && h.imagen === null
          await adminInvitacionService.updateHistoria(id, h.serverId, h.texto, h.orden, h.imagen, removeImagen)
        } else {
          // Create new
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

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-24 text-[#6b7280] text-[.9rem]">
        <span className="animate-spin mr-2 inline-block w-5 h-5 border-2 border-[#c5a572] border-t-transparent rounded-full" />
        Cargando invitación…
      </div>
    )
  }

  if (dataError) {
    return <div className="py-16 text-center text-[#dc2626] text-[.9rem]">{dataError}</div>
  }

  if (!formState) return null

  if (saved) {
    return (
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
            className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] font-medium hover:border-[#2d2926] transition-colors"
          >
            Seguir editando
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/invitaciones')}
            className="px-5 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.88rem] font-medium hover:bg-[#4a4441] transition-colors"
          >
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-[#2d2926]">Editar Invitación</h1>
        <span className="text-[.78rem] text-[#9ca3af] font-mono">{id}</span>
      </div>

      <StepBar current={currentStep} onGoTo={goTo} />

      <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-6">
        {currentStep === 1 && (
          <Step1Edit
            state={formState.step1}
            templates={templates}
            onChange={updateStep1}
            onNext={() => goTo(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2Evento
            state={formState.step2}
            tipoEventoId={formState.step1.tipoEventoId}
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
            onToggleActiva={val => setFormState(prev => prev ? { ...prev, activa: val } : prev)}
          />
        )}
      </div>
    </div>
  )
}
