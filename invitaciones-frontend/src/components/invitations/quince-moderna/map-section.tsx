import { useState } from "react"
import { MapPin, Copy, Check } from "lucide-react"
import type { InvitacionPublica, UbicacionEventoPublica } from "@/types/invitation"

const FONT_BODY = "'DM Sans', sans-serif"
const FONT_HEADING = "'Source Serif 4', Georgia, serif"

interface LocationData {
  nombre: string
  direccion: string
  latitud: number
  longitud: number
  label?: string
}

function getLocations(invitacion: InvitacionPublica): LocationData[] {
  if (invitacion.ubicacion === "multiple") {
    const ubicaciones =
      (invitacion.camposEspecificos?.ubicaciones as UbicacionEventoPublica[] | undefined) ?? []
    return ubicaciones.map((u) => ({
      nombre: u.nombre,
      direccion: u.direccion,
      latitud: u.latitud,
      longitud: u.longitud,
      label: u.tipo,
    }))
  }
  return [
    {
      nombre: invitacion.ubicacion,
      direccion: invitacion.direccion,
      latitud: invitacion.latitud,
      longitud: invitacion.longitud,
    },
  ]
}

function LocationCard({ location }: { location: LocationData }) {
  const [copiado, setCopiado] = useState(false)
  const embedUrl = `https://maps.google.com/maps?q=${location.latitud},${location.longitud}&t=&z=16&ie=UTF8&iwloc=&output=embed`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitud},${location.longitud}`

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`${location.nombre}, ${location.direccion}`)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // silent
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {location.label && (
        <p
          className="text-[0.65rem] uppercase tracking-widest"
          style={{ fontFamily: FONT_BODY, color: "var(--invitation-primary)" }}
        >
          {location.label}
        </p>
      )}
      <p className="text-base text-white" style={{ fontFamily: FONT_BODY }}>
        {location.nombre}
      </p>
      {location.direccion && (
        <p className="text-sm text-white/70 -mt-2" style={{ fontFamily: FONT_BODY }}>
          {location.direccion}
        </p>
      )}

      {/* Map iframe */}
      <div
        className="h-48 w-full overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--invitation-border)" }}
      >
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title={`Ubicación: ${location.nombre}`}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm text-white transition-opacity hover:opacity-80"
          style={{
            fontFamily: FONT_BODY,
            backgroundColor: "#181C47",
            border: "1px solid",
            borderImage: "linear-gradient(to right, var(--invitation-primary), transparent) 1",
          }}
        >
          <MapPin className="h-4 w-4" style={{ color: "var(--invitation-primary)" }} />
          Abrir en Maps
        </a>
        <button
          onClick={copiar}
          className="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm text-white transition-opacity hover:opacity-80 cursor-pointer"
          style={{
            fontFamily: FONT_BODY,
            backgroundColor: "#181C47",
            border: "1px solid",
            borderImage: "linear-gradient(to right, var(--invitation-primary), transparent) 1",
          }}
        >
          {copiado ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar dirección
            </>
          )}
        </button>
      </div>
    </div>
  )
}

interface MapSectionProps {
  invitacion: InvitacionPublica
}

export function MapSection({ invitacion }: MapSectionProps) {
  const locations = getLocations(invitacion)

  return (
    <section className="flex flex-col items-center px-10 pb-12 pt-12 gap-7">
      {/* Separator + heading */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="w-2/3 h-[2px] opacity-40" style={{ backgroundColor: "var(--invitation-primary)" }} />
        <h2
          className="text-[1.5rem]"
          style={{ fontFamily: FONT_HEADING, fontStyle: "italic", color: "white" }}
        >
          {locations.length > 1 ? "Ubicaciones" : "Ubicaci\u00f3n"}
        </h2>
      </div>

      <div className="flex flex-col gap-8 w-full px-3">
      {locations.map((loc, i) => (
        <LocationCard key={i} location={loc} />
      ))}
      </div>
    </section>
  )
}
