import { useState } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { confirmarAsistencia } from "@/services/invitacionService"

interface RsvpSectionProps {
  invitacionId: string
  invitadoParam: string | null
  mostrarBoton: boolean
  fechaLimite?: string | null
  colorAccent: string
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
  colorAccent,
}: RsvpSectionProps) {
  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensaje, setMensaje] = useState("")
  const bodyFont = "'Nunito Sans', sans-serif"

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

  // Sin invitado → solo "¡Te espero!"
  if (!invitadoParam) {
    return (
      <section className="flex flex-col items-center px-7 py-14 gap-5 text-center bg-white">
        <img
          src="/quince-elegante/Recurso-div-azul.svg"
          alt=""
          aria-hidden="true"
          className="w-36 pointer-events-none select-none"
          loading="lazy"
        />
        <h2
          className="text-[2.2rem] italic leading-tight"
          style={{ fontFamily: "'Lora', Georgia, serif", color: colorAccent }}
        >
          ¡Te espero!
        </h2>
      </section>
    )
  }

  if (!mostrarBoton) return null

  return (
    <section className="flex flex-col items-center px-7 py-14 gap-5 text-center bg-white">
      {/* Divider */}
      <img
        src="/quince-elegante/Recurso-div-azul.svg"
        alt=""
        aria-hidden="true"
        className="w-36 pointer-events-none select-none"
        loading="lazy"
      />

      {estado === "success" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2
            className="text-[2rem] font-bold italic"
            style={{ fontFamily: "'Lora', Georgia, serif", color: colorAccent }}
          >
            ¡Confirmado!
          </h2>
          <p className="text-sm text-[#888]" style={{ fontFamily: bodyFont }}>
            {mensaje}
          </p>
        </div>
      ) : estado === "error" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2
            className="text-[1.8rem] font-bold italic text-[#333]"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            Error
          </h2>
          <p className="text-sm text-[#888]" style={{ fontFamily: bodyFont }}>
            {mensaje}
          </p>
          <button
            onClick={() => setEstado("idle")}
            className="text-sm font-semibold underline"
            style={{ color: colorAccent, fontFamily: bodyFont }}
          >
            Intentar de nuevo
          </button>
        </div>
      ) : (
        <>
          <h2
            className="text-[2.2rem] italic leading-tight"
            style={{ fontFamily: "'Lora', Georgia, serif", color: colorAccent }}
          >
            ¿Me acompañás?
          </h2>

          {fechaLimite && (
            <p className="text-sm text-[#888]" style={{ fontFamily: bodyFont }}>
              Confirmá tu asistencia antes del {formatFechaLimite(fechaLimite)}
            </p>
          )}

          <button
            onClick={handleConfirmar}
            disabled={estado === "loading"}
            className="mt-2 w-full max-w-[260px] cursor-pointer py-3.5 text-sm text-white font-semibold transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{
              fontFamily: bodyFont,
              backgroundColor: "#414E81",
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
