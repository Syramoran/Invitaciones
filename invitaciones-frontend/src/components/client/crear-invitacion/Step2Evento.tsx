import { useState, useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import type { WizardStep2, UbicacionEvento, TipoUbicacion, ServiceToggle } from '@/types/crearInvitacion'
import { TIPOS_UBICACION_OPTIONS as TIPOS_UBICACION, COLORES_PALETA, TEMPLATE_COLORS } from '@/types/crearInvitacion'
import apiClient from '@/services/apiClient'
import { getEventConfig } from '@/config/eventoConfig'
import type { FieldDef } from '@/config/eventoConfig'
import { MapPicker } from '@/components/shared/crear-invitacion/MapPicker'

// ─── Shared input classes ─────────────────────────────────────────────────────

const INPUT_CLS = 'w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] focus:border-[#c5a572] focus:outline-none bg-white transition-colors'

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  state: WizardStep2
  servicios?: ServiceToggle[]
  onChange: (updates: Partial<WizardStep2>) => void
  tipoEventoId: number | null
  templateSlug?: string | null
  colorPrimario?: string
  onColorChange?: (color: string) => void
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
  ub, index, onUpdate, onRemove, onResolveUrl, isResolving
}: {
  ub: UbicacionEvento
  index: number
  onUpdate: (index: number, updates: Partial<UbicacionEvento>) => void
  onRemove: (index: number) => void
  onResolveUrl: (url: string, index: number) => void
  isResolving: boolean
}) {
  const [localLink, setLocalLink] = useState('')
  const [mapsLinkOpen, setMapsLinkOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localLink && localLink.includes('http')) {
        onResolveUrl(localLink, index)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [localLink])

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

        {/* Map picker */}
        <div className="sm:col-span-2">
          <Label text="Ubicación en el mapa" required />
          <MapPicker
            latitud={ub.latitud}
            longitud={ub.longitud}
            onChange={(lat, lng) => onUpdate(index, { latitud: lat, longitud: lng })}
          />
        </div>

        <div>
          <Label text="Latitud" />
          <input
            type="number" step="any" placeholder="-34.5888"
            value={ub.latitud}
            onChange={e => onUpdate(index, { latitud: e.target.value })}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <Label text="Longitud" />
          <input
            type="number" step="any" placeholder="-58.6796"
            value={ub.longitud}
            onChange={e => onUpdate(index, { longitud: e.target.value })}
            className={INPUT_CLS}
          />
        </div>

        {/* Collapsible Maps link */}
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={() => setMapsLinkOpen(o => !o)}
            className="flex items-center gap-2 text-[.78rem] text-[#9ca3af] hover:text-[#c5a572] transition-colors py-1"
          >
            <span
              style={{
                display: 'inline-block',
                transition: 'transform 0.2s',
                transform: mapsLinkOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              ▶
            </span>
            Autocompletar coordenadas desde link de Google Maps
          </button>
          {mapsLinkOpen && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Pegá el link de Maps (largo o corto)..."
                value={localLink}
                onChange={e => setLocalLink(e.target.value)}
                className={INPUT_CLS}
              />
              {isResolving && <p className="text-[.75rem] text-[#c5a572] mt-1">Cargando coordenadas...</p>}
              <p className="text-[.72rem] text-[#9ca3af] mt-0.5">
                Usa el link largo desde el navegador — debe contener el símbolo @
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Step2Evento({ state, servicios, onChange, tipoEventoId, templateSlug, onColorChange, onNext, onPrev }: Props) {
  const currentConfig = getEventConfig(tipoEventoId)
  const camposFields = currentConfig.camposEspecificos

  const showSeguridad = servicios?.some(s => s.enabled && (
    s.nombre.toLowerCase().includes('confirm') ||
    s.nombre.toLowerCase().includes('galer')
  )) ?? false;

  const [mapsLinkInput, setMapsLinkInput] = useState('')
  const [mapsLinkSingleOpen, setMapsLinkSingleOpen] = useState(false)
  const [resolviendoUrl, setResolviendoUrl] = useState(false)
  const [modoMultiple, setModoMultiple] = useState(() => state.ubicaciones.length > 0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapsLinkInput && mapsLinkInput.includes('http')) {
        handleResolverMapsLink(mapsLinkInput)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [mapsLinkInput])

  const efectivamenteMultiple = currentConfig.allowMultipleLocations && modoMultiple

  useEffect(() => {
    if (currentConfig.syncColorTematico) {
      const ct = state.camposEspecificos.colorTematico || '#DC83AA'
      if (state.colorPrimario !== ct) {
        onChange({ colorPrimario: ct })
      }
    }
  }, [tipoEventoId, currentConfig.syncColorTematico])

  const prevSlugRef = useRef(templateSlug)
  useEffect(() => {
    if (templateSlug && templateSlug !== prevSlugRef.current) {
      const paleta = TEMPLATE_COLORS[templateSlug] || COLORES_PALETA
      const valido = paleta.some(c => c.hex.toLowerCase() === state.colorPrimario?.toLowerCase())
      if (!valido && paleta.length > 0) {
        onChange({ colorPrimario: paleta[0].hex })
      }
    }
    prevSlugRef.current = templateSlug ?? null
  }, [templateSlug])

  function setField(key: keyof WizardStep2, value: string | number) {
    onChange({ [key]: value } as Partial<WizardStep2>)
  }

  function setCampo(key: string, value: string) {
    onChange({ camposEspecificos: { ...state.camposEspecificos, [key]: value } })
  }

  async function handleResolverMapsLink(url: string, index: number | null = null) {
    if (!url) return
    setResolviendoUrl(true)
    try {
      const { data } = await apiClient.get(`/invitaciones/resolve-location?url=${encodeURIComponent(url)}`)
      if (data.error) {
        alert(data.error)
        return
      }
      if (index !== null) {
        actualizarUbicacion(index, { latitud: data.latitud, longitud: data.longitud })
      } else {
        onChange({ latitud: data.latitud, longitud: data.longitud } as Partial<WizardStep2>)
      }
    } catch (error) {
      console.error(error)
      alert('Ocurrió un error al intentar resolver la URL del mapa.')
    } finally {
      setResolviendoUrl(false)
    }
  }

  function activarModoMultiple() {
    setModoMultiple(true)
    onChange({ ubicacion: 'multiple', direccion: 'multiple', googleMapsUrl: '' })
  }

  function desactivarModoMultiple() {
    setModoMultiple(false)
    onChange({ ubicaciones: [], ubicacion: '', direccion: '', googleMapsUrl: '' })
  }

  function agregarUbicacion(tipo: TipoUbicacion) {
    onChange({ ubicaciones: [...state.ubicaciones, { tipo, nombre: '', direccion: '', hora: '', latitud: '', longitud: '' }] })
  }

  function actualizarUbicacion(index: number, updates: Partial<UbicacionEvento>) {
    const next = state.ubicaciones.map((u, i) => i === index ? { ...u, ...updates } : u)
    onChange({ ubicaciones: next })
  }

  function eliminarUbicacion(index: number) {
    const next = state.ubicaciones.filter((_, i) => i !== index)
    onChange({ ubicaciones: next })
  }

  const tiposUsados = state.ubicaciones.map(u => u.tipo)
  const tiposDisponibles = TIPOS_UBICACION.filter(t => !tiposUsados.includes(t))

  const canProceed = !!(state.fechaEvento && state.horaEvento) && (
    efectivamenteMultiple
      ? state.ubicaciones.length >= 1 &&
        state.ubicaciones.every(u => u.nombre.trim() && u.direccion.trim())
      : !!(state.ubicacion.trim() && state.direccion.trim())
  )

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">Información del Evento</h2>

      <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-xl p-5 mb-6">
        <h3 className="text-[.9rem] font-semibold text-[#2d2926] mb-4 flex items-center gap-2">
          📅 ¿Cuándo será?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[.9rem] font-semibold text-[#2d2926] flex items-center gap-2">
            📍 ¿Dónde será?
          </h3>
          
          {currentConfig.allowMultipleLocations && (
            <div>
              {modoMultiple ? (
                <button
                  type="button"
                  onClick={desactivarModoMultiple}
                  className="text-[.78rem] px-3 py-1.5 rounded-lg border border-[#d1d5db] text-[#2d2926] hover:border-[#2d2926] bg-white transition-colors"
                >
                  Volver a un solo lugar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={activarModoMultiple}
                  className="text-[.78rem] px-3 py-1.5 rounded-lg border border-[#c5a572] text-[#c5a572] hover:bg-[#c5a572] hover:text-white bg-white transition-colors"
                >
                  + Múltiples lugares
                </button>
              )}
            </div>
          )}
        </div>

      {!efectivamenteMultiple && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {tipoEventoId === 1 && (
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
          )}
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

          {/* Map picker */}
          <div className="sm:col-span-2">
            <Label text="Ubicación en el mapa" required />
            <MapPicker
              latitud={state.latitud}
              longitud={state.longitud}
              onChange={(lat, lng) => {
                onChange({ latitud: lat, longitud: lng } as Partial<WizardStep2>)
              }}
            />
          </div>

          <div>
            <Label text="Latitud" />
            <input type="number" step="any" placeholder="-34.5888"
              value={state.latitud || ''}
              onChange={e => onChange({ latitud: e.target.value } as Partial<WizardStep2>)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <Label text="Longitud" />
            <input type="number" step="any" placeholder="-58.6796"
              value={state.longitud || ''}
              onChange={e => onChange({ longitud: e.target.value } as Partial<WizardStep2>)}
              className={INPUT_CLS}
            />
          </div>

          {/* Collapsible Maps link */}
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => setMapsLinkSingleOpen(o => !o)}
              className="flex items-center gap-2 text-[.78rem] text-[#9ca3af] hover:text-[#c5a572] transition-colors py-1"
            >
              <span
                style={{
                  display: 'inline-block',
                  transition: 'transform 0.2s',
                  transform: mapsLinkSingleOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >
                ▶
              </span>
              Autocompletar coordenadas desde link de Google Maps
            </button>
            {mapsLinkSingleOpen && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Pegá el link de Maps (largo o corto)..."
                  value={mapsLinkInput}
                  onChange={e => setMapsLinkInput(e.target.value)}
                  className={INPUT_CLS}
                />
                {resolviendoUrl && <p className="text-[.75rem] text-[#c5a572] mt-1">Cargando coordenadas...</p>}
                <p className="text-[.72rem] text-[#9ca3af] mt-0.5">
                  Usa el link largo desde el navegador — debe contener el símbolo @
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {efectivamenteMultiple && (
        <div className="mb-4 flex flex-col gap-3">
          {state.ubicaciones.map((ub, i) => (
            <UbicacionCard
              key={ub.tipo}
              ub={ub}
              index={i}
              onUpdate={actualizarUbicacion}
              onRemove={eliminarUbicacion}
              onResolveUrl={handleResolverMapsLink}
              isResolving={resolviendoUrl}
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
      </div>

      {/* Password section */}
      {showSeguridad && (
        <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-xl p-5 mb-6">
          <h3 className="text-[.9rem] font-semibold text-[#2d2926] mb-4 flex items-center gap-2">
            🔒 Seguridad (Lista de Asistentes)
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label text="Contraseña para ver asistentes" />
              <input type="text" maxLength={255} placeholder="Ej: mis15sofi (opcional)"
                value={state.contrasenaAsistentes} onChange={e => setField('contrasenaAsistentes', e.target.value)}
                className={INPUT_CLS + " max-w-sm"} />
              <p className="text-[.75rem] text-[#6b7280] mt-1">Dejalo vacío si querés que la lista sea pública para los invitados.</p>
            </div>
          </div>
        </div>
      )}


      {/* Dynamic campos específicos */}
      {camposFields.length > 0 && (
        <div className="mt-2 pt-4 border-t border-[#f0f0f0]">
          <h3 className="text-[.9rem] font-semibold mb-3 text-[#2d2926]">
            Campos específicos — {currentConfig.label}
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
                const paletaQuince = templateSlug ? (TEMPLATE_COLORS[templateSlug] || COLORES_PALETA) : COLORES_PALETA
                const selectedColor = state.camposEspecificos.colorTematico || (paletaQuince[0]?.hex ?? '#DC83AA')
                return (
                  <div key={def.key} className="sm:col-span-2">
                    <Label text={def.label} />
                    <div className="flex flex-wrap gap-2 mt-1">
                      {paletaQuince.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          title={c.label}
                          onClick={() => {
                            setCampo('colorTematico', c.hex)
                            if (typeof onColorChange === 'function') onColorChange(c.hex)
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
                      {paletaQuince.find(c => c.hex === selectedColor)?.label ?? 'Sin selección'}
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
