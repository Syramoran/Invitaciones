import { useState, useEffect } from "react"
import { Music } from "lucide-react"

interface EnvelopeOverlayModernaProps {
  titulo: string
  onOpen: () => void
  tieneMusica: boolean
  colorAccent?: string
}

const BG_IMAGE = "/boda-moderna/Fondo1-B3(3) 1.png"

export function EnvelopeOverlayModerna({
  titulo,
  onOpen,
  tieneMusica,
  colorAccent = "#4E1319",
}: EnvelopeOverlayModernaProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    const imgPromise = new Promise<void>((resolve) => {
      const img = new Image()
      img.src = BG_IMAGE
      img.onload = () => resolve()
      img.onerror = () => resolve()
    })

    Promise.all([document.fonts.ready, imgPromise]).then(() => {
      if (!cancelled) setIsLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const handleOpen = () => {
    setIsOpening(true)
    setTimeout(() => {
      onOpen()
    }, 350)
  }

  // Split title by "&" to style each part separately
  const parts = titulo.includes("&") ? titulo.split("&") : null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isOpening ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundImage: `url('${BG_IMAGE}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <style>{`
        @keyframes envelope-fadein {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        .envelope-card-enter {
          animation: envelope-fadein 0.45s ease forwards;
        }
      `}</style>

      {/* Dark overlay on top of texture for legibility */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Loading spinner */}
      {!isLoaded && (
        <div className="relative z-10 flex items-center justify-center">
          <div
            className="h-12 w-12 rounded-full border-4 animate-spin"
            style={{
              borderColor: "rgba(255,255,255,0.25)",
              borderTopColor: colorAccent,
            }}
          />
        </div>
      )}

      {/* Card — todo en un solo contenedor */}
      {isLoaded && (
        <div
          className="envelope-card-enter relative z-10 w-[300px] overflow-hidden rounded-2xl text-center shadow-xl"
          style={{
            backgroundColor: "#ffffff",
          }}
        >
          {/* Capa de textura al 70% de opacidad */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url('${BG_IMAGE}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.7,
            }}
          />

          {/* Triángulo blanco (solapa del sobre) */}
          <div className="relative">
            <div
              className="h-[85px] w-full bg-white"
              style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
            />
            {/* Corazón superpuesto en la punta del triángulo */}
            <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
              <svg
                viewBox="0 0 24 24"
                fill={colorAccent}
                className="h-8 w-8"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>

          {/* Contenido */}
          <div className="relative px-7 pb-9 pt-8">
            {/* Subtitle */}
            <p
              className="mb-2 text-sm tracking-wide text-[#888]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Recibiste una invitación
            </p>

            {/* Title / Names */}
            {parts ? (
              <p className="mb-7 leading-tight">
                <span
                  style={{
                    fontFamily: "'Pinyon Script', cursive",
                    fontSize: "2.35rem",
                    color: colorAccent,
                    lineHeight: 1.1,
                  }}
                >
                  {parts[0].trim()}
                </span>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.4rem",
                    color: "#555",
                    margin: "0 4px",
                  }}
                >
                  &amp;
                </span>
                <span
                  style={{
                    fontFamily: "'Pinyon Script', cursive",
                    fontSize: "2.35rem",
                    color: colorAccent,
                    lineHeight: 1.1,
                  }}
                >
                  {parts[1].trim()}
                </span>
              </p>
            ) : (
              <p
                className="mb-7 text-3xl leading-tight"
                style={{
                  fontFamily: "'Pinyon Script', cursive",
                  color: colorAccent,
                }}
              >
                {titulo}
              </p>
            )}

            {/* Button */}
            <button
              onClick={handleOpen}
              className="inline-block w-full cursor-pointer rounded-full py-3.5 text-sm tracking-widest text-white transition-opacity hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: colorAccent,
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Abrir invitación
            </button>

            {/* Music note */}
            {tieneMusica && (
              <p
                className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#888]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
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
