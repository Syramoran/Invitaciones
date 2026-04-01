import { useState } from "react"
import { MapPin, Copy, Check } from "lucide-react"

interface MapSectionProps {
  ubicacion: string
  direccion: string
  latitud: number
  longitud: number
}

export function MapSection({ ubicacion, direccion, latitud, longitud }: MapSectionProps) {
  const [copiado, setCopiado] = useState(false)

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${longitud}!3d${latitud}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sar!4v1234567890`

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
    <section className="border-b border-[#e0e0e0] px-7 py-12">
      <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#777777]">
        Ubicación
      </p>

      {/* Mapa embebido */}
      <div className="mb-4 h-[200px] w-full overflow-hidden rounded-xl border border-[#e0e0e0]">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Ubicación de ${ubicacion}`}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-2.5">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--invitation-primary)] px-3 py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          <MapPin className="h-4 w-4" />
          Abrir en Maps
        </a>

        <button
          onClick={copiarDireccion}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] bg-transparent px-3 py-3 text-xs font-semibold text-[var(--invitation-primary)] transition-colors hover:bg-[#f5f5f5]"
        >
          {copiado ? (
            <>
              <Check className="h-4 w-4" />
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
    </section>
  )
}
