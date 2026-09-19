import { useState, useEffect, useRef } from "react"
import type { InvitacionPublica } from "@/types/invitation"
import { COLOR, TYPO } from "./theme"

interface EnvelopeOverlayAngelaProps {
  invitacion: InvitacionPublica
  onOpen: () => void
  /** Se dispara apenas arranca la apertura, para que el hero empiece a
   * aparecer en simultáneo con las piezas del sobre alejándose. */
  onRevealStart: () => void
}

/** Tiempo hasta avisarle al padre que ya puede desmontar el overlay (sobre ya invisible). */
const ANIM_MS = 1200
const AUTO_OPEN_MS = 20000

interface TitularInfo {
  nombre: string
  cantidad: string | null
}

/** Titular de la tarjeta (grupo tiene prioridad, igual que en RsvpSection) + cantidad de invitados que le corresponde. */
function getTitularInfo(invitacion: InvitacionPublica): TitularInfo | null {
  if (invitacion.grupo) {
    const cantidad = invitacion.grupo.maxIntegrantesEfectivo ?? invitacion.grupo.integrantes.length
    return {
      nombre: invitacion.grupo.nombre,
      cantidad: cantidad > 0 ? `${cantidad} invitado${cantidad === 1 ? "" : "s"}` : null,
    }
  }
  if (invitacion.invitadoNombre || invitacion.invitadoApellido) {
    return {
      nombre: [invitacion.invitadoNombre, invitacion.invitadoApellido].filter(Boolean).join(" "),
      cantidad: invitacion.puedeAgregarPlusOne ? "2 personas" : null,
    }
  }
  return null
}

export function EnvelopeOverlayAngela({ invitacion, onOpen, onRevealStart }: EnvelopeOverlayAngelaProps) {
  const titular = getTitularInfo(invitacion)
  const [isOpening, setIsOpening] = useState(false)
  const hasTriggeredRef = useRef(false)

  // Bloquea el scroll de fondo mientras el sobre está en pantalla, para que las
  // secciones con reveal-on-scroll no se disparen antes de que se vea la invitación.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const handleOpenClick = () => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true
    setIsOpening(true)
    onRevealStart()
    setTimeout(() => onOpen(), ANIM_MS)
  }

  // Si nadie tocó el sobre, se abre solo a los 10s.
  useEffect(() => {
    const t = setTimeout(() => {
      if (hasTriggeredRef.current) return
      hasTriggeredRef.current = true
      setIsOpening(true)
      onRevealStart()
      setTimeout(() => onOpen(), ANIM_MS)
    }, AUTO_OPEN_MS)
    return () => clearTimeout(t)
  }, [onOpen, onRevealStart])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: COLOR.crema,
        opacity: isOpening ? 0 : 1,
        transition: "opacity 1s ease 0.12s",
        pointerEvents: isOpening ? "none" : "auto",
      }}
    >
      <button
        type="button"
        onClick={handleOpenClick}
        disabled={isOpening}
        aria-label="Abrir invitación"
        className="relative aspect-[720/950] h-dvh w-auto cursor-pointer appearance-none border-0 bg-transparent p-0 disabled:cursor-default sm:h-auto sm:w-[440px] shadow-md drop-shadow-md"
      >
        <img
          src="/boda-angela/sobre/bottom.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          style={{
            transform: isOpening ? "translateY(38%)" : "translateY(0)",
            opacity: isOpening ? 0 : 1,
            transition: "transform 1s cubic-bezier(0.4,0,0.2,1) 0.12s, opacity 1s ease 0.12s",
          }}
        />
        <img
          src="/boda-angela/sobre/top.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          style={{
            transform: isOpening ? "translateY(-38%)" : "translateY(0)",
            opacity: isOpening ? 0 : 1,
            transition: "transform 1s cubic-bezier(0.4,0,0.2,1) 0.12s, opacity 1s ease 0.12s",
          }}
        />

        {titular && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              transform: isOpening ? "translateY(-38%)" : "translateY(0)",
              opacity: isOpening ? 0 : 1,
              transition: "transform 1s cubic-bezier(0.4,0,0.2,1) 0.12s, opacity 1s ease 0.12s",
            }}
          >
            <div className="absolute inset-x-0 top-[25%] -translate-y-1/2 px-8 text-center">
              <p style={{ ...TYPO.timer, fontSize: 26, color: COLOR.darkBrown }}>{titular.nombre}</p>
              {titular.cantidad && (
                <p className="mt-1" style={{ ...TYPO.h3, fontSize: 14, color: COLOR.brown }}>
                  {titular.cantidad}
                </p>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes selloPulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.06);
            }
          }
        `}</style>

        <img
          src="/boda-angela/sobre/sello.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          style={{
            opacity: isOpening ? 0 : 1,
            transition: "opacity 0.45s ease-in",
            animation: isOpening ? "none" : "selloPulse 2s ease-in-out infinite",
          }}
        />
      </button>
    </div>
  )
}
