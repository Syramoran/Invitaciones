import { useState } from "react"
import { confirmarAsistencia } from "@/services/invitacionService"
import { Loader2, Check, AlertCircle } from "lucide-react"

interface RsvpSectionProps {
  invitacionId: string
  invitadoParam: string | null // formato: "nombre-apellido" del ?invitado URL param
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
    <section className="px-7 py-12 text-center">
      <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#777777]">
        Confirmación
      </p>

      {estado === "success" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-[#1a1a1a]">¡Confirmado!</h2>
          <p className="text-sm text-[#777777]">{mensaje}</p>
        </div>
      ) : estado === "error" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-[#1a1a1a]">Error</h2>
          <p className="text-sm text-[#777777]">{mensaje}</p>
          <button
            onClick={() => setEstado("idle")}
            className="mt-2 text-sm font-medium text-[var(--invitation-primary)] underline"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : (
        <>
          <h2 className="mb-2 text-[22px] font-semibold text-[#1a1a1a]">¿Nos acompañás?</h2>
          {nombreMostrado && (
            <p className="mb-7 text-sm text-[#777777]">Hola, {nombreMostrado}</p>
          )}
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
