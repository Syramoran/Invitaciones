import { useState, useEffect } from "react"
import { Music } from "lucide-react"

interface EnvelopeOverlayProps {
  nombre: string
  tituloEvento: string
  edad?: string | number
  onOpen: () => void
  tieneMusica: boolean
  colorAccent: string
}

export function EnvelopeOverlay({
  nombre,
  edad,
  onOpen,
  tieneMusica,
  colorAccent,
}: EnvelopeOverlayProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    let cancelled = false
    document.fonts.ready.then(() => { if (!cancelled) setIsLoaded(true) })
    return () => { cancelled = true }
  }, [])

  const handleOpen = () => {
    setIsOpening(true)
    setTimeout(() => onOpen(), 380)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isOpening ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ backgroundColor: "#111111" }}
    >
      <style>{`
        @keyframes cf-card-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cf-card-enter { animation: cf-card-in 0.5s ease forwards; }
      `}</style>

      {/* Spinner */}
      {!isLoaded && (
        <div className="flex items-center justify-center">
          <div
            className="h-11 w-11 rounded-full border-4 animate-spin"
            style={{
              borderColor: `${colorAccent}33`,
              borderTopColor: colorAccent,
            }}
          />
        </div>
      )}

      {isLoaded && (
        /* Wrapper exterior: relative, sin overflow-hidden → la estrella no se corta */
        <div className="cf-card-enter relative mx-5 w-full max-w-[320px]">

          {/* ── Card único con overflow-hidden + fondo ── */}
          <div
            className="relative overflow-hidden rounded-2xl shadow-2xl"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            {/* Solapa triangular — bloque normal dentro del card */}
            <div
              className="h-[85px] w-full"
              style={{
                backgroundColor: colorAccent,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />

            {/* Cuerpo del sobre */}
            <div
              className="flex flex-col items-center px-7 pb-9 pt-10 text-center"
              style={{
                backgroundImage: "url('/cumple-festivo/overlay.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <p
                className="mb-5 text-[10px] font-medium uppercase tracking-[0.22em] text-white/60"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Recibiste una invitación
              </p>

              {edad && (
                <p
                  className="mb-1 text-sm font-semibold text-white/80"
                  style={{ fontFamily: "'Rubik', sans-serif" }}
                >
                  Mis {edad}
                </p>
              )}

              <h2
                className="mb-7 text-[2.2rem] font-bold leading-tight text-white"
                style={{ fontFamily: "'Rubik', sans-serif" }}
              >
                {nombre}
              </h2>

              <button
                onClick={handleOpen}
                className="rounded-full px-10 py-3 text-sm font-semibold tracking-wide text-white transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorAccent, fontFamily: "'Rubik', sans-serif" }}
              >
                Abrir invitación
              </button>

              <p
                className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-white/40"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Music className="h-3 w-3" />
                {tieneMusica ? "Se reproducirá música al abrir" : "Toca para abrir tu invitación"}
              </p>
            </div>
          </div>

          {/* Estrella — en el wrapper exterior, fuera del overflow-hidden */}
          <div
            className="absolute z-10"
            style={{ top: "69px", left: "50%", transform: "translateX(-50%)" }}
          >
            <img
              src="/cumple-festivo/estrella1.svg"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 drop-shadow-md"
            />
          </div>

        </div>
      )}
    </div>
  )
}
