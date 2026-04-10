import { useState } from "react"
import { MapPin, Copy, Check } from "lucide-react"
import type { InvitacionPublica } from "@/types/invitation"

interface MapSectionProps {
  invitacion: InvitacionPublica
}

// Action buttons for a single location
function LocationActions({
  nombre,
  direccion,
  latitud,
  longitud,
}: {
  nombre: string
  direccion: string
  latitud: number
  longitud: number
}) {
  const [copiado, setCopiado] = useState(false)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`${nombre}, ${direccion}`)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // silent
    }
  }

  return (
    <div className="flex gap-2.5 flex-wrap">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 rounded-[30px] border-2 border-[var(--invitation-primary)] bg-[#fcf8f0] px-3 py-2.5 text-base text-[#333] transition-colors hover:bg-[#e3ded6] min-w-[8.5rem]"
        style={{ fontFamily: "Lato, sans-serif" }}
      >
        <MapPin className="h-4 w-4" style={{ color: "var(--invitation-primary)" }} />
        Abrir en Maps
      </a>
      <button
        onClick={copiar}
        className="flex flex-1 items-center justify-center gap-2 rounded-[34px] bg-[#fcf8f0] px-3 py-2.5 text-base text-[#555] transition-colors hover:bg-[#e3ded6] min-w-[8.5rem]"
        style={{ fontFamily: "Lato, sans-serif" }}
      >
        {copiado ? (
          <><Check className="h-4 w-4 text-green-600" />Copiado</>
        ) : (
          <><Copy className="h-4 w-4" />Copiar dirección</>
        )}
      </button>
    </div>
  )
}

// Single-location card with Google Maps iframe
function SingleMapCard({
  nombre,
  direccion,
  latitud,
  longitud,
}: {
  nombre: string
  direccion: string
  latitud: number
  longitud: number
}) {
  const embedUrl = `https://maps.google.com/maps?q=${latitud},${longitud}&t=&z=16&ie=UTF8&iwloc=&output=embed`

  return (
    <div>
      <p
        className="mb-1 text-base font-medium text-[#1a1a1a]"
        style={{ fontFamily: "Lato, sans-serif" }}
      >
        {nombre}
      </p>
      {direccion && (
        <p
          className="mb-3 text-base text-[#787878]"
          style={{ fontFamily: "Lato, sans-serif" }}
        >
          {direccion}
        </p>
      )}
      <div className="mb-3 h-[12rem] w-full overflow-hidden rounded-xl bg-[#f0ece4] border border-[#e0d8cc]">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title={`Ubicación de ${nombre}`}
        />
      </div>
      <LocationActions nombre={nombre} direccion={direccion} latitud={latitud} longitud={longitud} />
    </div>
  )
}

export function MapSection({ invitacion }: MapSectionProps) {
  const { ubicacion, direccion, latitud, longitud } = invitacion

  if (ubicacion === "multiple") return null

  return (
    <section className="relative flex flex-col items-start px-7 pt-6 pb-12 gap-6 overflow-hidden">
      <img
        src="/boda-clasica/locations-bg.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-10 pointer-events-none"
      />
      <p
        className="relative self-stretch text-center text-base text-[#787878]"
        style={{ fontFamily: "Lato, sans-serif" }}
      >
        Ubicación
      </p>
      <div className="relative w-full">
        <SingleMapCard
          nombre={ubicacion}
          direccion={direccion}
          latitud={latitud}
          longitud={longitud}
        />
      </div>
    </section>
  )
}
