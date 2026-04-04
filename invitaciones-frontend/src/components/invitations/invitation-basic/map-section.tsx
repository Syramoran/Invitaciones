import { useState } from "react"
import { MapPin, Copy, Check } from "lucide-react"
import type { UbicacionEventoPublica } from "@/types/invitation"

interface MapSectionProps {
  ubicacion: string
  direccion: string
  latitud: number
  longitud: number
  camposEspecificos?: Record<string, unknown> | null
}

function SingleMapCard({
  ubicacion,
  direccion,
  latitud,
  longitud,
  label,
}: {
  ubicacion: string
  direccion: string
  latitud: number
  longitud: number
  label?: string
}) {
  const [copiado, setCopiado] = useState(false)

  // URL corregida para abrir en la app/web de Google Maps
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`
  
  // URL de Google Maps para el iframe (mantiene consistencia con lo que ves en Maps)
  const embedUrl = `https://maps.google.com/maps?q=${latitud},${longitud}&t=&z=16&ie=UTF8&iwloc=&output=embed`

  const copiarDireccion = async () => {
    try {
      await navigator.clipboard.writeText(`${ubicacion}, ${direccion}`)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (error) {
      console.error("Error al copiar:", error)
    }
  }

  return (
    <div>
      {label && (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--invitation-primary)]">
          {label}
        </p>
      )}
      <p className="mb-1 text-[13px] font-medium text-[#1a1a1a]">{ubicacion}</p>
      {direccion && <p className="mb-3 text-[11px] text-[#777777]">{direccion}</p>}

      <div className="mb-3 h-[180px] w-full overflow-hidden rounded-xl border border-[#e0e0e0]">
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

      <div className="flex gap-2.5">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--invitation-primary)] px-3 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          <MapPin className="h-4 w-4" />
          Abrir en Maps
        </a>
        <button
          onClick={copiarDireccion}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] bg-transparent px-3 py-2.5 text-xs font-semibold text-[var(--invitation-primary)] transition-colors hover:bg-[#f5f5f5]"
        >
          {copiado ? (
            <><Check className="h-4 w-4" />Copiado</>
          ) : (
            <><Copy className="h-4 w-4" />Copiar dirección</>
          )}
        </button>
      </div>
    </div>
  )
}

export function MapSection({ ubicacion, direccion, latitud, longitud, camposEspecificos }: MapSectionProps) {
  const esMultiple = ubicacion === "multiple"
  const ubicaciones = esMultiple
    ? (camposEspecificos?.ubicaciones as UbicacionEventoPublica[] | undefined) ?? []
    : null

  return (
    <section className="border-b border-[#e0e0e0] px-7 py-12">
      <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#777777]">
        Ubicación
      </p>

      {esMultiple && ubicaciones ? (
        <div className="flex flex-col gap-8">
          {ubicaciones.map((ub) => (
            <SingleMapCard
              key={ub.tipo}
              ubicacion={ub.nombre}
              direccion={ub.direccion}
              latitud={ub.latitud}
              longitud={ub.longitud}
              label={ub.tipo}
            />
          ))}
        </div>
      ) : (
        <SingleMapCard
          ubicacion={ubicacion}
          direccion={direccion}
          latitud={latitud}
          longitud={longitud}
        />
      )}
    </section>
  )
}
