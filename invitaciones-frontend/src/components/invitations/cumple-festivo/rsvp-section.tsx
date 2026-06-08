import { useState } from "react"
import { confirmarAsistencia } from "@/services/invitacionService"
import { Loader2, Check, AlertCircle } from "lucide-react"

interface RsvpSectionProps {
  invitacionId: string
  invitadoParam: string | null
  mostrarBoton: boolean
}

export function RsvpSection({ invitacionId, invitadoParam, mostrarBoton }: RsvpSectionProps) {
  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensaje, setMensaje] = useState("")

  const nombreMostrado = invitadoParam ? invitadoParam.replace(/-/g, " ") : ""

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

  if (!mostrarBoton) return null

  return (
    <section className="px-10 py-14 text-center">
      <p className="mb-8 text-center text-[13px] font-medium tracking-[0.3em] text-[#aaaaaa] uppercase">
        Confirmación
      </p>

      {estado === "success" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <Check className="h-8 w-8 text-[#aaaaaa]" />
          </div>
          <h2 className="text-xl font-semibold text-white">¡Confirmado!</h2>
          <p className="text-sm text-[#999999]">{mensaje}</p>
        </div>
      ) : estado === "error" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Error</h2>
          <p className="text-sm text-[#999999]">{mensaje}</p>
          <button
            onClick={() => setEstado("idle")}
            className="mt-2 text-sm font-medium text-[var(--invitation-primary)] underline"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : (
        <>
          <h2 className="mb-7 text-[22px] font-semibold text-white">¿Me acompañas?</h2>
          <button
            onClick={handleConfirmar}
            disabled={estado === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--invitation-primary)] px-12 py-4 text-sm font-bold tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
