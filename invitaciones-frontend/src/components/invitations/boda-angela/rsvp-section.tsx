import { useState } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { confirmarAsistencia } from "@/services/invitacionService"
import { COLOR, TYPO } from "./theme"

interface RsvpSectionProps {
  invitacionId: string
  invitadoParam: string | null
  mostrarBoton: boolean
}

export function RsvpSection({ invitacionId, invitadoParam, mostrarBoton }: RsvpSectionProps) {
  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensaje, setMensaje] = useState("")
  const [restriccionAlimentaria, setRestriccionAlimentaria] = useState("")

  if (!mostrarBoton || !invitadoParam) return null

  const handleConfirmar = async () => {
    setEstado("loading")
    try {
      const response = await confirmarAsistencia(invitacionId, {
        invitadoSlug: invitadoParam,
        restriccionAlimentaria: restriccionAlimentaria.trim() || undefined,
      })
      setEstado("success")
      setMensaje(response.mensaje || "¡Gracias por confirmar tu asistencia!")
    } catch {
      setEstado("error")
      setMensaje("No se pudo registrar tu confirmación. Intentá de nuevo.")
    }
  }

  return (
    <section className="flex flex-col items-center gap-16 px-7 pt-20 pb-10 text-center">
      <h2
        style={{ ...TYPO.h2, color: COLOR.darkBrown }}
      >
        ¿Nos acompañás?
      </h2>

      {estado === "success" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 style={{ ...TYPO.h3, color: COLOR.darkBrown }}>¡Confirmado!</h3>
          <p style={{ ...TYPO.text, color: COLOR.brown }}>
            {mensaje}
          </p>
        </div>
      ) : estado === "error" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p style={{ ...TYPO.text, color: COLOR.brown }}>
            {mensaje}
          </p>
          <button
            onClick={() => setEstado("idle")}
            className="underline"
            style={{ ...TYPO.text, color: COLOR.brown }}
          >
            Intentar de nuevo
          </button>
        </div>
      ) : (
        <>
          <p
            className="max-w-[16rem]"
            style={{ ...TYPO.text2, color: COLOR.darkBrown }}
          >
            Confirmá tu asistencia antes de la fecha límite
          </p>

          <div className="flex w-full max-w-[20.75rem] flex-col items-start gap-4 text-left">
            <label
              className="w-full"
              style={{ ...TYPO.text, color: COLOR.brown }}
            >
              ¿Tenés alguna restricción alimentaria?
            </label>
            <textarea
              value={restriccionAlimentaria}
              onChange={(e) => setRestriccionAlimentaria(e.target.value)}
              placeholder="Explicalo acá"
              rows={2}
              className="w-full resize-none rounded-[4px] p-2 outline-none"
              style={{ ...TYPO.text, backgroundColor: '#e9e5e2', color: COLOR.brown }}
            />
          </div>

          <button
            onClick={handleConfirmar}
            disabled={estado === "loading"}
            className="rounded-[4px] px-12 py-4 transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ ...TYPO.text, backgroundColor: COLOR.crema, color: COLOR.negro }}
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
