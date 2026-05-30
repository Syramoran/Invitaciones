import { useState, useEffect } from "react"
import { Music } from "lucide-react"


interface EnvelopeOverlayPrincesaProps {
  titulo: string
  tituloEvento: string
  onOpen: () => void
  tieneMusica: boolean
  colorAsset?: string
  colorAccent?: string
}

export function EnvelopeOverlayPrincesa({
  titulo,
  tituloEvento,
  onOpen,
  tieneMusica,
  colorAccent = "#B14B8F",
}: EnvelopeOverlayPrincesaProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) setIsLoaded(true)
    })
    return () => { cancelled = true }
  }, [])

  const handleOpen = () => {
    setIsOpening(true)
    setTimeout(() => onOpen(), 350)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isOpening ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#fdf6fa",
        backgroundImage: `radial-gradient(${colorAccent}1a 1.5px, transparent 1.5px), radial-gradient(${colorAccent}0d 1px, transparent 1px)`,
        backgroundSize: "28px 28px, 14px 14px",
        backgroundPosition: "0 0, 7px 7px",
      }}
    >
      <style>{`
        @keyframes princesa-fadein {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        .princesa-card-enter {
          animation: princesa-fadein 0.45s ease forwards;
        }
      `}</style>

      {/* Loading spinner */}
      {!isLoaded && (
        <div className="relative z-10 flex items-center justify-center">
          <div
            className="h-12 w-12 rounded-full border-4 animate-spin"
            style={{
              borderColor: "rgba(177,75,143,0.2)",
              borderTopColor: colorAccent,
            }}
          />
        </div>
      )}

      {/* Card */}
      {isLoaded && (
        <div
          className="princesa-card-enter relative z-10 w-full max-w-[300px] mx-4 overflow-hidden rounded-2xl text-center shadow-xl"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* Triángulo (solapa del sobre) — color primario con poca opacidad */}
          <div className="relative">
            <div
              className="h-[85px] w-full"
              style={{
                backgroundColor: `${colorAccent}33`,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />
            {/* Corazón en la punta del triángulo */}
            <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
              <svg viewBox="0 0 24 24" fill={colorAccent} className="h-8 w-8">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>

          {/* Contenido */}
          <div className="relative px-7 pb-9 pt-8">
            {/* Subtítulo */}
            <p
              className="mb-2 text-sm tracking-wide text-[#999]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Recibiste una invitación
            </p>

            {/* Título del evento */}
            <p
              className="mb-1 text-[1.5rem]"
              style={{ color: "#555", fontFamily: "Poppins, sans-serif", fontWeight: 300 }}
            >
              {tituloEvento}
            </p>

            {/* Nombre con destellos laterales */}
            <div className="relative mb-7">
              {/* Brillos izquierda */}
              <span className="pointer-events-none absolute" style={{ left: 0, top: "50%", transform: "translateY(-65%)" }}>
                <svg viewBox="0 0 20 20" width="20" height="20" fill={colorAccent} style={{ opacity: 0.85 }} aria-hidden="true">
                  <path d="M10 0 L11.8 8.2 L20 10 L11.8 11.8 L10 20 L8.2 11.8 L0 10 L8.2 8.2 Z" />
                </svg>
              </span>
              <span className="pointer-events-none absolute" style={{ left: "14px", top: "18%", transform: "translateY(-50%)" }}>
                <svg viewBox="0 0 12 12" width="12" height="12" fill={colorAccent} style={{ opacity: 0.55 }} aria-hidden="true">
                  <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
                </svg>
              </span>
              {/* Brillos derecha */}
              <span className="pointer-events-none absolute" style={{ right: 0, top: "50%", transform: "translateY(-65%)" }}>
                <svg viewBox="0 0 20 20" width="20" height="20" fill={colorAccent} style={{ opacity: 0.85 }} aria-hidden="true">
                  <path d="M10 0 L11.8 8.2 L20 10 L11.8 11.8 L10 20 L8.2 11.8 L0 10 L8.2 8.2 Z" />
                </svg>
              </span>
              <span className="pointer-events-none absolute" style={{ right: "14px", top: "18%", transform: "translateY(-50%)" }}>
                <svg viewBox="0 0 12 12" width="12" height="12" fill={colorAccent} style={{ opacity: 0.55 }} aria-hidden="true">
                  <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
                </svg>
              </span>
              <p
                className="leading-none text-center"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "3.5rem",
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: colorAccent,
                }}
              >
                {titulo}
              </p>
            </div>

            {/* Botón */}
            <button
              onClick={handleOpen}
              className="inline-block w-full cursor-pointer rounded-full py-3.5 text-sm tracking-widest text-white transition-opacity hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: colorAccent,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Abrir invitación
            </button>

            {/* Nota musical */}
            {tieneMusica && (
              <p
                className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#999]"
                style={{ fontFamily: "Poppins, sans-serif" }}
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
