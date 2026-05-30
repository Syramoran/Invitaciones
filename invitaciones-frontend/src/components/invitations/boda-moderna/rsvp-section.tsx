import { useState } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import { confirmarAsistencia } from "@/services/invitacionService"

const FONT_SCRIPT = "'Pinyon Script', cursive"
const FONT_BODY = "Montserrat, sans-serif"

interface RsvpSectionProps {
  invitacionId: string
  invitadoParam: string | null
  mostrarBoton: boolean
  fechaLimite?: string | null
}

function formatFechaLimite(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number)
  const fecha = new Date(y, m - 1, d)
  return fecha.toLocaleDateString("es-AR", { day: "numeric", month: "long" })
}

export function RsvpSection({
  invitacionId,
  invitadoParam,
  mostrarBoton,
  fechaLimite,
}: RsvpSectionProps) {
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

  // Sin invitado → mensaje genérico
  if (!invitadoParam) {
    return (
      <section
        className="flex flex-col items-center gap-5 px-7 py-12 text-center"
        style={{ fontFamily: FONT_BODY }}
      >
        <h2
          className="text-[#1a1a1a] text-[56px] font-normal"
          style={{ fontFamily: FONT_SCRIPT }}
        >
          ¡Te esperamos!
        </h2>
      </section>
    )
  }

  if (!mostrarBoton) return null

  return (
    <section
      className="flex flex-col items-center gap-5 px-7 py-12 text-center"
      style={{ fontFamily: FONT_BODY }}
    >
      {estado === "success" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2
            className="text-[#1a1a1a] text-[48px] font-normal"
            style={{ fontFamily: FONT_SCRIPT }}
          >
            ¡Confirmado!
          </h2>
          <p className="text-[#777777] text-base">{mensaje}</p>
        </div>
      ) : estado === "error" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2
            className="text-[#1a1a1a] text-[48px] font-normal"
            style={{ fontFamily: FONT_SCRIPT }}
          >
            Error
          </h2>
          <p className="text-[#777777] text-base">{mensaje}</p>
          <button
            onClick={() => setEstado("idle")}
            className="text-base font-medium underline text-[#555555]"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : (
        <>
          <h2
            className="text-5xl font-normal leading-tight"
            style={{ fontFamily: FONT_SCRIPT, color: "var(--invitation-primary)" }}
          >
            ¿Nos acompañás?
          </h2>

          <button
            onClick={handleConfirmar}
            disabled={estado === "loading"}
            className="mt-2 cursor-pointer px-10 py-3.5 rounded-full text-white text-base hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
            style={{ backgroundColor: "var(--invitation-primary)", fontFamily: FONT_BODY }}
          >
            {estado === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar asistencia
          </button>
        </>
      )}
    </section>
  )
}
