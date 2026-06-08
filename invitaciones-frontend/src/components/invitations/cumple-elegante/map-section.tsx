import { useState } from "react"
import { MapPin, Copy, Check } from "lucide-react"
import type { InvitacionPublica } from "@/types/invitation"

interface MapSectionProps {
  invitacion: InvitacionPublica
  accentColor: string
}

function LocationActions({
  nombre,
  direccion,
  latitud,
  longitud,
  accentColor,
}: {
  nombre: string
  direccion: string
  latitud: number
  longitud: number
  accentColor: string
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
        className="flex flex-1 items-center justify-center gap-2 rounded-[30px] px-3 py-2.5 text-base text-white transition-opacity hover:opacity-85 min-w-[8.5rem]"
        style={{
          fontFamily: "'Raleway', sans-serif",
          backgroundColor: accentColor,
        }}
      >
        <MapPin className="h-4 w-4" />
        Abrir en Maps
      </a>
      <button
        onClick={copiar}
        className="flex flex-1 items-center justify-center gap-2 rounded-[30px] bg-[#ebebeb] px-3 py-2.5 text-base text-[#555] transition-colors hover:bg-[#dcdcdc] min-w-[8.5rem]"
        style={{ fontFamily: "'Raleway', sans-serif" }}
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

export function MapSection({ invitacion, accentColor }: MapSectionProps) {
  const { ubicacion, direccion, latitud, longitud } = invitacion

  if (ubicacion === "multiple") return null

  const embedUrl = `https://maps.google.com/maps?q=${latitud},${longitud}&t=&z=16&ie=UTF8&iwloc=&output=embed`

  return (
    <section className="flex flex-col items-start px-7 pt-6 pb-12 gap-6">
      <p
        className="self-stretch text-center text-base text-[#787878]"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        Ubicación
      </p>

      <div className="w-full">
        <p
          className="mb-1 text-base font-medium text-[#1a1a1a]"
          style={{ fontFamily: "'Raleway', sans-serif" }}
        >
          {ubicacion}
        </p>
        {direccion && (
          <p
            className="mb-3 text-base text-[#787878]"
            style={{ fontFamily: "'Raleway', sans-serif" }}
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
            title={`Ubicación de ${ubicacion}`}
          />
        </div>
        <LocationActions
          nombre={ubicacion}
          direccion={direccion}
          latitud={latitud}
          longitud={longitud}
          accentColor={accentColor}
        />
      </div>
    </section>
  )
}
