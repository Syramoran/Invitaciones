import { useState, useEffect } from "react"
import { Music } from "lucide-react"

const DARK_BG = "#1A1E4D"
const VERY_DARK_BG = "#0e1130"
const FONT_TITLE = "'Puppies Play', cursive"
const FONT_BODY = "'DM Sans', sans-serif"
const FONT_HEADING = "'Source Serif 4', Georgia, serif"

interface EnvelopeOverlayProps {
  nombre: string
  tituloEvento: string
  onOpen: () => void
  tieneMusica: boolean
  colorAccent?: string
}

export function EnvelopeOverlayModerna({
  nombre,
  tituloEvento,
  onOpen,
  tieneMusica,
}: EnvelopeOverlayProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

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
    setTimeout(() => onOpen(), 400)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isOpening ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ backgroundColor: VERY_DARK_BG }}
    >
      <style>{`
        @keyframes qm-card-in {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .qm-card-enter { animation: qm-card-in 0.5s ease forwards; }
      `}</style>

      {/* Spinner */}
      {!isLoaded && (
        <div className="flex items-center justify-center">
          <div
            className="h-11 w-11 rounded-full border-4 animate-spin"
            style={{
              borderColor: "var(--invitation-border, rgba(255,255,255,0.2))",
              borderTopColor: "var(--invitation-primary)",
            }}
          />
        </div>
      )}

      {/* Envelope Card */}
      {isLoaded && (
        <div className="qm-card-enter flex w-[340px] max-w-[90vw] flex-col items-center relative">
          
          {/* Main Envelope Body */}
          <div 
            className="relative w-full overflow-hidden rounded-sm px-6 pb-10 pt-[100px] text-center shadow-[0_0_40px_rgba(0,0,0,0.5)]"
            style={{ backgroundColor: "#131636" }}
          >
            {/* Flap */}
            <div
              className="absolute left-0 right-0 top-0 h-[100px]"
              style={{ 
                backgroundColor: DARK_BG,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
              }}
            />

            {/* Heart Icon at flap tip */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-[88px] z-10"
              style={{
                filter: `drop-shadow(0px 4px 8px var(--invitation-border))`
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--invitation-primary)" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            {/* Content */}
            <div className="mt-6 flex flex-col items-center relative z-20">
              <p 
                className="mb-8 text-[0.95rem] tracking-wide text-[#e0e0e0]" 
                style={{ fontFamily: FONT_BODY }}
              >
                Recibiste una invitación
              </p>

              <h2 
                className="text-[1.7rem] text-[#e0e0e0] mb-2 tracking-wide" 
                style={{ fontFamily: FONT_HEADING }}
              >
                {tituloEvento}
              </h2>

              <h1 
                className="mb-10 text-[3.8rem] leading-tight" 
                style={{ 
                  fontFamily: FONT_TITLE, 
                  color: "var(--invitation-primary)",
                  textShadow: `0 0 15px var(--invitation-border)`
                }}
              >
                {nombre}
              </h1>

              <button
                onClick={handleOpen}
                className="w-full py-4 text-[1.05rem] font-medium text-white transition-all hover:opacity-90 cursor-pointer mb-8 shadow-lg"
                style={{
                  fontFamily: FONT_BODY,
                  backgroundColor: "#181b3c",
                  border: "1px solid",
                  borderImage: `linear-gradient(to right, transparent, var(--invitation-primary), transparent) 1`,
                }}
              >
                Abrir invitación
              </button>

              {tieneMusica && (
                <p 
                  className="flex items-center justify-center gap-2 text-[0.85rem] text-[#b0b0b0]"
                  style={{ fontFamily: FONT_BODY }}
                >
                  <Music className="h-4 w-4" />
                  Se reproducirá música al abrir
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
