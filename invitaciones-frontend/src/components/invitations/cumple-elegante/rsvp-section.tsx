import { useState } from "react"
import { confirmarAsistencia } from "@/services/invitacionService"
import { Loader2, Check, AlertCircle } from "lucide-react"

interface RsvpSectionProps {
  invitacionId: string
  invitadoParam: string | null
  mostrarBoton: boolean
  accentColor: string
}

export function RsvpSection({ invitacionId, invitadoParam, mostrarBoton, accentColor }: RsvpSectionProps) {
  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensaje, setMensaje] = useState("")

  const handleConfirmar = async () => {
    if (!invitadoParam) return

    setEstado("loading")
    try {
      const response = await confirmarAsistencia(invitacionId, { invitadoSlug: invitadoParam })
      setEstado("success")
      setMensaje(response.mensaje || "¡Gracias por confirmar tu asistencia!")
    } catch {
      setEstado("error")
      setMensaje("No se pudo registrar tu confirmación. Intentá de nuevo.")
    }
  }

  // Sin invitado en la URL → mostrar "Te espero"
  if (!invitadoParam) {
    return (
      <section className="px-7 py-12 text-center">
        <h2
          className="text-[32px] italic"
          style={{ fontFamily: "'Libre Baskerville', Georgia, serif", color: accentColor }}
        >
          ¡Te espero!
        </h2>
      </section>
    )
  }

  if (!mostrarBoton) return null

  return (
    <section className="px-7 pb-12 pt-4 text-center">
      {estado === "success" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2
            className="text-xl font-semibold text-[#1a1a1a]"
            style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}
          >
            ¡Confirmado!
          </h2>
          <p className="text-sm text-[#777777]" style={{ fontFamily: "'Raleway', sans-serif" }}>
            {mensaje}
          </p>
        </div>
      ) : estado === "error" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2
            className="text-xl font-semibold text-[#1a1a1a]"
            style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}
          >
            Error
          </h2>
          <p className="text-sm text-[#777777]" style={{ fontFamily: "'Raleway', sans-serif" }}>
            {mensaje}
          </p>
          <button
            onClick={() => setEstado("idle")}
            className="mt-2 text-sm font-medium underline"
            style={{ color: accentColor, fontFamily: "'Raleway', sans-serif" }}
          >
            Intentar de nuevo
          </button>
        </div>
      ) : (
        <>
          <h2
            className="mb-2 text-[22px] text-[#1a1a1a]"
            style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontWeight: 400 }}
          >
            ¿Me acompañas?
          </h2>
          <button
            onClick={handleConfirmar}
            disabled={estado === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-3xl px-12 py-4 text-sm font-bold tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: accentColor,
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            {estado === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              "Confirmar asistencia"
            )}
          </button>
        </>
      )}
    </section>
  )
}
