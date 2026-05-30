import { useState, useEffect } from "react"
import { Music } from "lucide-react"

interface EnvelopeOverlayClasicaProps {
  titulo: string
  onOpen: () => void
  tieneMusica: boolean
  colorAccent?: string
}

export function EnvelopeOverlayClasica({
  titulo,
  onOpen,
  tieneMusica,
  colorAccent = "#BD9848",
}: EnvelopeOverlayClasicaProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    document.fonts.ready.then(() => {
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
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <style>{`
        @keyframes envelope-clasica-fadein {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        .envelope-clasica-enter {
          animation: envelope-clasica-fadein 0.45s ease forwards;
        }
      `}</style>

      {/* Loading spinner */}
      {!isLoaded && (
        <div className="relative z-10 flex items-center justify-center">
          <div
            className="h-12 w-12 rounded-full border-4 animate-spin"
            style={{
              borderColor: "rgba(189,152,72,0.2)",
              borderTopColor: colorAccent,
            }}
          />
        </div>
      )}

      {/* Card */}
      {isLoaded && (
        <div
          className="envelope-clasica-enter relative z-10 w-[300px] overflow-hidden rounded-2xl text-center shadow-xl"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* Triangle flap (solapa del sobre) */}
          <div className="relative">
            <div
              className="h-[85px] w-full"
              style={{
                backgroundColor: "#e8dcc8",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />
            {/* Heart at flap tip */}
            <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
              <svg viewBox="0 0 24 24" fill={colorAccent} className="h-8 w-8">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="relative px-7 pb-9 pt-8">
            {/* Subtitle */}
            <p
              className="mb-3 text-sm tracking-wide text-[#999]"
              style={{ fontFamily: "Lato, sans-serif" }}
            >
              Recibiste una invitación
            </p>

            {/* Gold ornamental divider */}
            <div
              className="mx-auto mb-5 h-px w-12"
              style={{ backgroundColor: colorAccent, opacity: 0.45 }}
            />

            {/* Title / Names */}
            {parts ? (
              <div className="mb-7 flex flex-col items-center leading-tight">
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "2.2rem",
                    fontStyle: "italic",
                    fontWeight: 500,
                    color: colorAccent,
                    lineHeight: 1.15,
                    marginBottom: "-0.15rem",
                  }}
                >
                  {parts[0].trim()}
                </span>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "2.2rem",
                    fontStyle: "italic",
                    fontWeight: 500,
                    color: "#BD9848",
                    lineHeight: 1.15,
                    marginBottom: "-0.15rem",
                  }}
                >
                  &amp;
                </span>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "2.2rem",
                    fontStyle: "italic",
                    fontWeight: 500,
                    color: colorAccent,
                    lineHeight: 1.15,
                  }}
                >
                  {parts[1].trim()}
                </span>
              </div>
            ) : (
              <p
                className="mb-7 leading-tight"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "2.2rem",
                  fontStyle: "italic",
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
                fontFamily: "Lato, sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              Abrir invitación
            </button>

            {/* Music note */}
            {tieneMusica && (
              <p
                className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#999]"
                style={{ fontFamily: "Lato, sans-serif" }}
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
