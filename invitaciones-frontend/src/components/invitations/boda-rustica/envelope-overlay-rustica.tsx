import { useState, useEffect } from "react"
import { Music } from "lucide-react"

interface EnvelopeOverlayRusticaProps {
  titulo: string
  onOpen: () => void
  tieneMusica: boolean
  colorAccent?: string
}

const LEAVES_1 = "/boda-rustica/leaves-stains.png"
const LEAVES_2 = "/boda-rustica/leaves-stains-2.png"

export function EnvelopeOverlayRustica({
  titulo,
  onOpen,
  tieneMusica,
  colorAccent = "#465E38",
}: EnvelopeOverlayRusticaProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    const preloadLeaves = new Promise<void>((resolve) => {
      const img = new Image()
      img.src = LEAVES_1
      img.onload = img.onerror = () => resolve()
    })

    Promise.all([document.fonts.ready, preloadLeaves]).then(() => {
      if (!cancelled) setIsLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const handleOpen = () => {
    setIsOpening(true)
    setTimeout(() => onOpen(), 350)
  }

  const parts = titulo.includes("&") ? titulo.split("&") : null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isOpening ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "#f0ece6" }}
    >
      <style>{`
        @keyframes envelope-rustica-fadein {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        .envelope-rustica-enter {
          animation: envelope-rustica-fadein 0.45s ease forwards;
        }
      `}</style>

      {/* Leaves decorativas en las esquinas del fondo (en vez de textura) */}
      <img
        src={LEAVES_1}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          bottom: 0,
          left: 0,
          width: "260px",
          opacity: 0.45,
        }}
      />
      <img
        src={LEAVES_2}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: 0,
          right: 0,
          width: "240px",
          opacity: 0.4,
          transform: "rotate(180deg)",
        }}
      />

      {/* Loading spinner */}
      {!isLoaded && (
        <div className="relative z-10 flex items-center justify-center">
          <div
            className="h-12 w-12 rounded-full border-4 animate-spin"
            style={{
              borderColor: "rgba(70,94,56,0.2)",
              borderTopColor: colorAccent,
            }}
          />
        </div>
      )}

      {/* Card */}
      {isLoaded && (
        <div
          className="envelope-rustica-enter relative z-10 w-[300px] overflow-hidden rounded-2xl text-center shadow-xl"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* Leaves decorativas dentro de la card — esquina inferior izquierda */}
          <img
            src={LEAVES_1}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              bottom: -10,
              left: -20,
              width: "160px",
              opacity: 0.6,
              zIndex: 0,
            }}
          />

          {/* Triángulo (solapa del sobre) en gris cálido */}
          <div className="relative">
            <div
              className="h-[85px] w-full"
              style={{
                backgroundColor: "#d4cfc9",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />
            {/* Corazón dorado superpuesto en la punta del triángulo */}
            <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
              <svg viewBox="0 0 24 24" fill="#c8a96e" className="h-8 w-8">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>

          {/* Contenido */}
          <div className="relative z-10 px-7 pb-9 pt-8">
            {/* Subtítulo */}
            <p
              className="mb-2 text-sm tracking-wide text-[#888]"
              style={{ fontFamily: "Quicksand, sans-serif" }}
            >
              Recibiste una invitación
            </p>

            {/* Nombres */}
            {parts ? (
              <p className="mb-7 leading-tight">
                <span
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "2.4rem",
                    color: "#333",
                    lineHeight: 1.1,
                    display: "inline",
                  }}
                >
                  {parts[0].trim()} &amp; {parts[1].trim()}
                </span>
              </p>
            ) : (
              <p
                className="mb-7 leading-tight"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "2.35rem",
                  color: "#333",
                }}
              >
                {titulo}
              </p>
            )}

            {/* Botón */}
            <button
              onClick={handleOpen}
              className="inline-block w-full cursor-pointer rounded-full py-3.5 text-sm font-semibold tracking-widest text-white transition-opacity hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: colorAccent,
                fontFamily: "Quicksand, sans-serif",
              }}
            >
              Abrir invitación
            </button>

            {/* Nota musical */}
            {tieneMusica && (
              <p
                className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#888]"
                style={{ fontFamily: "Quicksand, sans-serif" }}
              >
                <Music className="h-3 w-3" />
                Se reproducirá música al abrir
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
