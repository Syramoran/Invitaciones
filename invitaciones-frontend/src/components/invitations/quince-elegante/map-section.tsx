import { useState } from "react"
import { MapPin, Copy, Check } from "lucide-react"
import type { InvitacionPublica } from "@/types/invitation"

interface MapSectionProps {
  invitacion: InvitacionPublica
  colorAccent: string
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
        className="flex flex-1 items-center justify-center gap-2 border-2 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-85 min-w-[7.5rem]"
        style={{
          fontFamily: "'Nunito Sans', sans-serif",
          borderColor: "#414E81",
          backgroundColor: "#414E81",
        }}
      >
        <MapPin className="h-4 w-4" />
        Abrir en Maps
      </a>
      <button
        onClick={copiar}
        className="flex flex-1 items-center justify-center gap-2 border px-3 py-2.5 text-sm text-[#555] transition-colors hover:opacity-80 min-w-[7.5rem]"
        style={{
          fontFamily: "'Nunito Sans', sans-serif",
          borderColor: "#d1d5db",
          backgroundColor: "#f9f9f9",
        }}
      >
        {copiado ? (
          <>
            <Check className="h-4 w-4 text-green-600" />
            Copiado
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 text-[#888]" />
            Copiar dirección
          </>
        )}
      </button>
    </div>
  )
}

export function MapSection({ invitacion }: MapSectionProps) {
  const { ubicacion, direccion, latitud, longitud } = invitacion
  const embedUrl = `https://maps.google.com/maps?q=${latitud},${longitud}&t=&z=16&ie=UTF8&iwloc=&output=embed`

  return (
    <section className="flex flex-col items-start px-7 pt-2 pb-10 gap-4 bg-white">
      <p
        className="self-stretch text-center text-sm text-[#999] tracking-widest"
        style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      >
        Ubicación
      </p>

      <div className="w-full">
        <p className="mb-0.5 text-[15px] text-[#2a2a2a]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
          {ubicacion}
        </p>
        {direccion && (
          <p className="mb-3 text-sm text-[#888]" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            {direccion}
          </p>
        )}

        {/* Mapa */}
        <div
          className="mb-3 h-[12rem] w-full overflow-hidden border"
          style={{ borderColor: "#e5e7eb" }}
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
