import { useState } from "react"
import { MapPin, Copy, Check } from "lucide-react"
import type { InvitacionPublica, UbicacionEventoPublica, TipoUbicacion } from "@/types/invitation"

const FONT_SCRIPT = "'Pinyon Script', cursive"
const FONT_BODY = "Montserrat, sans-serif"

interface LocationsSectionProps {
  invitacion: InvitacionPublica
}

const LOCATION_ICONS: Record<TipoUbicacion, string> = {
  "Civil": "/boda-rustica/icon-civil.gif",
  "Iglesia": "/boda-rustica/icon-ceremonia.gif",
  "Recepción": "/boda-rustica/icon-recepcion.gif",
  "Fiesta": "/boda-rustica/icon-fiesta.gif",
}

const TIPO_ORDER: TipoUbicacion[] = ["Civil", "Iglesia", "Recepción", "Fiesta"]

function getIcon(tipo: TipoUbicacion): string {
  return LOCATION_ICONS[tipo] ?? "/boda-rustica/icon-recepcion.gif"
}

function sortLocations(locs: UbicacionEventoPublica[]): UbicacionEventoPublica[] {
  return [...locs].sort((a, b) => {
    const ai = TIPO_ORDER.indexOf(a.tipo)
    const bi = TIPO_ORDER.indexOf(b.tipo)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

function ActionButtons({
  mapsUrl,
  copiado,
  onCopy,
}: {
  mapsUrl: string
  copiado: boolean
  onCopy: () => void
}) {
  return (
    <div className="mt-4 flex gap-3" style={{ fontFamily: FONT_BODY }}>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-base text-white/85 hover:bg-white/10 transition-colors"
      >
        <MapPin className="h-3.5 w-3.5" />
        Ver en Maps
      </a>
      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-base text-white/85 hover:bg-white/10 transition-colors"
      >
        {copiado ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-400" />
            Copiado
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copiar
          </>
        )}
      </button>
    </div>
  )
}

function LocationCard({ ubicacion }: { ubicacion: UbicacionEventoPublica }) {
  const [copiado, setCopiado] = useState(false)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${ubicacion.latitud},${ubicacion.longitud}`

  const copiar = async () => {
    try {
      const texto = ubicacion.direccion
        ? `${ubicacion.nombre}, ${ubicacion.direccion}`
        : ubicacion.nombre
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // silent
    }
  }

  return (
    <div className="flex flex-col items-center text-center w-full">
      <img
        src={getIcon(ubicacion.tipo)}
        alt={ubicacion.tipo}
        className="w-[7.5rem] h-[7.5rem] object-contain"
        loading="lazy"
      />
      <h3
        className="mt-1 text-[2.2rem] leading-tight text-white/90"
        style={{ fontFamily: FONT_SCRIPT }}
      >
        {ubicacion.tipo}
      </h3>
      <p
        className="mt-2 text-base font-light text-white/80 tracking-wider"
        style={{ fontFamily: FONT_BODY }}
      >
        {ubicacion.hora ? `${ubicacion.hora} hs · ` : ""}
        {ubicacion.nombre}
      </p>
      {ubicacion.direccion && (
        <p
          className="mt-1 text-base text-white/55 max-w-[200px] leading-relaxed"
          style={{ fontFamily: FONT_BODY }}
        >
          {ubicacion.direccion}
        </p>
      )}
      <ActionButtons mapsUrl={mapsUrl} copiado={copiado} onCopy={copiar} />
    </div>
  )
}

function SingleLocationCard({ invitacion }: { invitacion: InvitacionPublica }) {
  const tipoSingle: TipoUbicacion =
    (invitacion.camposEspecificos?.tipoCeremonia as TipoUbicacion | undefined) ?? "Recepción"
  const [copiado, setCopiado] = useState(false)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${invitacion.latitud},${invitacion.longitud}`

  const copiar = async () => {
    try {
      const texto = invitacion.direccion
        ? `${invitacion.ubicacion}, ${invitacion.direccion}`
        : invitacion.ubicacion
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // silent
    }
  }

  return (
    <div className="flex flex-col items-center text-center w-full">
      <img
        src={LOCATION_ICONS[tipoSingle] ?? "/boda-rustica/icon-recepcion.gif"}
        alt={tipoSingle}
        className="w-[7.5rem] h-[7.5rem] object-contain"
        loading="lazy"
      />
      <h3
        className="mt-1 text-[2.2rem] leading-tight text-white/90"
        style={{ fontFamily: FONT_SCRIPT }}
      >
        {tipoSingle}
      </h3>
      <p
        className="mt-2 text-base font-light text-white/80 tracking-wider"
        style={{ fontFamily: FONT_BODY }}
      >
        {invitacion.horaEvento} hs · {invitacion.ubicacion}
      </p>
      {invitacion.direccion && (
        <p
          className="mt-1 text-base text-white/55 max-w-[200px] leading-relaxed"
          style={{ fontFamily: FONT_BODY }}
        >
          {invitacion.direccion}
        </p>
      )}
      <ActionButtons mapsUrl={mapsUrl} copiado={copiado} onCopy={copiar} />
    </div>
  )
}

export function LocationsSection({ invitacion }: LocationsSectionProps) {
  const { ubicacion, camposEspecificos } = invitacion

  const esMultiple = ubicacion === "multiple"
  const ubicaciones = esMultiple
    ? sortLocations(
      (camposEspecificos?.ubicaciones as UbicacionEventoPublica[] | undefined) ?? [],
    )
    : null

  return (
    <section
      className="relative -mt-8 z-10 px-10 pt-0 pb-10"
      style={{ backgroundColor: "var(--invitation-primary)" }}
    >
      {/* Rectángulo blanco — full-width, visible detrás del arco */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-white" />

      {/* Tarjeta con arco — esquinas superiores redondeadas formando un arco */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          backgroundColor: "var(--invitation-primary)",
          borderRadius: "50% 50% 0 0 / 170px 170px 0 0",
          boxShadow: "0 -6px 24px rgba(0,0,0,0.18)",
          marginTop: "24px",
        }}
      >
        {/* Textura del hero con blend mode soft-light */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/boda-moderna/B3Fondo.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "overlay",
            borderRadius: "50% 50% 0 0 / 170px 170px 0 0",
          }}
        />

        {/* Contenido */}
        <div className="relative z-10 pt-28 pb-16 px-8 flex flex-col items-center gap-10">
          {esMultiple && ubicaciones && ubicaciones.length > 0 ? (
            ubicaciones.map((ub) => <LocationCard key={ub.tipo} ubicacion={ub} />)
          ) : (
            <SingleLocationCard invitacion={invitacion} />
          )}
        </div>
      </div>
    </section>
  )
}
