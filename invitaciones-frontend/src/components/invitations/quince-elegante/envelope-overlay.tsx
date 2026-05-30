import { useState, useEffect } from "react"
import { Music, Heart } from "lucide-react"

interface EnvelopeOverlayEleganteProps {
  nombre: string
  tituloEvento: string
  onOpen: () => void
  tieneMusica: boolean
  colorAccent?: string
}

export function EnvelopeOverlayElegante({
  nombre,
  tituloEvento,
  onOpen,
  tieneMusica,
  colorAccent = "#2A63A8",
}: EnvelopeOverlayEleganteProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [btnHover, setBtnHover] = useState(false)

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
    setTimeout(() => onOpen(), 380)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isOpening ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ backgroundColor: "#e8f0fb" }}
    >
      <style>{`
        @keyframes elegante-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .elegante-card-enter {
          animation: elegante-fadein 0.5s ease forwards;
        }
      `}</style>

      {/* Loading spinner */}
      {!isLoaded && (
        <div className="flex items-center justify-center">
          <div
            className="h-12 w-12 rounded-full border-4 animate-spin"
            style={{
              borderColor: `${colorAccent}33`,
              borderTopColor: colorAccent,
            }}
          />
        </div>
      )}

      {isLoaded && (
        <div className="elegante-card-enter relative w-full max-w-[380px] mx-5">

          {/* Card */}
          <div className="relative rounded-2xl bg-white shadow-2xl overflow-hidden text-center">

            {/* ── Envelope flap (triangle pointing down) ── */}
            <div
              className="w-full h-[90px]"
              style={{
                backgroundColor: "#c8d9ef",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />

            {/* Heart at the flap tip */}
            <div
              className="absolute z-10"
              style={{ top: "79px", left: "50%", transform: "translateX(-50%)" }}
            >
              <Heart fill={colorAccent} color={colorAccent} size={22} />
            </div>

            {/* ── Text content ── */}
            <div className="px-8 pb-8 pt-6 flex flex-col items-center gap-0">
              <p
                className="text-[11px] text-[#aaa] tracking-widest uppercase"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Recibiste una invitación
              </p>

              <p
                className="text-[1.1rem] font-light leading-tight mt-6"
                style={{ fontFamily: "'Lora', Georgia, serif", color: "#243a6e" }}
              >
                {tituloEvento}
              </p>

              <h1
                className="text-[2.6rem] leading-tight font-bold mt-1"
                style={{ fontFamily: "'Lora', Georgia, serif", color: colorAccent }}
              >
                {nombre}
              </h1>

              <button
                onClick={handleOpen}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                className="mt-8 w-full py-3 font-bold text-base tracking-wide"
                style={{
                  fontFamily: "'Nunito Sans', sans-serif",
                  border: `2.5px solid ${colorAccent}`,
                  color: btnHover ? "white" : colorAccent,
                  backgroundColor: btnHover ? colorAccent : "white",
                  borderRadius: "0px",
                  transition: "background-color 0.25s ease, color 0.25s ease",
                }}
              >
                Abrir invitación
              </button>

              {tieneMusica && (
                <p
                  className="flex items-center gap-1.5 text-xs text-[#999] mt-3"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  <Music className="h-3 w-3" />
                  Se reproducirá música al abrir
                </p>
              )}
            </div>
          </div>

          {/* Floral overlay — encima del contenido, desborda los bordes laterales */}
          <img
            src="/quince-elegante/Overlay-floral.svg"
            alt=""
            aria-hidden="true"
            className="absolute pointer-events-none select-none"
            style={{
              top: "140px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "360px",
              maxWidth: "360px",
              zIndex: 30,
            }}
            loading="eager"
          />
        </div>
      )}
    </div>
  )
}
