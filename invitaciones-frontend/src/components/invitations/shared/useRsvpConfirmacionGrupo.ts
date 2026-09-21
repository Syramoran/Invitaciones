import { useState } from "react"
import { confirmarGrupo } from "@/services/invitacionService"
import type { InvitacionPublica } from "@/types/invitation"
import { extraerMensajeError, MENSAJE_ERROR_CONFIRMACION } from "./apiError"

export type EstadoRsvpGrupo = "idle" | "loading" | "success" | "error"

interface IntegranteNuevo {
  nombre: string
  apellido: string
}

interface UseRsvpConfirmacionGrupoParams {
  invitacionId: string
  grupo: NonNullable<InvitacionPublica["grupo"]>
}

/**
 * Hook reutilizable para el flujo de confirmación de un grupo (?grupo=slug).
 * Separa a los integrantes ya precargados (se confirman por id, marcando el
 * checkbox) de los nuevos que se suman en el momento (par nombre/apellido) —
 * el backend no permite editar el nombre de un integrante ya precargado
 * desde este endpoint, solo confirmar su asistencia o sumar gente nueva.
 */
export function useRsvpConfirmacionGrupo({ invitacionId, grupo }: UseRsvpConfirmacionGrupoParams) {
  const [seleccionados, setSeleccionados] = useState<Set<number>>(
    () => new Set(grupo.integrantes.filter((i) => i.confirmado).map((i) => i.id)),
  )
  const [nuevos, setNuevos] = useState<IntegranteNuevo[]>([])
  const [nombreNuevo, setNombreNuevo] = useState("")
  const [apellidoNuevo, setApellidoNuevo] = useState("")
  const [restriccionAlimentaria, setRestriccionAlimentaria] = useState(
    grupo.restriccionAlimentaria ?? "",
  )
  const [estado, setEstado] = useState<EstadoRsvpGrupo>("idle")
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
    } catch (err) {
      setEstado("error")
      setMensaje(extraerMensajeError(err, MENSAJE_ERROR_CONFIRMACION))
    }
  }

  function reintentar() {
    setEstado("idle")
  }

  return {
    seleccionados,
    toggleIntegrante,
    nuevos,
    agregarNuevo,
    quitarNuevo,
    nombreNuevo,
    setNombreNuevo,
    apellidoNuevo,
    setApellidoNuevo,
    restriccionAlimentaria,
    setRestriccionAlimentaria,
    estado,
    mensaje,
    confirmar,
    reintentar,
    totalActual,
    llegoAlTope,
  }
}
