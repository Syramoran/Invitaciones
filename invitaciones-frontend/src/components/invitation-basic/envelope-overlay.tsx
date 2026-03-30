import { useState } from "react"
import { Music } from "lucide-react"

interface EnvelopeOverlayProps {
  titulo: string
  onOpen: () => void
  tieneMusica: boolean
}

export function EnvelopeOverlay({ titulo, onOpen, tieneMusica }: EnvelopeOverlayProps) {
  const [isOpening, setIsOpening] = useState(false)

  const handleOpen = () => {
    setIsOpening(true)
    // Pequeño delay para animación
    setTimeout(() => {
      onOpen()
    }, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/55 transition-opacity duration-300 ${
        isOpening ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex w-[300px] flex-col items-center">
        {/* Moño/Ribbon */}
        <div className="relative z-10 mb-[-6px] h-11 w-20">
          {/* Loop izquierdo */}
          <div
            className="absolute left-1.5 top-0 h-7 w-8 -rotate-[25deg] rounded-full border-[3px] border-[var(--invitation-primary)] bg-transparent"
          />
          {/* Loop derecho */}
          <div
            className="absolute right-1.5 top-0 h-7 w-8 rotate-[25deg] rounded-full border-[3px] border-[var(--invitation-primary)] bg-transparent"
          />
          {/* Nudo */}
          <div
            className="absolute bottom-2.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[var(--invitation-primary)]"
          />
          {/* Cola izquierda */}
          <div
            className="absolute bottom-0 left-7 h-[18px] w-[3px] rotate-[15deg] rounded-sm bg-[var(--invitation-primary)]"
          />
          {/* Cola derecha */}
          <div
            className="absolute bottom-0 right-7 h-[18px] w-[3px] -rotate-[15deg] rounded-sm bg-[var(--invitation-primary)]"
          />
        </div>

        {/* Cuerpo del sobre */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-white px-7 pb-9 pt-12 text-center">
          {/* Solapa */}
          <div
            className="absolute left-0 right-0 top-0 h-[60px] bg-[#f5f5f5]"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
          />

          <span className="relative z-10 mb-4 block text-4xl">💌</span>
          <p className="mb-2 text-sm text-[#777777]">Recibiste una invitación</p>
          <p className="mb-7 text-2xl font-bold text-[#1a1a1a]">{titulo}</p>

          <button
            onClick={handleOpen}
            className="inline-block rounded-lg bg-[var(--invitation-primary)] px-10 py-3.5 text-sm font-semibold tracking-wide text-white transition-transform hover:scale-105"
          >
            Abrir invitación
          </button>

          {tieneMusica && (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#777777]">
              <Music className="h-3 w-3" />
              Se reproducirá música al abrir
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
