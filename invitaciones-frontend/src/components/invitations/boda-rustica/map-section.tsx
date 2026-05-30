import { useState } from "react"
import { Copy, Check } from "lucide-react"
import type { InvitacionPublica } from "@/types/invitation"

interface MapSectionProps {
  invitacion: InvitacionPublica
}

export function MapSection({ invitacion }: MapSectionProps) {
  const { ubicacion, direccion, latitud, longitud } = invitacion
  const [copiado, setCopiado] = useState(false)

  if (ubicacion === "multiple") return null

  const embedUrl = `https://maps.google.com/maps?q=${latitud},${longitud}&t=&z=16&ie=UTF8&iwloc=&output=embed`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`${ubicacion}, ${direccion}`)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // silent
    }
  }

  return (
    <section
      className="flex flex-col items-start px-7 py-12 gap-6"
      style={{ fontFamily: "Quicksand, sans-serif" }}
    >
      <p className="self-stretch text-center text-base font-semibold text-[#787878]">
        Ubicación
      </p>

      {/* Mapa embebido */}
      <div className="self-stretch h-[12rem] w-full overflow-hidden rounded-[1px] bg-[#d9d9d9]">
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

      {/* Botones */}
      <div className="self-stretch flex items-start justify-center flex-wrap gap-2.5">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center rounded-[1px] p-3 text-base text-white transition-colors hover:opacity-80 min-w-[7.375rem]"
          style={{ backgroundColor: "var(--invitation-primary)" }}
        >
          Abrir en Maps
        </a>
        <button
          onClick={copiar}
          className="flex flex-1 items-center justify-center gap-2 rounded-[1px] bg-[#eceeea] p-3 text-base text-[#555] transition-colors hover:bg-[#d4d4d1] min-w-[7.375rem]"
        >
          {copiado ? (
            <><Check className="h-4 w-4 text-green-600" />Copiado</>
          ) : (
            <><Copy className="h-4 w-4" />Copiar dirección</>
          )}
        </button>
      </div>
    </section>
  )
}
