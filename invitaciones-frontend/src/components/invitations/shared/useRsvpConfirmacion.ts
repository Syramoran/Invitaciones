import { useState } from 'react'
import { confirmarAsistencia } from '@/services/invitacionService'

export type EstadoRsvp = 'idle' | 'loading' | 'success' | 'error'

interface UseRsvpConfirmacionParams {
  invitacionId: string
  invitadoSlug: string
  puedeAgregarPlusOne: boolean
  yaConfirmado: boolean
  restriccionAlimentariaExistente: string | null
  plusOneExistente: { nombre: string; apellido: string } | null
}

/**
 * Hook reutilizable para el flujo de confirmación de un invitado individual
 * (titular). Soporta re-envíos: el backend es idempotente y actualiza en vez
 * de duplicar, así que el mismo formulario sirve para confirmar por primera
 * vez o para editar (sumar/cambiar plus-one, cambiar restricción) después.
 */
export function useRsvpConfirmacion({
  invitacionId,
  invitadoSlug,
  puedeAgregarPlusOne,
  yaConfirmado,
  restriccionAlimentariaExistente,
  plusOneExistente,
}: UseRsvpConfirmacionParams) {
  const [estado, setEstado] = useState<EstadoRsvp>('idle')
  const [mensaje, setMensaje] = useState('')
  const [confirmado, setConfirmado] = useState(yaConfirmado)

  const [agregarPlusOne, setAgregarPlusOne] = useState(!!plusOneExistente)
  const [plusOneNombre, setPlusOneNombre] = useState(plusOneExistente?.nombre ?? '')
  const [plusOneApellido, setPlusOneApellido] = useState(plusOneExistente?.apellido ?? '')
  const [restriccionAlimentaria, setRestriccionAlimentaria] = useState(
    restriccionAlimentariaExistente ?? '',
  )

  async function confirmar() {
    setEstado('loading')
    try {
      const incluirPlusOne =
        puedeAgregarPlusOne && agregarPlusOne && plusOneNombre.trim() && plusOneApellido.trim()

      const response = await confirmarAsistencia(invitacionId, {
        invitadoSlug,
        restriccionAlimentaria: restriccionAlimentaria.trim() || undefined,
        plusOne: incluirPlusOne
          ? { nombre: plusOneNombre.trim(), apellido: plusOneApellido.trim() }
          : undefined,
      })
      setEstado('success')
      setConfirmado(true)
      setMensaje(response.mensaje || '¡Gracias por confirmar tu asistencia!')
    } catch {
      setEstado('error')
      setMensaje('No se pudo registrar tu confirmación. Intentá de nuevo.')
    }
  }

  function reintentar() {
    setEstado('idle')
  }

  return {
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
  }
}
