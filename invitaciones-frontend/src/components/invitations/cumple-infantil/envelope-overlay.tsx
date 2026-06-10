import { useState } from "react"
import { Music, Heart } from "lucide-react"

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

  // Si el título viene con un formato "Mis X añitos Nombre", intentamos separarlo
  // para que quede como en el diseño (subtitle y title). Si no, lo mostramos entero.
  let subtitle = ""
  let mainTitle = titulo

  // Un heurístico simple para separar "Mis X añitos" del nombre
  const match = titulo.match(/^(Mis \d+ añitos|Mis añitos|Mi primer añito)\s+(.+)$/i)
  if (match) {
    subtitle = match[1]
    mainTitle = match[2]
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/55 transition-opacity duration-300 ${isOpening ? "opacity-0" : "opacity-100"
        }`}
    >
      <div className="flex w-[350px] max-w-[90vw] flex-col items-center">
        {/* Cuerpo del sobre */}
        <div
          className="relative flex min-h-[350px] w-full flex-col justify-center overflow-hidden rounded-[2rem] bg-white bg-[url('/cumple-infantil/animalitos-overlay.png')] bg-cover bg-center px-6 pb-10 pt-16 text-center shadow-2xl"
        >
          {/* Solapa superior */}
          <div
            className="absolute left-0 right-0 top-0 h-[90px] bg-[#fdfaf5] shadow-sm"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
          />

          {/* Corazón en la punta de la solapa */}
          <div className="absolute left-1/2 top-[75px] -translate-x-1/2 -translate-y-1/2 drop-shadow-md">
            <Heart className="h-8 w-8 fill-[var(--invitation-primary)] text-[var(--invitation-primary)]" />
          </div>

          <div className="relative z-10 mt-6 flex flex-col items-center">
            <p className="mb-4 font-[var(--font-infantil-body)] text-lg text-[#777777]">
              Recibiste una invitación
            </p>

            {subtitle ? (
              <>
                <p className="mb-2 font-[var(--font-infantil-body)] text-3xl text-[#555555]">
                  {subtitle}
                </p>
                <p className="mb-6 font-[var(--font-infantil-display)] text-[2.75rem] font-bold leading-none text-[var(--invitation-primary)]">
                  {mainTitle}
                </p>
              </>
            ) : (
              <p className="mb-6 font-[var(--font-infantil-display)] text-4xl font-bold text-[var(--invitation-primary)]">
                {titulo}
              </p>
            )}

            <button
              onClick={handleOpen}
              className="inline-block w-[70%] rounded-full bg-[var(--invitation-primary)] px-4 py-3.5 font-[var(--font-infantil-body)] text-lg font-semibold tracking-wide text-white shadow-md transition-transform hover:scale-105"
            >
              Abrir invitación
            </button>

            {tieneMusica && (
              <p className="mt-5 flex items-center justify-center gap-2 font-[var(--font-infantil-body)] text-sm text-[#777777]">
                <Music className="h-4 w-4" />
                Se reproducirá música al abrir
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
