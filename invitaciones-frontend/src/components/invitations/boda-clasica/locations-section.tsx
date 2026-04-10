import { useState } from "react"
import { MapPin, Copy, Check } from "lucide-react"
import type { InvitacionPublica, UbicacionEventoPublica } from "@/types/invitation"

import type { TipoUbicacion } from "@/types/invitation"

interface LocationsSectionProps {
  invitacion: InvitacionPublica
  colorBg: string // rgba(...) pre-computado al 20% de opacidad
}

const LOCATION_ICONS: Record<TipoUbicacion, string> = {
  "Iglesia":   "/boda-clasica/icon-ceremonia.gif",
  "Civil":     "/boda-clasica/icon-civil.gif",
  "Recepción": "/boda-clasica/icon-recepcion.gif",
  "Fiesta":    "/boda-clasica/icon-fiesta.gif",
}

const TIPO_ORDER: TipoUbicacion[] = ["Iglesia", "Civil", "Recepción", "Fiesta"]

function getIcon(tipo: TipoUbicacion): string {
  return LOCATION_ICONS[tipo] ?? "/boda-clasica/icon-recepcion.gif"
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
    <div
      className="flex flex-col items-center text-center w-[20.625rem]"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
    >
      <img
        src={icon}
        alt={ubicacion.tipo}
        className="w-[6.25rem] max-h-[6.25rem] object-contain"
        loading="lazy"
      />
      <h2 className="mt-1 text-[2rem] font-semibold capitalize text-[#333]">
        {ubicacion.tipo.charAt(0).toUpperCase() + ubicacion.tipo.slice(1)}
      </h2>
      <p
        className="mt-2 w-[15.625rem] text-xl text-[#1a1a1a]"
        style={{ fontFamily: "Lato, sans-serif" }}
      >
        {ubicacion.nombre}
      </p>
      {ubicacion.direccion && (
        <p
          className="mt-1.5 text-base text-[#888] w-[14rem] leading-relaxed"
          style={{ fontFamily: "Lato, sans-serif" }}
        >
          {ubicacion.direccion}
        </p>
      )}
      <div className="mt-4 flex gap-2.5" style={{ fontFamily: "Lato, sans-serif" }}>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full px-4 py-2 text-base text-[#444] bg-white/60 hover:bg-white/90 transition-colors"
        >
          <MapPin className="h-4 w-4" style={{ color: "var(--invitation-primary)" }} />
          Ver en Maps
        </a>
        <button
          onClick={copiar}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-base text-[#444] bg-white/60 hover:bg-white/90 transition-colors"
        >
          {copiado ? (
            <><Check className="h-4 w-4 text-green-600" />Copiado</>
          ) : (
            <><Copy className="h-4 w-4" />Copiar</>
          )}
        </button>
      </div>
    </div>
  )
}

export function LocationsSection({ invitacion, colorBg }: LocationsSectionProps) {
  const { ubicacion, camposEspecificos } = invitacion

  const esMultiple = ubicacion === "multiple"
  const ubicaciones = esMultiple
    ? sortLocations(
        (camposEspecificos?.ubicaciones as UbicacionEventoPublica[] | undefined) ?? []
      )
    : null

  // Single location: full-width background con color variable al 20%
  if (!esMultiple || !ubicaciones || ubicaciones.length === 0) {
    const tipoSingle: TipoUbicacion =
      (camposEspecificos?.tipoCeremonia as TipoUbicacion | undefined) ?? "Recepción"
    const iconSingle = LOCATION_ICONS[tipoSingle] ?? "/boda-clasica/icon-recepcion.gif"

    return (
      <section
        className="self-stretch w-full py-10 flex flex-col items-center gap-4 relative overflow-hidden isolate"
        style={{ backgroundColor: colorBg }}
      >
        <img
          src="/boda-clasica/locations-bg.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-20 pointer-events-none -z-10"
        />
        <img
          src={iconSingle}
          alt="Lugar"
          className="relative w-[6.25rem] max-h-[6.25rem] object-contain"
          loading="lazy"
        />
        <h2
          className="relative text-[2rem] font-semibold text-[#333]"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {tipoSingle}
        </h2>
        <p
          className="relative text-xl text-[#1a1a1a] text-center px-8"
          style={{ fontFamily: "Lato, sans-serif" }}
        >
          {invitacion.ubicacion}
        </p>
      </section>
    )
  }

  // Multiple locations: oval pill con color variable al 20%
  return (
    <section className="self-stretch flex flex-col items-center justify-center py-10 px-9 text-center">
      <div
        className="relative w-full rounded-[183px] flex flex-col items-center justify-center py-20 gap-10 overflow-hidden isolate"
        style={{ backgroundColor: colorBg }}
      >
        <img
          src={ubicaciones.length > 2 ? "/boda-clasica/locations-bg-2.png" : "/boda-clasica/locations-bg.png"}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-20 pointer-events-none -z-10"
        />
        {ubicaciones.map((ub) => (
          <LocationCard key={ub.tipo} ubicacion={ub} />
        ))}
      </div>
    </section>
  )
}
