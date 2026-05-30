import { useState, useEffect } from "react"
import { Music } from "lucide-react"
import { CornerTopLeft, CornerBottomRight } from "./quince-moderna-svgs"

const DARK_BG = "#1A1E4D"
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
  colorAccent = "#BD9848",
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
      style={{ backgroundColor: "#0e1130" }}
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
              borderColor: "rgba(189,152,72,0.2)",
              borderTopColor: colorAccent,
            }}
          />
        </div>
      )}

      {/* Card */}
      {isLoaded && (
        <div
          className="qm-card-enter relative mx-4 w-full max-w-[300px] overflow-hidden rounded-2xl shadow-2xl text-center"
          style={{ backgroundColor: "#fff" }}
        >
          {/* Dark top band */}
          <div
            className="relative flex flex-col items-center justify-center gap-2 px-6 pb-8 pt-8 overflow-hidden"
            style={{ backgroundColor: DARK_BG }}
          >
            {/* Corner lines */}
            <CornerTopLeft
              className="absolute top-0 left-0"
              style={{ color: colorAccent, opacity: 0.6 }}
            />
            <CornerBottomRight
              className="absolute bottom-0 right-0"
              style={{ color: colorAccent, opacity: 0.6 }}
            />

            {/* XV */}
            <p
              className="relative z-10 text-[3.5rem] leading-none"
              style={{
                fontFamily: FONT_HEADING,
                fontStyle: "italic",
                color: colorAccent,
              }}
            >
              XV
            </p>

            {/* Name */}
            <h1
              className="relative z-10 leading-tight text-white"
              style={{ fontFamily: FONT_TITLE, fontSize: "2.6rem" }}
            >
              {nombre}
            </h1>
          </div>

          {/* White bottom */}
          <div className="flex flex-col items-center gap-5 px-6 py-7">
            <p
              className="text-sm text-[#aaa]"
              style={{ fontFamily: FONT_BODY }}
            >
              Recibiste una invitación a
            </p>

            <p
              className="text-[1.15rem] leading-snug text-[#333]"
              style={{ fontFamily: FONT_HEADING, fontStyle: "italic" }}
            >
              {tituloEvento}
            </p>

            {tieneMusica && (
              <p
                className="flex items-center gap-1.5 text-xs"
                style={{ fontFamily: FONT_BODY, color: colorAccent }}
              >
                <Music className="h-3.5 w-3.5" />
                Esta invitación tiene música
              </p>
            )}

            <button
              onClick={handleOpen}
              className="w-full py-3 text-base font-medium text-white transition-opacity hover:opacity-85 cursor-pointer"
              style={{
                fontFamily: FONT_BODY,
                backgroundColor: "#181C47",
                letterSpacing: "0.04em",
                border: "1px solid",
                borderImage: `linear-gradient(to right, ${colorAccent}, transparent) 1`,
              }}
            >
              Abrir invitación
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
