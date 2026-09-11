import { useState } from "react"
import { confirmarGrupo } from "@/services/invitacionService"
import type { InvitacionPublica } from "@/types/invitation"

interface GrupoRsvpSectionProps {
  invitacionId: string
  grupo: NonNullable<InvitacionPublica["grupo"]>
  mostrarBoton: boolean
  claseContenedor?: string
  colorPrimario?: string
}

interface IntegranteNuevo {
  nombre: string
  apellido: string
}

/**
 * Variante de RSVP para el link de grupo (?grupo=slug). Reutilizable entre
 * templates: no trae estilos hardcodeados de ningún template puntual más
 * allá de clases utilitarias neutras, para poder conectarse en varios.
 */
export function GrupoRsvpSection({ invitacionId, grupo, mostrarBoton }: GrupoRsvpSectionProps) {
  const [seleccionados, setSeleccionados] = useState<Set<number>>(
    () => new Set(grupo.integrantes.filter((i) => i.confirmado).map((i) => i.id)),
  )
  const [nuevos, setNuevos] = useState<IntegranteNuevo[]>([])
  const [nombreNuevo, setNombreNuevo] = useState("")
  const [apellidoNuevo, setApellidoNuevo] = useState("")
  const [restriccionAlimentaria, setRestriccionAlimentaria] = useState(
    grupo.restriccionAlimentaria ?? "",
  )
  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensaje, setMensaje] = useState("")

  const totalActual = seleccionados.size + nuevos.length
  const llegoAlTope = grupo.maxIntegrantesEfectivo !== null && totalActual >= grupo.maxIntegrantesEfectivo

  function toggleIntegrante(id: number) {
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function agregarNuevo() {
    if (!nombreNuevo.trim() || !apellidoNuevo.trim() || llegoAlTope) return
    setNuevos((prev) => [...prev, { nombre: nombreNuevo.trim(), apellido: apellidoNuevo.trim() }])
    setNombreNuevo("")
    setApellidoNuevo("")
  }

  function quitarNuevo(index: number) {
    setNuevos((prev) => prev.filter((_, i) => i !== index))
  }

  async function confirmar() {
    setEstado("loading")
    try {
      const response = await confirmarGrupo(invitacionId, {
        grupoSlug: grupo.slug,
        integrantesConfirmados: Array.from(seleccionados),
        integrantesNuevos: nuevos,
        restriccionAlimentaria: restriccionAlimentaria.trim() || undefined,
      })
      setEstado("success")
      setMensaje(response.mensaje || "¡Gracias por confirmar!")
      setNuevos([])
    } catch {
      setEstado("error")
      setMensaje("No se pudo registrar la confirmación. Intentá de nuevo.")
    }
  }

  if (!mostrarBoton) return null

  return (
    <section className="px-7 py-12">
      <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#777777]">
        Confirmación
      </p>
      <h2 className="mb-1 text-center text-[22px] font-semibold text-[#1a1a1a]">
        {grupo.nombre}
      </h2>
      <p className="mb-7 text-center text-sm text-[#777777]">
        Marcá quiénes van a asistir del grupo
        {grupo.maxIntegrantesEfectivo !== null && ` (hasta ${grupo.maxIntegrantesEfectivo} personas)`}.
      </p>

      {estado === "error" && (
        <p className="mb-4 text-center text-sm text-red-500">{mensaje}</p>
      )}

      <div className="mb-5 space-y-2">
        {grupo.integrantes.map((i) => (
          <label
            key={i.id}
            className="flex items-center gap-3 rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-sm text-[#1a1a1a]"
          >
            <input
              type="checkbox"
              checked={seleccionados.has(i.id)}
              onChange={() => toggleIntegrante(i.id)}
              className="h-4 w-4"
            />
            <span className="capitalize">{i.nombre} {i.apellido}</span>
          </label>
        ))}

        {nuevos.map((n, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-2 rounded-lg bg-[#faf9f8] px-3 py-2.5 text-sm text-[#1a1a1a]"
          >
            <span className="capitalize">+ {n.nombre} {n.apellido}</span>
            <button onClick={() => quitarNuevo(idx)} className="text-xs text-[#bbbbbb] hover:text-red-500">
              Quitar
            </button>
          </div>
        ))}
      </div>

      {!llegoAlTope && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium text-[#777777]">Sumar a alguien más del grupo</p>
          <div className="flex gap-2">
            <input
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              placeholder="Nombre"
              className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[var(--invitation-primary)]"
            />
            <input
              value={apellidoNuevo}
              onChange={(e) => setApellidoNuevo(e.target.value)}
              placeholder="Apellido"
              className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[var(--invitation-primary)]"
            />
            <button
              onClick={agregarNuevo}
              disabled={!nombreNuevo.trim() || !apellidoNuevo.trim()}
              className="shrink-0 rounded-lg border border-[var(--invitation-primary)] px-3 text-sm font-medium text-[var(--invitation-primary)] disabled:opacity-40"
            >
              + Agregar
            </button>
          </div>
        </div>
      )}

      <div className="mb-7">
        <label className="mb-1 block text-sm text-[#1a1a1a]">
          ¿Alguna restricción alimentaria del grupo?
        </label>
        <input
          value={restriccionAlimentaria}
          onChange={(e) => setRestriccionAlimentaria(e.target.value)}
          placeholder="Ej: Nombre - vegetariano"
          className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[var(--invitation-primary)]"
        />
      </div>

      <div className="text-center">
        <button
          onClick={confirmar}
          disabled={estado === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--invitation-primary)] px-12 py-4 text-sm font-bold tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {estado === "loading" ? "Confirmando..." : "Confirmar asistencia"}
        </button>
        {estado === "success" && (
          <p className="mt-4 text-sm text-green-600">{mensaje}</p>
        )}
      </div>
    </section>
  )
}
