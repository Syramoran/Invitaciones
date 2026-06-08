import { useState, useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import type { WizardStep2, UbicacionEvento, TipoUbicacion } from '@/types/crearInvitacion'
import { TIPOS_UBICACION_OPTIONS as TIPOS_UBICACION, COLORES_PALETA } from '@/types/crearInvitacion'

// ─── Dynamic field definitions per tipoEventoId ───────────────────────────────

type FieldType = 'text' | 'time' | 'textarea' | 'select' | 'color' | 'checkbox' | 'section'

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
  { key: 'dressCode',  label: 'Dress code', type: 'text', placeholder: 'Elegante' },
  // ── Mesa de regalos ──────────────────────────────────────────────────────────
  { key: '_s_regalos', label: 'Mesa de regalos', type: 'section', fullWidth: true },
  { key: 'mostrarLluviaSobres', label: 'Mostrar lluvia de sobres', type: 'checkbox', fullWidth: false },
  { key: 'alias',  label: 'Alias (cuenta bancaria)', type: 'text', placeholder: 'nombreapellido.mp' },
  { key: 'cbu',    label: 'CBU / CVU', type: 'text', placeholder: '0000003100010000000000' },
  // ── Información adicional ─────────────────────────────────────────────────────
  { key: '_s_info', label: 'Información adicional', type: 'section', fullWidth: true },
  { key: 'infoAdicional', label: 'Información adicional', type: 'textarea', placeholder: 'Ej: avisanos si tenés alguna restricción alimentaria', fullWidth: true },
]

const CAMPOS_QUINCE: FieldDef[] = [
  { key: 'nombre',        label: 'Nombre de la quinceañera', type: 'text', placeholder: 'Martina' },
  { key: 'colorTematico', label: 'Color temático',            type: 'color' },
  { key: 'dressCode',     label: 'Dress code',                type: 'text', placeholder: 'Elegante' },
  { key: 'tematica',      label: 'Temática',                  type: 'text', placeholder: 'Ej: Jardín encantado' },
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

// Colores disponibles para la plantilla quince-princesa
const COLORES_QUINCE_PRINCESA = COLORES_PALETA.filter(c =>
  (['#894F8E', '#B14B8F', '#DC83AA', '#D16A32', '#BD9848', '#65795A', '#2A63A8'] as string[]).includes(c.hex)
)

// Colores de fondo disponibles para cumple-elegante (el acento se deriva automáticamente)
const COLORES_CUMPLE_ELEGANTE = [
  { hex: '#EDE2D4', label: 'Beige dorado'  },
  { hex: '#F1F1F1', label: 'Gris perla'    },
  { hex: '#DAE4F1', label: 'Azul hielo'    },
  { hex: '#E2DAF1', label: 'Lila'          },
  { hex: '#F4E1E1', label: 'Rosa pálido'   },
] as const

const COLOR_DEFAULT_CUMPLE_ELEGANTE = '#EDE2D4'

// ─── Shared input classes ─────────────────────────────────────────────────────

const INPUT_CLS = 'w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] focus:border-[#c5a572] focus:outline-none bg-white transition-colors'

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  state: WizardStep2
  onChange: (updates: Partial<WizardStep2>) => void
  tipoEventoId: number | null
  templateSlug?: string | null
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
  if (def.type === 'checkbox') {
    const checked = value !== 'false'
    return (
      <button
        type="button"
        onClick={() => onFieldChange(def.key, checked ? 'false' : 'true')}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#c5a572]' : 'bg-[#d1d5db]'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    )
  }
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

export function Step2Evento({ state, onChange, tipoEventoId, templateSlug, onNext, onPrev }: Props) {
  const camposFields = tipoEventoId ? (CAMPOS_MAP[tipoEventoId] ?? []) : []

  // Local flag — initialised from saved data so navigating back keeps the mode
  const [modoMultiple, setModoMultiple] = useState(() => state.ubicaciones.length > 0)

  // Track the Maps link input value for single mode
  const [mapsLinkInput, setMapsLinkInput] = useState('')

  const esQuince = tipoEventoId === 2
  const esCumpleElegante = templateSlug === 'cumple-elegante'
  // Para quinceañera siempre un solo lugar
  const efectivamenteMultiple = !esQuince && modoMultiple

  // Quince: sincronizar colorPrimario con colorTematico al montar o cambiar tipo
  useEffect(() => {
    if (tipoEventoId === 2) {
      const ct = state.camposEspecificos.colorTematico || '#DC83AA'
      if (state.colorPrimario !== ct) {
        onChange({ colorPrimario: ct })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEventoId])

  // Cumple elegante: establecer color predeterminado al seleccionar esta plantilla
  const prevSlugRef = useRef(templateSlug)
  useEffect(() => {
    if (esCumpleElegante && prevSlugRef.current !== 'cumple-elegante') {
      const valido = COLORES_CUMPLE_ELEGANTE.some(c => c.hex.toLowerCase() === state.colorPrimario?.toLowerCase())
      if (!valido) onChange({ colorPrimario: COLOR_DEFAULT_CUMPLE_ELEGANTE })
    }
    prevSlugRef.current = templateSlug ?? null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateSlug])

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

  function agregarUbicacion(tipo: TipoUbicacion) {
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
    efectivamenteMultiple
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

      {/* Location mode toggle — solo para eventos con múltiples lugares */}
      {!esQuince && (
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
      )}

      {/* ── Ubicación ── */}
      {!efectivamenteMultiple && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label text="Tipo de lugar" />
            <select
              value={state.camposEspecificos.tipoCeremonia ?? 'Recepción'}
              onChange={e => setCampo('tipoCeremonia', e.target.value)}
              className={INPUT_CLS}
            >
              {TIPOS_UBICACION.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
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

      {/* ── Múltiples ubicaciones ── */}
      {efectivamenteMultiple && (
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
        {!esQuince && (() => {
          const paleta = esCumpleElegante ? COLORES_CUMPLE_ELEGANTE : COLORES_PALETA
          const etiqueta = [...COLORES_PALETA, ...COLORES_CUMPLE_ELEGANTE].find(c => c.hex.toLowerCase() === state.colorPrimario?.toLowerCase())?.label ?? state.colorPrimario
          return (
          <div className="sm:col-span-2">
            <Label text="Color primario" />
            <div className="flex flex-wrap gap-2 mt-1">
              {/* Swatch predeterminado — solo para plantillas sin paleta fija */}
              {!esCumpleElegante && (
                <button
                  type="button"
                  title="Predeterminado"
                  onClick={() => setField('colorPrimario', '')}
                  className="relative w-8 h-8 rounded-full border-2 transition-all duration-150 hover:scale-110 bg-white overflow-hidden"
                  style={{
                    borderColor: state.colorPrimario === '' ? '#9ca3af' : 'transparent',
                    boxShadow: state.colorPrimario === '' ? '0 0 0 2px white, 0 0 0 4px #9ca3af' : 'none',
                  }}
                >
                  <span className="absolute inset-0" style={{ background: 'linear-gradient(135deg, transparent calc(50% - 1px), #dc2626 calc(50% - 1px), #dc2626 calc(50% + 1px), transparent calc(50% + 1px))' }} />
                  {state.colorPrimario === '' && (
                    <Check className="w-3.5 h-3.5 absolute inset-0 m-auto text-gray-500 drop-shadow" />
                  )}
                </button>
              )}
              {paleta.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.label}
                  onClick={() => setField('colorPrimario', c.hex)}
                  className="relative w-8 h-8 rounded-full border-2 transition-all duration-150 hover:scale-110"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: state.colorPrimario?.toLowerCase() === c.hex.toLowerCase() ? c.hex : 'transparent',
                    boxShadow: state.colorPrimario?.toLowerCase() === c.hex.toLowerCase() ? `0 0 0 2px white, 0 0 0 4px ${c.hex}` : 'none',
                  }}
                >
                  {state.colorPrimario?.toLowerCase() === c.hex.toLowerCase() && (
                    <Check className="w-3.5 h-3.5 absolute inset-0 m-auto drop-shadow" style={{ color: esCumpleElegante ? '#555' : 'white' }} />
                  )}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[.78rem] text-[#6b7280]">
              {state.colorPrimario === '' ? 'Predeterminado (según plantilla)' : etiqueta}
            </p>
          </div>
        )})()
        }
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
            {camposFields.map(def => {
              if (def.type === 'section') return (
                <div key={def.key} className="sm:col-span-2 flex items-center gap-3 pt-2">
                  <span className="text-[.78rem] font-semibold uppercase tracking-wider text-[#6b7280]">{def.label}</span>
                  <div className="flex-1 h-px bg-[#e5e7eb]" />
                </div>
              )
              if (def.type === 'checkbox') return (
                <div key={def.key} className="flex items-center gap-3">
                  <DynamicField
                    def={def}
                    value={state.camposEspecificos[def.key] ?? 'true'}
                    onFieldChange={setCampo}
                  />
                  <Label text={def.label} />
                </div>
              )
              if (def.key === 'colorTematico') {
                const selectedColor = state.camposEspecificos.colorTematico || '#DC83AA'
                return (
                  <div key={def.key} className="sm:col-span-2">
                    <Label text={def.label} />
                    <div className="flex flex-wrap gap-2 mt-1">
                      {COLORES_QUINCE_PRINCESA.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          title={c.label}
                          onClick={() => {
                            setCampo('colorTematico', c.hex)
                            setField('colorPrimario', c.hex)
                          }}
                          className="relative w-8 h-8 rounded-full border-2 transition-all duration-150 hover:scale-110"
                          style={{
                            backgroundColor: c.hex,
                            borderColor: selectedColor === c.hex ? c.hex : 'transparent',
                            boxShadow: selectedColor === c.hex ? `0 0 0 2px white, 0 0 0 4px ${c.hex}` : 'none',
                          }}
                        >
                          {selectedColor === c.hex && (
                            <Check className="w-3.5 h-3.5 absolute inset-0 m-auto text-white drop-shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[.78rem] text-[#6b7280]">
                      {COLORES_QUINCE_PRINCESA.find(c => c.hex === selectedColor)?.label ?? 'Sin selección'}
                    </p>
                  </div>
                )
              }
              return (
                <div key={def.key} className={def.fullWidth ? 'sm:col-span-2' : ''}>
                  <Label text={def.label} />
                  <DynamicField
                    def={def}
                    value={state.camposEspecificos[def.key] ?? ''}
                    onFieldChange={setCampo}
                  />
                </div>
              )
            })}

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
