import { useState } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { confirmarAsistencia } from "@/services/invitacionService"
import { DiamondDivider } from "./quince-moderna-svgs"

const FONT_BODY = "'DM Sans', sans-serif"
const FONT_HEADING = "'Source Serif 4', Georgia, serif"

interface RsvpSectionProps {
  invitacionId: string
  invitadoParam: string | null
  mostrarBoton: boolean
  fechaLimite?: string | null
}

function formatFechaLimite(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number)
  const fecha = new Date(y, m - 1, d)
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long" })
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

  /* No hay invitado en la URL → mensaje genérico */
  if (!invitadoParam) {
    return (
      <section className="flex flex-col items-center gap-4 px-7 pb-12 pt-10 text-center">
        <DiamondDivider style={{ color: "var(--invitation-primary)" }} />
        <h2
          className="text-[2rem]"
          style={{
            fontFamily: FONT_HEADING,
            fontStyle: "italic",
            color: "var(--invitation-primary)",
          }}
        >
          ¡Te espero!
        </h2>
      </section>
    )
  }

  if (!mostrarBoton) return null

  return (
    <section className="flex flex-col items-center gap-5 px-7 pb-12 pt-10 text-center">

      {estado === "success" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <Check className="h-7 w-7 text-green-600" />
          </div>
          <h2
            className="text-[1.9rem]"
            style={{
              fontFamily: FONT_HEADING,
              fontStyle: "italic",
              color: "var(--invitation-primary)",
            }}
          >
            ¡Confirmado!
          </h2>
          <p className="text-sm text-[#888]" style={{ fontFamily: FONT_BODY }}>
            {mensaje}
          </p>
        </div>
      ) : estado === "error" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <h2
            className="text-[1.9rem] text-[#333]"
            style={{ fontFamily: FONT_HEADING, fontStyle: "italic" }}
          >
            Error
          </h2>
          <p className="text-sm text-[#888]" style={{ fontFamily: FONT_BODY }}>
            {mensaje}
          </p>
          <button
            onClick={() => setEstado("idle")}
            className="text-sm underline cursor-pointer"
            style={{ fontFamily: FONT_BODY, color: "var(--invitation-primary)" }}
          >
            Intentar de nuevo
          </button>
        </div>
      ) : (
        <>
          <h2
            className="text-[2rem] leading-tight"
            style={{
              fontFamily: FONT_HEADING,
              fontStyle: "italic",
              color: "var(--invitation-primary)",
            }}
          >
            ¿Me acompañás?
          </h2>

          {fechaLimite && (
            <p className="text-sm text-[#888]" style={{ fontFamily: FONT_BODY }}>
              Confirmá tu asistencia antes del {formatFechaLimite(fechaLimite)}
            </p>
          )}

          <button
            onClick={handleConfirmar}
            disabled={estado === "loading"}
            className="mt-1 w-full max-w-[220px] cursor-pointer py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{
              fontFamily: FONT_BODY,
              backgroundColor: "#181C47",
              letterSpacing: "0.04em",
              border: "1px solid",
              borderImage: "linear-gradient(to right, var(--invitation-primary), transparent) 1",
            }}
          >
            {estado === "loading" ? (
              <span className="flex items-center justify-center gap-2">
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
