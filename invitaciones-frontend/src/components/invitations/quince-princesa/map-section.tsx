import { useState } from "react"
import { MapPin, Copy, Check } from "lucide-react"
import type { InvitacionPublica } from "@/types/invitation"

interface MapSectionProps {
  invitacion: InvitacionPublica
}

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
        className="flex flex-1 items-center justify-center gap-2 rounded-[30px] border-2 px-3 py-2.5 text-base font-light text-[#333] transition-colors hover:opacity-80 min-w-[8.5rem]"
        style={{
          fontFamily: "Poppins, sans-serif",
          borderColor: "var(--invitation-primary)",
          backgroundColor: "var(--invitation-bg-soft)",
        }}
      >
        <MapPin className="h-4 w-4" style={{ color: "var(--invitation-primary)" }} />
        Abrir en Maps
      </a>
      <button
        onClick={copiar}
        className="flex flex-1 items-center justify-center gap-2 rounded-[34px] px-3 py-2.5 text-base font-light text-[#555] transition-colors hover:opacity-80 min-w-[8.5rem]"
        style={{
          fontFamily: "Poppins, sans-serif",
          backgroundColor: "var(--invitation-bg-soft)",
        }}
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

export function MapSection({ invitacion }: MapSectionProps) {
  const { ubicacion, direccion, latitud, longitud } = invitacion

  const embedUrl = `https://maps.google.com/maps?q=${latitud},${longitud}&t=&z=16&ie=UTF8&iwloc=&output=embed`

  return (
    <section className="flex flex-col items-start px-7 pt-4 pb-12 gap-4">
      <p
        className="self-stretch text-center text-base font-light text-[#787878]"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Ubicación
      </p>

      <div className="w-full">
        {/* Etiqueta de lugar */}
        <p
          className="mb-1 text-base font-light text-[#1a1a1a]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {ubicacion}
        </p>
        {direccion && (
          <p
            className="mb-3 text-base font-light text-[#787878]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {direccion}
          </p>
        )}

        {/* Mapa */}
        <div
          className="mb-3 h-[12rem] w-full overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--invitation-border)" }}
        >
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title={`Ubicación: ${ubicacion}`}
          />
        </div>

        <LocationActions
          nombre={ubicacion}
          direccion={direccion}
          latitud={latitud}
          longitud={longitud}
        />
      </div>
    </section>
  )
}
