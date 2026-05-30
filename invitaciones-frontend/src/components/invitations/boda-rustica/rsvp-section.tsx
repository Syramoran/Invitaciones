import { useState } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { confirmarAsistencia } from "@/services/invitacionService"

interface RsvpSectionProps {
  invitacionId: string
  invitadoParam: string | null
  mostrarBoton: boolean
  fechaLimite?: string | null
}

function formatFechaLimite(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number)
  const fecha = new Date(y, m - 1, d)
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]
  return `${d} de ${meses[fecha.getMonth()]}`
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

  // Sin invitado en la URL → siempre mostrar "Te esperamos"
  if (!invitadoParam) {
    return (
      <section className="flex flex-col items-center py-12 px-7 gap-5 text-center">
        <h2
          className="text-[3rem] font-bold text-[#333]"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          ¡Te esperamos!
        </h2>
      </section>
    )
  }

  if (!mostrarBoton) return null

  return (
    <section
      className="flex flex-col items-center py-12 px-7 gap-5 text-center"
      style={{ fontFamily: "Quicksand, sans-serif" }}
    >
      {estado === "success" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2
            className="text-[2.5rem] font-bold text-[#333]"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            ¡Confirmado!
          </h2>
          <p className="text-base text-[#787878]">{mensaje}</p>
        </div>
      ) : estado === "error" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2
            className="text-[2rem] font-bold text-[#333]"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Error
          </h2>
          <p className="text-base text-[#787878]">{mensaje}</p>
          <button
            onClick={() => setEstado("idle")}
            className="text-base font-medium underline"
            style={{ color: "var(--invitation-primary)" }}
          >
            Intentar de nuevo
          </button>
        </div>
      ) : (
        <>
          <h2
            className="text-[3rem] font-bold text-[#333]"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            ¿Nos acompañás?
          </h2>

          {fechaLimite && (
            <p className="text-base font-semibold text-[#787878]">
              Confirmá tu asistencia antes del {formatFechaLimite(fechaLimite)}
            </p>
          )}

          <button
            onClick={handleConfirmar}
            disabled={estado === "loading"}
            className="mt-2 cursor-pointer rounded-[1px] px-12 py-4 text-base font-semibold text-white transition-colors hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: "var(--invitation-primary)" }}
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
