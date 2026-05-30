import { useState } from "react"
import { MapPin, Copy, Check } from "lucide-react"
import type { InvitacionPublica, UbicacionEventoPublica, TipoUbicacion } from "@/types/invitation"

interface LocationsSectionProps {
  invitacion: InvitacionPublica
}

const LOCATION_ICONS: Record<TipoUbicacion, string> = {
  "Civil":     "/boda-rustica/icon-civil.gif",
  "Iglesia":   "/boda-rustica/icon-ceremonia.gif",
  "Recepción": "/boda-rustica/icon-recepcion.gif",
  "Fiesta":    "/boda-rustica/icon-fiesta.gif",
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

function LocationCard({ ubicacion }: { ubicacion: UbicacionEventoPublica }) {
  const icon = getIcon(ubicacion.tipo)
  const [copiado, setCopiado] = useState(false)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${ubicacion.latitud},${ubicacion.longitud}`

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`${ubicacion.nombre}, ${ubicacion.direccion}`)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // silent
    }
  }

  return (
    <div className="flex w-[20.625rem] flex-col items-center text-center">
      <img
        src={icon}
        alt={ubicacion.tipo}
        className="w-[6.25rem] max-h-[6.25rem] object-contain"
        loading="lazy"
      />
      <h2
        className="mt-1 text-[2rem] font-bold text-white"
        style={{ fontFamily: "'Dancing Script', cursive" }}
      >
        {ubicacion.tipo}
      </h2>
      <p
        className="mt-2 text-base font-medium text-[#f1f1f0]"
        style={{ fontFamily: "Quicksand, sans-serif" }}
      >
        {ubicacion.hora ? `${ubicacion.hora} hs · ` : ""}{ubicacion.nombre}
      </p>
      {ubicacion.direccion && (
        <p
          className="mt-1 text-sm text-white/70 w-[14rem] leading-relaxed"
          style={{ fontFamily: "Quicksand, sans-serif" }}
        >
          {ubicacion.direccion}
        </p>
      )}
      <div className="mt-4 flex gap-2.5" style={{ fontFamily: "Quicksand, sans-serif" }}>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white bg-white/20 hover:bg-white/30 transition-colors"
        >
          <MapPin className="h-4 w-4 text-white" />
          Ver en Maps
        </a>
        <button
          onClick={copiar}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white bg-white/20 hover:bg-white/30 transition-colors"
        >
          {copiado ? (
            <><Check className="h-4 w-4 text-green-400" />Copiado</>
          ) : (
            <><Copy className="h-4 w-4 text-white" />Copiar</>
          )}
        </button>
      </div>
    </div>
  )
}

function SingleLocationCard({ invitacion }: { invitacion: InvitacionPublica }) {
  const tipoSingle: TipoUbicacion =
    (invitacion.camposEspecificos?.tipoCeremonia as TipoUbicacion | undefined) ?? "Recepción"
  const iconSingle = LOCATION_ICONS[tipoSingle] ?? "/boda-rustica/icon-recepcion.gif"
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
    <div className="flex w-[20.625rem] flex-col items-center text-center">
      <img
        src={iconSingle}
        alt={tipoSingle}
        className="w-[6.25rem] max-h-[6.25rem] object-contain"
        loading="lazy"
      />
      <h2
        className="mt-1 text-[2rem] font-bold text-white"
        style={{ fontFamily: "'Dancing Script', cursive" }}
      >
        {tipoSingle}
      </h2>
      <p
        className="mt-2 text-base font-medium text-[#f1f1f0]"
        style={{ fontFamily: "Quicksand, sans-serif" }}
      >
        {invitacion.horaEvento} hs · {invitacion.ubicacion}
      </p>
      {invitacion.direccion && (
        <p
          className="mt-1 text-sm text-white/70 w-[14rem] leading-relaxed"
          style={{ fontFamily: "Quicksand, sans-serif" }}
        >
          {invitacion.direccion}
        </p>
      )}
      <div className="mt-4 flex gap-2.5" style={{ fontFamily: "Quicksand, sans-serif" }}>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white bg-white/20 hover:bg-white/30 transition-colors"
        >
          <MapPin className="h-4 w-4 text-white" />
          Ver en Maps
        </a>
        <button
          onClick={copiar}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white bg-white/20 hover:bg-white/30 transition-colors"
        >
          {copiado ? (
            <><Check className="h-4 w-4 text-green-400" />Copiado</>
          ) : (
            <><Copy className="h-4 w-4 text-white" />Copiar</>
          )}
        </button>
      </div>
    </div>
  )
}

export function LocationsSection({ invitacion }: LocationsSectionProps) {
  const { ubicacion, camposEspecificos } = invitacion

  const esMultiple = ubicacion === "multiple"
  const ubicaciones = esMultiple
    ? sortLocations(
        (camposEspecificos?.ubicaciones as UbicacionEventoPublica[] | undefined) ?? []
      )
    : null

  return (
    <section className="relative isolate self-stretch flex flex-col items-center justify-center py-10 px-9 text-center">
      {/* Leaves decoration – top-left: centered on the card's top-left corner */}
      <img
        src="/boda-rustica/leaves-stains.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-22 z-10 w-[17rem] h-[17rem] object-contain -translate-x-1/2 -translate-y-1/2"
      />

      {/* Leaves decoration – bottom-right: centered on the card's bottom-right corner */}
      <img
        src="/boda-rustica/leaves-stains-2.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-22 z-10 w-[17rem] h-[17rem] object-contain translate-x-1/2 translate-y-1/2"
      />

      <div
        className="relative w-full rounded-[10px] flex flex-col items-center justify-center py-16 gap-8 shadow-[0_8px_32px_rgba(0,0,0,0.22)]"
        style={{ backgroundColor: "var(--invitation-primary)" }}
      >

        {esMultiple && ubicaciones && ubicaciones.length > 0 ? (
          ubicaciones.map((ub) => (
            <LocationCard key={ub.tipo} ubicacion={ub} />
          ))
        ) : (
          <SingleLocationCard invitacion={invitacion} />
        )}
      </div>
    </section>
  )
}
