import { useState } from "react"
import type { InvitacionPublica, UbicacionEventoPublica } from "@/types/invitation"

const FONT_BODY = "Montserrat, sans-serif"

interface MapSectionProps {
  invitacion: InvitacionPublica
}

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
    <div className="flex flex-col gap-4 self-stretch w-full">
      {location.label && (
        <p className="text-[#777777] text-base font-medium uppercase tracking-wide">
          {location.label}
        </p>
      )}

      {/* Mapa */}
      <div className="h-48 w-full overflow-hidden rounded-xl bg-neutral-100 border border-dashed border-[#e0e0e0]">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title={`Ubicación de ${location.nombre}`}
        />
      </div>

      {/* Botones de acción */}
      <div className="flex items-start justify-center gap-2.5 self-stretch w-full">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col p-3 flex-1 bg-[#555555] rounded-lg items-center justify-center text-white text-base text-center hover:opacity-90 transition-opacity"
        >
          Abrir en Maps
        </a>
        <button
          onClick={copiar}
          className="flex flex-col p-3 flex-1 rounded-lg items-center justify-center text-[#555555] text-base text-center hover:bg-neutral-100 transition-colors"
        >
          {copiado ? "¡Copiado!" : "Copiar dirección"}
        </button>
      </div>
    </div>
  )
}

export function MapSection({ invitacion }: MapSectionProps) {
  const locations = getLocations(invitacion)

  if (locations.length === 0 || !invitacion.latitud) return null

  return (
    <section
      className="flex flex-col items-start gap-6 px-7 py-12 border-b border-[#e0e0e0]"
      style={{ fontFamily: FONT_BODY }}
    >
      {/* Título de sección */}
      <div className="flex flex-col items-center self-stretch w-full">
        <p className="text-[#777777] text-base text-center">Ubicación</p>
      </div>

      {locations.map((loc, i) => (
        <LocationCard key={i} location={loc} />
      ))}
    </section>
  )
}
