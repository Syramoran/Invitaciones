import { useState } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { confirmarAsistencia } from "@/services/invitacionService"

interface RsvpSectionProps {
  invitacionId: string
  invitadoParam: string | null
  mostrarBoton: boolean
  fechaLimite?: string | null
}

export function RsvpSection({
  invitacionId,
  invitadoParam,
  mostrarBoton,
  fechaLimite,
}: RsvpSectionProps) {
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

  // Sin invitado en la URL → siempre mostrar "Te esperamos"
  if (!invitadoParam) {
    return (
      <section
        className="flex flex-col items-center py-12 pt-0 px-7 gap-5 text-center"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
      >
        <h2 className="text-[2.5rem] italic font-semibold text-[#1a1a1a]">
          ¡Te esperamos!
        </h2>
      </section>
    )
  }

  if (!mostrarBoton) return null

  return (
    <section
      className="flex flex-col items-center py-12 pt-0 px-7 gap-5 text-center"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
    >
      {estado === "success" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-[2rem] italic font-semibold text-[#333]">¡Confirmado!</h2>
          <p
            className="text-base text-[#787878]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            {mensaje}
          </p>
        </div>
      ) : estado === "error" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-[2rem] italic font-semibold text-[#333]">Error</h2>
          <p
            className="text-base text-[#787878]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            {mensaje}
          </p>
          <button
            onClick={() => setEstado("idle")}
            className="text-base font-medium underline"
            style={{ color: "var(--invitation-primary)", fontFamily: "Lato, sans-serif" }}
          >
            Intentar de nuevo
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-[2.5rem] italic font-semibold text-[#1a1a1a]">
            ¿Nos acompañás?
          </h2>

          <button
            onClick={handleConfirmar}
            disabled={estado === "loading"}
            className="mt-2 cursor-pointer rounded-[29px] border-2 border-[var(--invitation-primary)] bg-[#fcf8f0] px-11 py-3.5 text-base text-[#333] transition-colors hover:bg-[#e3ded6] disabled:opacity-50"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            {estado === "loading" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirmando...
              </span>
            ) : (
              "Confirmar asistencia"
            )}
          </button>
        </>
      )}
    </section>
  )
}
