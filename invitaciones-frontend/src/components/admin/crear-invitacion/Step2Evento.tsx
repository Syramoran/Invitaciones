import { useState } from 'react'
import type { WizardStep2, UbicacionEvento } from '@/types/crearInvitacion'

// ─── Dynamic field definitions per tipoEventoId ───────────────────────────────

type FieldType = 'text' | 'time' | 'textarea' | 'select' | 'color'

interface FieldDef {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: string[]
  fullWidth?: boolean
}

const CAMPOS_BODA: FieldDef[] = [
  { key: 'novio1',    label: 'Nombre Novio/a 1',  type: 'text', placeholder: 'Camila' },
  { key: 'novio2',    label: 'Nombre Novio/a 2',  type: 'text', placeholder: 'Joaquín' },
  { key: 'tipoCeremonia', label: 'Tipo ceremonia', type: 'select', options: ['Civil', 'Religiosa', 'Ambas'] },
  { key: 'dressCode',  label: 'Dress code', type: 'text', placeholder: 'Elegante' },
  { key: 'notas', label: 'Notas', type: 'textarea', placeholder: 'Indicar si aplica', fullWidth: true },
]

const CAMPOS_QUINCE: FieldDef[] = [
  { key: 'nombre',     label: 'Nombre de la quinceañera', type: 'text', placeholder: 'Martina' },
  { key: 'colorTematico', label: 'Color temático', type: 'color' },
  { key: 'horaPresentacion', label: 'Hora presentación', type: 'time' },
  { key: 'valsPareja',  label: 'Vals — Pareja', type: 'text', placeholder: 'Nombre' },
  { key: 'valsCancion', label: 'Vals — Canción', type: 'text', placeholder: 'Nombre de la canción' },
  { key: 'padrinos', label: 'Padrinos / Madrinas', type: 'textarea', placeholder: 'Lista de padrinos', fullWidth: true },
  { key: 'dressCode', label: 'Dress code', type: 'text', placeholder: 'Elegante' },
  { key: 'tematica',  label: 'Temática', type: 'text', placeholder: 'Ej: Jardín encantado' },
]

const CAMPOS_CUMPLE: FieldDef[] = [
  { key: 'nombre', label: 'Nombre del festejado', type: 'text', placeholder: 'Franco' },
  { key: 'edad',   label: 'Edad que cumple',      type: 'text', placeholder: '30' },
  { key: 'tipo',   label: 'Tipo', type: 'select', options: ['Adulto', 'Infantil', 'Temático', 'Formal', 'Casual'] },
  { key: 'actividades', label: 'Actividades', type: 'textarea', placeholder: 'Indicar actividades', fullWidth: true },
  { key: 'dressCode', label: 'Dress code', type: 'text', placeholder: 'Casual elegante' },
  { key: 'notas', label: 'Notas', type: 'textarea', placeholder: 'Indicar si aplica', fullWidth: true },
]

const CAMPOS_MAP: Record<number, FieldDef[]> = { 1: CAMPOS_BODA, 2: CAMPOS_QUINCE, 3: CAMPOS_CUMPLE }
const TIPO_NOMBRES: Record<number, string> = { 1: 'Boda', 2: 'Quinceañera', 3: 'Cumpleaños' }

const TIPOS_UBICACION = ['Ceremonia religiosa', 'Ceremonia civil', 'Recepción / Fiesta'] as const

// ─── Shared input classes ─────────────────────────────────────────────────────

const INPUT_CLS = 'w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] focus:border-[#c5a572] focus:outline-none bg-white transition-colors'

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  state: WizardStep2
  onChange: (updates: Partial<WizardStep2>) => void
  tipoEventoId: number | null
  onNext: () => void
  onPrev: () => void
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-[.8rem] font-medium mb-1 text-[#2d2926]">
      {text}{required && <span className="text-[#dc2626] ml-0.5">*</span>}
    </label>
  )
}

function DynamicField({
  def, value, onFieldChange,
}: { def: FieldDef; value: string; onFieldChange: (k: string, v: string) => void }) {
  const base = INPUT_CLS
  if (def.type === 'select') return (
    <select value={value} onChange={e => onFieldChange(def.key, e.target.value)} className={base}>
      {def.options!.map(o => <option key={o}>{o}</option>)}
    </select>
  )
  if (def.type === 'textarea') return (
    <textarea value={value} onChange={e => onFieldChange(def.key, e.target.value)}
      placeholder={def.placeholder} rows={2}
      className={base + ' resize-none'} />
  )
  if (def.type === 'color') return (
    <div className="flex items-center gap-2">
      <input type="color" value={value || '#d4a0b8'} onChange={e => onFieldChange(def.key, e.target.value)}
        className="h-10 w-14 rounded border border-[#d1d5db] cursor-pointer p-0.5" />
      <span className="text-[.82rem] text-[#6b7280]">{value || '#d4a0b8'}</span>
    </div>
  )
  return (
    <input type={def.type === 'time' ? 'time' : 'text'} value={value}
      onChange={e => onFieldChange(def.key, e.target.value)}
      placeholder={def.placeholder} className={base} />
  )
}

// ─── UbicacionCard ────────────────────────────────────────────────────────────

function UbicacionCard({
  ub, index, onUpdate, onRemove,
}: {
  ub: UbicacionEvento
  index: number
  onUpdate: (index: number, updates: Partial<UbicacionEvento>) => void
  onRemove: (index: number) => void
}) {
  function parseMapsLink(url: string) {
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match) {
      onUpdate(index, { latitud: match[1], longitud: match[2] })
    }
  }

  return (
    <div className="border border-[#e5e7eb] rounded-xl p-4 bg-[#fafafa]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[.82rem] font-semibold text-[#2d2926] uppercase tracking-wide">
          {ub.tipo}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-[.75rem] text-[#dc2626] hover:underline"
        >
          Eliminar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label text="Nombre del lugar" required />
          <input
            type="text" maxLength={300}
            placeholder="Ej: Iglesia San Pedro"
            value={ub.nombre}
            onChange={e => onUpdate(index, { nombre: e.target.value })}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <Label text="Dirección completa" required />
          <input
            type="text" maxLength={500}
            placeholder="Ej: Av. Corrientes 1234, CABA"
            value={ub.direccion}
            onChange={e => onUpdate(index, { direccion: e.target.value })}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <Label text="Hora (opcional)" />
          <input
            type="time"
            value={ub.hora ?? ''}
            onChange={e => onUpdate(index, { hora: e.target.value })}
            className={INPUT_CLS}
          />
        </div>
        <div className="sm:col-span-2">
          <Label text="Link de Google Maps (autocompleta lat/long)" />
          <input
            type="text"
            placeholder="Pega el link largo de Maps aquí..."
            onChange={e => parseMapsLink(e.target.value)}
            className={INPUT_CLS}
          />
          <p className="text-[.75rem] text-[#6b7280] mt-1">Debe contener el símbolo @.</p>
        </div>
        <div>
          <Label text="Latitud" required />
          <input
            type="number" step="any" placeholder="-34.5888"
            value={ub.latitud}
            onChange={e => onUpdate(index, { latitud: e.target.value })}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <Label text="Longitud" required />
          <input
            type="number" step="any" placeholder="-58.6796"
            value={ub.longitud}
            onChange={e => onUpdate(index, { longitud: e.target.value })}
            className={INPUT_CLS}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Step2Evento({ state, onChange, tipoEventoId, onNext, onPrev }: Props) {
  const camposFields = tipoEventoId ? (CAMPOS_MAP[tipoEventoId] ?? []) : []

  // Local flag — initialised from saved data so navigating back keeps the mode
  const [modoMultiple, setModoMultiple] = useState(() => state.ubicaciones.length > 0)

  // Track the Maps link input value for single mode
  const [mapsLinkInput, setMapsLinkInput] = useState('')

  function setField(key: keyof WizardStep2, value: string | number) {
    onChange({ [key]: value } as Partial<WizardStep2>)
  }

  function setCampo(key: string, value: string) {
    onChange({ camposEspecificos: { ...state.camposEspecificos, [key]: value } })
  }

  function handleMapsLink(url: string) {
    setMapsLinkInput(url)
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/
    const match = url.match(regex)
    if (match) {
      onChange({ latitud: match[1], longitud: match[2] } as Partial<WizardStep2>)
    }
  }

  function activarModoMultiple() {
    setModoMultiple(true)
    onChange({ ubicacion: 'multiple', direccion: 'multiple', latitud: '0', longitud: '0' })
  }

  function desactivarModoMultiple() {
    setModoMultiple(false)
    onChange({ ubicaciones: [], ubicacion: '', direccion: '', latitud: '', longitud: '' })
    setMapsLinkInput('')
  }

  function agregarUbicacion(tipo: string) {
    onChange({ ubicaciones: [...state.ubicaciones, { tipo, nombre: '', direccion: '', latitud: '', longitud: '', hora: '' }] })
  }

  function actualizarUbicacion(index: number, updates: Partial<UbicacionEvento>) {
    const next = state.ubicaciones.map((u, i) => i === index ? { ...u, ...updates } : u)
    onChange({ ubicaciones: next })
  }

  function eliminarUbicacion(index: number) {
    const next = state.ubicaciones.filter((_, i) => i !== index)
    // If all removed, go back to single mode
    onChange({ ubicaciones: next })
  }

  const tiposUsados = state.ubicaciones.map(u => u.tipo)
  const tiposDisponibles = TIPOS_UBICACION.filter(t => !tiposUsados.includes(t))

  const canProceed = !!(state.fechaEvento && state.horaEvento) && (
    modoMultiple
      ? state.ubicaciones.length >= 1 &&
        state.ubicaciones.every(u => u.nombre.trim() && u.direccion.trim() && u.latitud && u.longitud)
      : !!(state.ubicacion.trim() && state.direccion.trim() && state.latitud && state.longitud)
  )

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">Información del Evento</h2>

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Label text="Fecha del evento" required />
          <input type="date" value={state.fechaEvento}
            onChange={e => setField('fechaEvento', e.target.value)} className={INPUT_CLS} />
        </div>
        <div>
          <Label text="Hora del evento" required />
          <input type="time" value={state.horaEvento}
            onChange={e => setField('horaEvento', e.target.value)} className={INPUT_CLS} />
        </div>
      </div>

      {/* Location mode toggle */}
      <div className="mb-4 flex items-center gap-3 p-3 rounded-xl border border-[#e5e7eb] bg-[#f9f9f9]">
        <span className="text-[.82rem] text-[#2d2926] font-medium flex-1">
          {modoMultiple ? 'Modo: múltiples lugares' : 'Modo: un solo lugar'}
        </span>
        {modoMultiple ? (
          <button
            type="button"
            onClick={desactivarModoMultiple}
            className="text-[.78rem] px-3 py-1.5 rounded-lg border border-[#d1d5db] text-[#2d2926] hover:border-[#2d2926] transition-colors"
          >
            Volver a un solo lugar
          </button>
        ) : (
          <button
            type="button"
            onClick={activarModoMultiple}
            className="text-[.78rem] px-3 py-1.5 rounded-lg border border-[#c5a572] text-[#c5a572] hover:bg-[#c5a572] hover:text-white transition-colors"
          >
            + Múltiples lugares
          </button>
        )}
      </div>

      {/* ── Single location mode ── */}
      {!modoMultiple && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label text="Nombre del lugar" required />
            <input type="text" maxLength={300} placeholder="Ej: Estancia La Primavera"
              value={state.ubicacion} onChange={e => setField('ubicacion', e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <Label text="Dirección completa" required />
            <input type="text" maxLength={500} placeholder="Ej: Ruta 6 Km 20, Pilar"
              value={state.direccion} onChange={e => setField('direccion', e.target.value)} className={INPUT_CLS} />
          </div>
          <div className="sm:col-span-2">
            <Label text="Link de Google Maps (autocompleta latitud y longitud)" />
            <input
              type="text"
              placeholder="Pega el link completo de Maps aquí..."
              value={mapsLinkInput}
              onChange={e => handleMapsLink(e.target.value)}
              className={INPUT_CLS}
            />
            <p className="text-[.75rem] text-[#6b7280] mt-1">
              Usa el link largo desde el navegador (debe contener el símbolo @).
            </p>
          </div>
          <div>
            <Label text="Latitud" required />
            <input type="number" step="any" placeholder="-34.5888" value={state.latitud || ''}
              onChange={e => setField('latitud', e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <Label text="Longitud" required />
            <input type="number" step="any" placeholder="-58.6796" value={state.longitud || ''}
              onChange={e => setField('longitud', e.target.value)} className={INPUT_CLS} />
          </div>
        </div>
      )}

      {/* ── Multiple locations mode ── */}
      {modoMultiple && (
        <div className="mb-4 flex flex-col gap-3">
          {state.ubicaciones.map((ub, i) => (
            <UbicacionCard
              key={ub.tipo}
              ub={ub}
              index={i}
              onUpdate={actualizarUbicacion}
              onRemove={eliminarUbicacion}
            />
          ))}

          {tiposDisponibles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tiposDisponibles.map(tipo => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => agregarUbicacion(tipo)}
                  className="text-[.78rem] px-3 py-1.5 rounded-lg border border-dashed border-[#c5a572] text-[#c5a572] hover:bg-[#c5a572] hover:text-white transition-colors"
                >
                  + {tipo}
                </button>
              ))}
            </div>
          )}

          {state.ubicaciones.length === 0 && (
            <p className="text-[.82rem] text-[#6b7280] italic">
              Agregá al menos una ubicación usando los botones de arriba.
            </p>
          )}
        </div>
      )}

      {/* Color, password, max photos — always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Label text="Color primario" />
          <div className="flex items-center gap-2">
            <input type="color" value={state.colorPrimario}
              onChange={e => setField('colorPrimario', e.target.value)}
              className="h-10 w-14 rounded border border-[#d1d5db] cursor-pointer p-0.5" />
            <span className="text-[.82rem] text-[#6b7280]">{state.colorPrimario}</span>
          </div>
        </div>
        <div>
          <Label text="Contraseña lista asistentes" />
          <input type="text" maxLength={255} placeholder="Opcional — para que el anfitrión vea confirmaciones"
            value={state.contrasenaAsistentes} onChange={e => setField('contrasenaAsistentes', e.target.value)}
            className={INPUT_CLS} />
        </div>
        <div>
          <Label text="Máx. fotos en galería" />
          <input type="number" min={1} max={1000} value={state.maxFotos}
            onChange={e => setField('maxFotos', Number(e.target.value))} className={INPUT_CLS} />
        </div>
        <div className="flex items-end pb-1">
          <p className="text-[.78rem] text-[#6b7280] bg-[#f4f5f7] rounded-lg px-3 py-2.5 w-full">
            📅 Expiración calculada automáticamente: <strong>fecha del evento + 3 meses</strong>
          </p>
        </div>
      </div>

      {/* Dynamic campos específicos */}
      {camposFields.length > 0 && (
        <div className="mt-2 pt-4 border-t border-[#f0f0f0]">
          <h3 className="text-[.9rem] font-semibold mb-3 text-[#2d2926]">
            Campos específicos — {TIPO_NOMBRES[tipoEventoId!]}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {camposFields.map(def => (
              <div key={def.key} className={def.fullWidth ? 'sm:col-span-2' : ''}>
                <Label text={def.label} />
                <DynamicField
                  def={def}
                  value={state.camposEspecificos[def.key] ?? ''}
                  onFieldChange={setCampo}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] font-medium hover:border-[#2d2926] transition-colors">
          ← Anterior
        </button>
        <button type="button" onClick={onNext} disabled={!canProceed}
          className="px-5 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.88rem] font-medium hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Siguiente →
        </button>
      </div>
    </div>
  )
}
