import { useState, useEffect, useRef } from 'react'
import { Check, MapPin, Calendar, Palette, Gift, Settings, Info, Users } from 'lucide-react'
import type { WizardStep2, UbicacionEvento, TipoUbicacion } from '@/types/crearInvitacion'
import { TIPOS_UBICACION_OPTIONS as TIPOS_UBICACION, COLORES_PALETA, TEMPLATE_COLORS } from '@/types/crearInvitacion'
import { MapPicker } from './MapPicker'

// ─── Shared input style ───────────────────────────────────────────────────────

const INPUT = 'w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] focus:border-[#c5a572] focus:outline-none bg-white transition-colors placeholder:text-[#b0b7c3]'

// ─── Section component ────────────────────────────────────────────────────────

function Section({
  icon: Icon, title, children, className = '',
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mb-7 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#f4f0ea] flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-[#c5a572]" />
        </div>
        <span className="font-semibold text-[.9rem] text-[#2d2926]">{title}</span>
        <div className="flex-1 h-px bg-[#f0ede8]" />
      </div>
      {children}
    </div>
  )
}

// ─── Label component ──────────────────────────────────────────────────────────

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-[.78rem] font-medium mb-1 text-[#4a4441]">
      {text}
      {required && <span className="text-[#dc2626] ml-0.5">*</span>}
    </label>
  )
}

// ─── Color palette picker ─────────────────────────────────────────────────────

function ColorPicker({
  value,
  palette,
  onChange,
  showDefault = false,
}: {
  value: string
  palette: { hex: string; label: string }[]
  onChange: (hex: string) => void
  showDefault?: boolean
}) {
  const selectedLabel = palette.find(c => c.hex.toLowerCase() === value?.toLowerCase())?.label

  return (
    <div>
      <div className="flex flex-wrap gap-2 mt-1">
        {showDefault && (
          <button
            type="button"
            title="Predeterminado (según diseño)"
            onClick={() => onChange('')}
            className="relative w-9 h-9 rounded-full border-2 transition-all duration-150 hover:scale-110 bg-white overflow-hidden"
            style={{
              borderColor: value === '' ? '#9ca3af' : '#e5e7eb',
              boxShadow: value === '' ? '0 0 0 2px white, 0 0 0 4px #9ca3af' : 'none',
            }}
          >
            {/* Diagonal strikethrough */}
            <span
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, transparent calc(50% - 1.5px), #dc2626 calc(50% - 1.5px), #dc2626 calc(50% + 1.5px), transparent calc(50% + 1.5px))',
              }}
            />
            {value === '' && <Check className="w-3 h-3 absolute inset-0 m-auto text-gray-600 drop-shadow" />}
          </button>
        )}
        {palette.map(c => (
          <button
            key={c.hex}
            type="button"
            title={c.label}
            onClick={() => onChange(c.hex)}
            className="relative w-9 h-9 rounded-full border-2 transition-all duration-150 hover:scale-110"
            style={{
              backgroundColor: c.hex,
              borderColor: value?.toLowerCase() === c.hex.toLowerCase() ? c.hex : 'transparent',
              boxShadow: value?.toLowerCase() === c.hex.toLowerCase()
                ? `0 0 0 2px white, 0 0 0 4px ${c.hex}`
                : 'none',
            }}
          >
            {value?.toLowerCase() === c.hex.toLowerCase() && (
              <Check className="w-3.5 h-3.5 absolute inset-0 m-auto drop-shadow" style={{ color: 'white' }} />
            )}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[.75rem] text-[#9ca3af]">
        {value === '' ? 'Predeterminado (según diseño)' : (selectedLabel ?? value)}
      </p>
    </div>
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
  const [mapsLink, setMapsLink] = useState('')

  function extractCoordsFromMapsLink(url: string): { lat: string; lng: string } | null {
    if (!url) return null
    const match1 = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match1) return { lat: match1[1], lng: match1[2] }
    const match2 = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match2) return { lat: match2[1], lng: match2[2] }
    return null
  }

  function parseMapsLink(url: string) {
    setMapsLink(url)
    const coords = extractCoordsFromMapsLink(url)
    if (coords) {
      onUpdate(index, { latitud: coords.lat, longitud: coords.lng })
    }
  }

  return (
    <div className="border border-[#e5e7eb] rounded-xl p-4 bg-[#fafafa]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c5a572]" />
          <span className="text-[.84rem] font-semibold text-[#2d2926]">{ub.tipo}</span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-[.75rem] text-[#9ca3af] hover:text-[#dc2626] transition-colors px-2 py-1 rounded hover:bg-[#fee2e2]"
        >
          Eliminar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label text="Nombre del lugar" required />
          <input type="text" maxLength={300} placeholder="Ej: Iglesia San Pedro"
            value={ub.nombre} onChange={e => onUpdate(index, { nombre: e.target.value })} className={INPUT} />
        </div>
        <div>
          <Label text="Hora (opcional)" />
          <input type="time" value={ub.hora ?? ''}
            onChange={e => onUpdate(index, { hora: e.target.value })} className={INPUT} />
        </div>
        <div className="sm:col-span-2">
          <Label text="Dirección completa" required />
          <input type="text" maxLength={500} placeholder="Ej: Av. Corrientes 1234, CABA"
            value={ub.direccion} onChange={e => onUpdate(index, { direccion: e.target.value })} className={INPUT} />
        </div>
        <div className="sm:col-span-2">
          <Label text="Link de Google Maps" />
          <input type="text" placeholder="Pegá el link completo de Maps (autocompleta lat/long)…"
            value={mapsLink} onChange={e => parseMapsLink(e.target.value)} className={INPUT} />
          <p className="text-[.7rem] text-[#9ca3af] mt-0.5">
            Usa el link largo desde el navegador — debe contener el símbolo @
          </p>
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
          <Label text="Latitud" required />
          <input type="number" step="any" placeholder="-34.5888"
            value={ub.latitud} onChange={e => onUpdate(index, { latitud: e.target.value })} className={INPUT} />
        </div>
        <div>
          <Label text="Longitud" required />
          <input type="number" step="any" placeholder="-58.6796"
            value={ub.longitud} onChange={e => onUpdate(index, { longitud: e.target.value })} className={INPUT} />
        </div>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  state: WizardStep2
  onChange: (updates: Partial<WizardStep2>) => void
  tipoEventoId: number | null
  templateSlug?: string | null
  onNext: () => void
  onPrev: () => void
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Step2Evento({ state, onChange, tipoEventoId, templateSlug, onNext, onPrev }: Props) {
  const [modoMultiple, setModoMultiple] = useState(() => state.ubicaciones.length > 0)
  const [mapsLinkSingle, setMapsLinkSingle] = useState('')
  const prevSlugRef = useRef(templateSlug)

  const esBoda     = tipoEventoId === 1
  const esQuince   = tipoEventoId === 2
  const esCumple   = tipoEventoId === 3

  // Quinceañera: always single location
  const efectivamenteMultiple = !esQuince && modoMultiple

  // Sync colorPrimario ↔ colorTematico for quinceañera
  useEffect(() => {
    if (esQuince) {
      const ct = state.camposEspecificos.colorTematico || '#DC83AA'
      if (state.colorPrimario !== ct) onChange({ colorPrimario: ct })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEventoId])

  // Reset color when template changes
  useEffect(() => {
    if (templateSlug && templateSlug !== prevSlugRef.current) {
      const paleta = (TEMPLATE_COLORS[templateSlug] || COLORES_PALETA) as { hex: string; label: string }[]
      const valido = paleta.some(c => c.hex.toLowerCase() === state.colorPrimario?.toLowerCase())
      if (!valido && paleta.length > 0) onChange({ colorPrimario: paleta[0].hex })
    }
    prevSlugRef.current = templateSlug ?? null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateSlug])

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function setField<K extends keyof WizardStep2>(key: K, value: WizardStep2[K]) {
    onChange({ [key]: value } as Partial<WizardStep2>)
  }

  function setCampo(key: string, value: string) {
    onChange({ camposEspecificos: { ...state.camposEspecificos, [key]: value } })
  }

  function getCampo(key: string, fallback = '') {
    return state.camposEspecificos[key] ?? fallback
  }

  function extractCoordsFromMapsLink(url: string): { lat: string; lng: string } | null {
    if (!url) return null

    // Format: /@lat,lng or /@lat,lng,zoom
    const match1 = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match1) return { lat: match1[1], lng: match1[2] }

    // Format: ?q=lat,lng
    const match2 = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match2) return { lat: match2[1], lng: match2[2] }

    return null
  }

  function handleMapsLinkSingle(url: string) {
    setMapsLinkSingle(url)
    const coords = extractCoordsFromMapsLink(url)
    if (coords) onChange({ latitud: coords.lat, longitud: coords.lng } as Partial<WizardStep2>)
  }

  function activarModoMultiple() {
    setModoMultiple(true)
    onChange({ ubicacion: 'multiple', direccion: 'multiple', latitud: '0', longitud: '0' })
  }

  function desactivarModoMultiple() {
    setModoMultiple(false)
    onChange({ ubicaciones: [], ubicacion: '', direccion: '', latitud: '', longitud: '' })
    setMapsLinkSingle('')
  }

  function agregarUbicacion(tipo: TipoUbicacion) {
    onChange({
      ubicaciones: [...state.ubicaciones, { tipo, nombre: '', direccion: '', latitud: '', longitud: '', hora: '' }],
    })
  }

  function actualizarUbicacion(index: number, updates: Partial<UbicacionEvento>) {
    onChange({ ubicaciones: state.ubicaciones.map((u, i) => i === index ? { ...u, ...updates } : u) })
  }

  function eliminarUbicacion(index: number) {
    onChange({ ubicaciones: state.ubicaciones.filter((_, i) => i !== index) })
  }

  const tiposUsados      = state.ubicaciones.map(u => u.tipo)
  const tiposDisponibles = TIPOS_UBICACION.filter(t => !tiposUsados.includes(t))

  // ── Palette ──────────────────────────────────────────────────────────────────

  const paleta = (templateSlug ? (TEMPLATE_COLORS[templateSlug] || COLORES_PALETA) : COLORES_PALETA) as { hex: string; label: string }[]

  // ── Validation ───────────────────────────────────────────────────────────────

  const ubicacionOk = efectivamenteMultiple
    ? state.ubicaciones.length >= 1 &&
      state.ubicaciones.every(u => u.nombre.trim() && u.direccion.trim() && u.latitud && u.longitud)
    : !!(state.ubicacion.trim() && state.direccion.trim() && state.latitud && state.longitud)

  const canProceed = !!(state.fechaEvento && state.horaEvento) && ubicacionOk

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-xl font-semibold text-[#2d2926]">Detalles del evento</h2>
        <p className="text-[.84rem] text-[#6b7280] mt-1">
          Completá la información de los protagonistas, fecha, lugar y personalización.
        </p>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 1 · Protagonistas                                               */}
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {tipoEventoId && (
        <Section icon={Users} title={
          esBoda ? 'La pareja' : esQuince ? 'La quinceañera' : 'El festejado/a'
        }>
          <div className="bg-[#faf8f5] border border-[#f0ede8] rounded-xl p-4">
            {/* BODA */}
            {esBoda && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label text="Nombre Novio/a 1" required />
                  <input
                    type="text" placeholder="Ej: Camila"
                    value={getCampo('novio1')} onChange={e => setCampo('novio1', e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <Label text="Nombre Novio/a 2" required />
                  <input
                    type="text" placeholder="Ej: Joaquín"
                    value={getCampo('novio2')} onChange={e => setCampo('novio2', e.target.value)}
                    className={INPUT}
                  />
                </div>
              </div>
            )}

            {/* QUINCEAÑERA */}
            {esQuince && (
              <div className="space-y-4">
                <div>
                  <Label text="Nombre de la quinceañera" required />
                  <input
                    type="text" placeholder="Ej: Martina"
                    value={getCampo('nombre')} onChange={e => setCampo('nombre', e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <Label text="Color temático" />
                  <ColorPicker
                    value={getCampo('colorTematico', paleta[0]?.hex ?? '#DC83AA')}
                    palette={paleta}
                    onChange={hex => {
                      setCampo('colorTematico', hex)
                      setField('colorPrimario', hex)
                    }}
                  />
                </div>
              </div>
            )}

            {/* CUMPLEAÑOS */}
            {esCumple && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label text="Nombre del festejado/a" required />
                  <input
                    type="text" placeholder="Ej: Franco"
                    value={getCampo('nombre')} onChange={e => setCampo('nombre', e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <Label text="Edad que cumple" />
                  <input
                    type="number" min={1} max={150} placeholder="Ej: 30"
                    value={getCampo('edad')} onChange={e => setCampo('edad', e.target.value)}
                    className={INPUT}
                  />
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 2 · Fecha y hora                                                */}
      {/* ──────────────────────────────────────────────────────────────────────── */}

      <Section icon={Calendar} title="Fecha y hora">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label text="Fecha del evento" required />
            <input type="date" value={state.fechaEvento}
              onChange={e => setField('fechaEvento', e.target.value)} className={INPUT} />
          </div>
          <div>
            <Label text="Hora del evento" required />
            <input type="time" value={state.horaEvento}
              onChange={e => setField('horaEvento', e.target.value)} className={INPUT} />
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 3 · Ubicación                                                   */}
      {/* ──────────────────────────────────────────────────────────────────────── */}

      <Section icon={MapPin} title="Ubicación">

        {/* Mode toggle — only for events that support multiple locations */}
        {!esQuince && !esCumple && (
          <div className="flex items-center gap-3 p-3.5 mb-4 rounded-xl border border-[#e5e7eb] bg-[#f9fafb]">
            <div className="flex-1">
              <p className="text-[.84rem] font-medium text-[#2d2926]">
                {modoMultiple ? 'Múltiples lugares' : 'Un solo lugar'}
              </p>
              <p className="text-[.72rem] text-[#9ca3af] mt-0.5">
                {modoMultiple
                  ? 'Agregá un lugar por cada momento del evento (Iglesia, Civil, Recepción…)'
                  : 'Toda la celebración ocurre en un mismo lugar'}
              </p>
            </div>
            {modoMultiple ? (
              <button type="button" onClick={desactivarModoMultiple}
                className="text-[.78rem] px-3 py-1.5 rounded-lg border border-[#d1d5db] text-[#4a4441] hover:border-[#4a4441] transition-colors shrink-0">
                Un solo lugar
              </button>
            ) : (
              <button type="button" onClick={activarModoMultiple}
                className="text-[.78rem] px-3 py-1.5 rounded-lg border border-[#c5a572] text-[#c5a572] hover:bg-[#c5a572] hover:text-white transition-colors shrink-0">
                + Múltiples lugares
              </button>
            )}
          </div>
        )}

        {/* Single location */}
        {!efectivamenteMultiple && (
          <div className="bg-[#faf8f5] border border-[#f0ede8] rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {esBoda && (
                <div>
                  <Label text="Tipo de lugar" />
                  <select
                    value={getCampo('tipoCeremonia', 'Recepción')}
                    onChange={e => setCampo('tipoCeremonia', e.target.value)}
                    className={INPUT}
                  >
                    {TIPOS_UBICACION.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              )}
              <div className={esBoda ? '' : 'sm:col-span-2'}>
                <Label text="Nombre del lugar" required />
                <input type="text" maxLength={300} placeholder="Ej: Estancia La Primavera"
                  value={state.ubicacion} onChange={e => setField('ubicacion', e.target.value)} className={INPUT} />
              </div>
              <div className="sm:col-span-2">
                <Label text="Dirección completa" required />
                <input type="text" maxLength={500} placeholder="Ej: Ruta 6 Km 20, Pilar, Buenos Aires"
                  value={state.direccion} onChange={e => setField('direccion', e.target.value)} className={INPUT} />
              </div>

              {/* Maps link */}
              <div className="sm:col-span-2">
                <Label text="Link de Google Maps (autocompleta latitud y longitud)" />
                <input type="text"
                  placeholder="Pegá el link completo de Maps aquí…"
                  value={mapsLinkSingle}
                  onChange={e => handleMapsLinkSingle(e.target.value)}
                  className={INPUT}
                />
                <p className="text-[.72rem] text-[#9ca3af] mt-0.5">
                  Usa el link largo desde el navegador — debe contener el símbolo @
                </p>
              </div>

              {/* Map picker */}
              <div className="sm:col-span-2">
                <Label text="Ubicación en el mapa" required />
                <MapPicker
                  latitud={state.latitud}
                  longitud={state.longitud}
                  onChange={(lat, lng) => {
                    setField('latitud', lat)
                    setField('longitud', lng)
                  }}
                />
              </div>

              {/* Lat / Long — secondary, auto-filled */}
              <div>
                <Label text="Latitud" required />
                <input type="number" step="any" placeholder="-34.5888"
                  value={state.latitud || ''} onChange={e => setField('latitud', e.target.value)} className={INPUT} />
              </div>
              <div>
                <Label text="Longitud" required />
                <input type="number" step="any" placeholder="-58.6796"
                  value={state.longitud || ''} onChange={e => setField('longitud', e.target.value)} className={INPUT} />
              </div>
            </div>
          </div>
        )}

        {/* Multiple locations */}
        {efectivamenteMultiple && (
          <div className="space-y-3">
            {state.ubicaciones.map((ub, i) => (
              <UbicacionCard
                key={ub.tipo}
                ub={ub} index={i}
                onUpdate={actualizarUbicacion}
                onRemove={eliminarUbicacion}
              />
            ))}

            {tiposDisponibles.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tiposDisponibles.map(tipo => (
                  <button key={tipo} type="button" onClick={() => agregarUbicacion(tipo)}
                    className="text-[.8rem] px-4 py-2 rounded-xl border-2 border-dashed border-[#c5a572] text-[#c5a572] hover:bg-[#c5a572] hover:text-white transition-colors font-medium">
                    + Agregar {tipo}
                  </button>
                ))}
              </div>
            )}

            {state.ubicaciones.length === 0 && (
              <p className="text-[.82rem] text-[#9ca3af] py-4 text-center">
                Agregá al menos una ubicación usando los botones de arriba
              </p>
            )}
          </div>
        )}
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 4 · Personalización                                             */}
      {/* ──────────────────────────────────────────────────────────────────────── */}

      <Section icon={Palette} title="Personalización">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Color primario — not for Quinceañera (synced from color temático) */}
          {!esQuince && (
            <div className="sm:col-span-2">
              <Label text="Color primario de la invitación" />
              <ColorPicker
                value={state.colorPrimario}
                palette={paleta}
                onChange={hex => setField('colorPrimario', hex)}
                showDefault={!templateSlug || !TEMPLATE_COLORS[templateSlug]}
              />
            </div>
          )}

          {/* Dress code */}
          <div>
            <Label text="Dress code" />
            <input
              type="text" maxLength={100} placeholder="Ej: Elegante"
              value={getCampo('dressCode')} onChange={e => setCampo('dressCode', e.target.value)}
              className={INPUT}
            />
          </div>

          {/* Temática (Quinceañera) */}
          {esQuince && (
            <div>
              <Label text="Temática" />
              <input
                type="text" maxLength={200} placeholder="Ej: Fiesta de disfraces"
                value={getCampo('tematica')} onChange={e => setCampo('tematica', e.target.value)}
                className={INPUT}
              />
            </div>
          )}

          {/* Actividades (Cumpleaños) */}
          {esCumple && (
            <div className="sm:col-span-2">
              <Label text="Actividades del festejo" />
              <textarea
                rows={2} maxLength={500} placeholder="Ej: Cena, baile, show sorpresa…"
                value={getCampo('actividades')} onChange={e => setCampo('actividades', e.target.value)}
                className={INPUT + ' resize-none'}
              />
            </div>
          )}
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 5 · Mesa de regalos (Boda only)                                */}
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {esBoda && (
        <Section icon={Gift} title="Mesa de regalos">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lluvia de sobres toggle */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-[#e5e7eb] bg-[#fafafa]">
                <button
                  type="button"
                  onClick={() => {
                    const current = getCampo('mostrarLluviaSobres', 'true')
                    setCampo('mostrarLluviaSobres', current === 'false' ? 'true' : 'false')
                  }}
                  className={[
                    'relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors focus:outline-none',
                    getCampo('mostrarLluviaSobres', 'true') !== 'false' ? 'bg-[#c5a572]' : 'bg-[#d1d5db]',
                  ].join(' ')}
                >
                  <span className={[
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    getCampo('mostrarLluviaSobres', 'true') !== 'false' ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')} />
                </button>
                <div>
                  <p className="text-[.85rem] font-medium text-[#2d2926]">Mostrar lluvia de sobres</p>
                  <p className="text-[.72rem] text-[#9ca3af] mt-0.5">Activa la sección de transferencia bancaria en la invitación</p>
                </div>
              </div>
            </div>
            <div>
              <Label text="Alias (cuenta bancaria)" />
              <input
                type="text" maxLength={200} placeholder="Ej: nombreapellido.mp"
                value={getCampo('alias')} onChange={e => setCampo('alias', e.target.value)}
                className={INPUT}
              />
            </div>
            <div>
              <Label text="CBU / CVU" />
              <input
                type="text" maxLength={22} placeholder="0000003100010000000000"
                value={getCampo('cbu')} onChange={e => setCampo('cbu', e.target.value)}
                className={INPUT}
              />
            </div>
          </div>
        </Section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 6 · Configuración técnica                                       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}

      <Section icon={Settings} title="Configuración">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label text="Contraseña lista de asistentes" />
            <input
              type="text" maxLength={255} placeholder="Para que el anfitrión vea las confirmaciones"
              value={state.contrasenaAsistentes} onChange={e => setField('contrasenaAsistentes', e.target.value)}
              className={INPUT}
            />
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 7 · Información adicional                                       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}

      <Section icon={Info} title="Información adicional">
        <div>
          {!esQuince && (
            <Label text={
              esBoda ? 'Texto extra para los invitados'
              : esCumple ? 'Notas para los invitados'
              : 'Frase o dedicatoria'
            } />
          )}
          <textarea
            rows={3} maxLength={3000}
            placeholder={
              esBoda ? 'Ej: Avisanos si tenés alguna restricción alimentaria…'
              : esQuince ? 'Ej: "Que todos tus sueños se hagan realidad…"'
              : 'Ej: ¡A festejar!'
            }
            value={
              esBoda ? getCampo('infoAdicional')
              : esCumple ? getCampo('notas')
              : getCampo('frase')
            }
            onChange={e => {
              const campo = esBoda ? 'infoAdicional' : esCumple ? 'notas' : 'frase'
              setCampo(campo, e.target.value)
            }}
            className={INPUT + ' resize-none'}
          />
          <div className="flex justify-end mt-0.5">
            <span className="text-[.7rem] text-[#b0b7c3]">
              {(esBoda ? getCampo('infoAdicional') : esCumple ? getCampo('notas') : getCampo('frase')).length}/3000
            </span>
          </div>
        </div>
      </Section>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-xl text-[.88rem] font-medium hover:border-[#2d2926] transition-colors">
          ← Anterior
        </button>
        <div className="flex items-center gap-4">
          {!canProceed && (
            <span className="text-[.76rem] text-[#9ca3af] hidden sm:block">
              {!state.fechaEvento || !state.horaEvento
                ? 'Completá fecha y hora'
                : !ubicacionOk ? 'Completá los datos del lugar' : ''}
            </span>
          )}
          <button type="button" onClick={onNext} disabled={!canProceed}
            className="px-6 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-xl text-[.88rem] font-semibold hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Continuar →
          </button>
        </div>
      </div>
    </div>
  )
}
