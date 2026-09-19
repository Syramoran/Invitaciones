import { useState, useEffect } from "react"
import { Music } from "lucide-react"
import { COLOR, TYPO } from "./theme"

interface EnvelopeOverlayAngelaProps {
  titulo: string
  onOpen: () => void
  tieneMusica: boolean
}

export function EnvelopeOverlayAngela({ titulo, onOpen, tieneMusica }: EnvelopeOverlayAngelaProps) {
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

  const parts = titulo.includes(" y ") ? titulo.split(" y ") : null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isOpening ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "rgba(59,51,43,0.55)" }}
    >
      {!isLoaded && (
        <div className="relative z-10 flex items-center justify-center">
          <div
            className="h-12 w-12 rounded-full border-4 animate-spin"
            style={{ borderColor: "rgba(103,89,76,0.2)", borderTopColor: COLOR.brown }}
          />
        </div>
      )}

      {isLoaded && (
        <div
          className="relative z-10 w-[300px] overflow-hidden rounded-2xl text-center shadow-xl"
          style={{
            backgroundColor: COLOR.parchment,
            animation: "boda-angela-fadein 0.45s ease forwards",
          }}
        >
          <style>{`@keyframes boda-angela-fadein{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}`}</style>

          <div className="relative px-7 pb-9 pt-10">
            <p
              className="mb-4"
              style={{ ...TYPO.h3, color: COLOR.brown }}
            >
              Recibiste una invitación
            </p>

            <div className="mx-auto mb-5 h-px w-12" style={{ backgroundColor: `${COLOR.brown}70` }} />

            {parts ? (
              <div className="mb-8 flex flex-col items-center leading-none">
                <span style={{ ...TYPO.h1, fontSize: 42, color: COLOR.negro, lineHeight: 1 }}>
                  {parts[0].trim()}
                </span>
                <span style={{ ...TYPO.h1, fontSize: 24, color: COLOR.brown, lineHeight: 1 }}>
                  y
                </span>
                <span style={{ ...TYPO.h1, fontSize: 42, color: COLOR.negro, lineHeight: 1 }}>
                  {parts[1].trim()}
                </span>
              </div>
            ) : (
              <p className="mb-8" style={{ ...TYPO.h1, fontSize: 40, color: COLOR.negro, lineHeight: 1 }}>
                {titulo}
              </p>
            )}

            <button
              onClick={handleOpen}
              className="inline-block w-full cursor-pointer rounded-[4px] py-3.5 transition-opacity hover:opacity-85 active:scale-95"
              style={{ ...TYPO.text2, backgroundColor: COLOR.crema, color: COLOR.negro }}
            >
              Abrir invitación
            </button>

            {tieneMusica && (
              <p
                className="mt-4 flex items-center justify-center gap-1.5"
                style={{ ...TYPO.text3, color: COLOR.brown }}
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
