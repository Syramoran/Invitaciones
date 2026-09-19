import { Loader2, Check, AlertCircle } from "lucide-react"
import type { InvitacionPublica } from "@/types/invitation"
import { useRsvpConfirmacion } from "@/components/invitations/shared/useRsvpConfirmacion"

interface RsvpSectionProps {
  invitacion: InvitacionPublica
  invitadoParam: string | null // formato: slug del ?invitado URL param
  mostrarBoton: boolean
}

export function RsvpSection({ invitacion, invitadoParam, mostrarBoton }: RsvpSectionProps) {
  const {
    estado,
    mensaje,
    confirmado,
    agregarPlusOne,
    setAgregarPlusOne,
    plusOneNombre,
    setPlusOneNombre,
    plusOneApellido,
    setPlusOneApellido,
    restriccionAlimentaria,
    setRestriccionAlimentaria,
    confirmar,
    reintentar,
  } = useRsvpConfirmacion({
    invitacionId: invitacion.id,
    invitadoSlug: invitadoParam ?? "",
    puedeAgregarPlusOne: invitacion.puedeAgregarPlusOne ?? false,
    yaConfirmado: invitacion.yaConfirmado ?? false,
    restriccionAlimentariaExistente: invitacion.restriccionAlimentariaExistente ?? null,
    plusOneExistente: invitacion.plusOneExistente ?? null,
  })

  if (!mostrarBoton || !invitadoParam) return null

  return (
    <section className="px-7 py-12 text-center">
      <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#777777]">
        Confirmación
      </p>

      {estado === "error" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-[#1a1a1a]">Error</h2>
          <p className="text-sm text-[#777777]">{mensaje}</p>
          <button
            onClick={reintentar}
            className="mt-2 text-sm font-medium text-[var(--invitation-primary)] underline"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : (
        <div className="text-left">
          {confirmado ? (
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <Check className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-[#1a1a1a]">¡Confirmado!</h2>
              {estado === "success" && <p className="text-sm text-[#777777]">{mensaje}</p>}
              <p className="text-xs text-[#aaaaaa]">Podés seguir editando los datos de abajo si hace falta.</p>
            </div>
          ) : (
            <h2 className="mb-6 text-center text-[22px] font-semibold text-[#1a1a1a]">¿Nos acompañás?</h2>
          )}

          {invitacion.puedeAgregarPlusOne && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-[#1a1a1a]">
                <input
                  type="checkbox"
                  checked={agregarPlusOne}
                  onChange={(e) => setAgregarPlusOne(e.target.checked)}
                  className="h-4 w-4"
                />
                Voy a llevar un acompañante
              </label>

              {agregarPlusOne && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={plusOneNombre}
                    onChange={(e) => setPlusOneNombre(e.target.value)}
                    placeholder="Nombre"
                    className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[var(--invitation-primary)]"
                  />
                  <input
                    value={plusOneApellido}
                    onChange={(e) => setPlusOneApellido(e.target.value)}
                    placeholder="Apellido"
                    className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[var(--invitation-primary)]"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mb-7">
            <label className="mb-1 block text-sm text-[#1a1a1a]">
              ¿Alguna restricción alimentaria?
            </label>
            <input
              value={restriccionAlimentaria}
              onChange={(e) => setRestriccionAlimentaria(e.target.value)}
              placeholder="Ej: Sin gluten, vegetariano..."
              className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[var(--invitation-primary)]"
            />
          </div>

          <div className="text-center">
            <button
              onClick={confirmar}
              disabled={estado === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--invitation-primary)] px-12 py-4 text-sm font-bold tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {estado === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : confirmado ? (
                "Actualizar confirmación"
              ) : (
                "Confirmar asistencia"
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
