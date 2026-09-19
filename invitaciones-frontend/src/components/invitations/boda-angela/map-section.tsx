import { useState } from "react"
import type { InvitacionPublica } from "@/types/invitation"
import { COLOR, TYPO } from "./theme"

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
    <section className="flex flex-col items-start gap-6 px-7 pt-16 pb-24 w-full">
      <p
        className="w-full text-center"
        style={{ ...TYPO.h4, color: COLOR.brown }}
      >
        Ubicación
      </p>

      <div className="h-[17.5rem] w-full overflow-hidden rounded-sm bg-[#e4e4e4]">
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

      <div className="flex w-full gap-2.5">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-[4px] py-4 text-center transition-opacity hover:opacity-85"
          style={{ ...TYPO.text, backgroundColor: COLOR.crema, color: COLOR.negro }}
        >
          Abrir en Maps
        </a>
        <button
          onClick={copiar}
          className="flex-1 rounded-[4px] border py-4 text-center transition-colors hover:opacity-85"
          style={{ ...TYPO.text, borderColor: COLOR.crema, color: COLOR.brown }}
        >
          {copiado ? "Copiado" : "Copiar dirección"}
        </button>
      </div>
    </section>
  )
}
