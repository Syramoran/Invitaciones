import { useState } from 'react'
import { confirmarAsistencia } from '@/services/invitacionService'
import { extraerMensajeError } from './apiError'

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
  const [intentoEnviar, setIntentoEnviar] = useState(false)

  // Si el invitado sube el contador a 2 pero deja el nombre/apellido del
  // acompañante vacíos, antes se enviaba igual y el plus-one se perdía en
  // silencio (confirmaba solo al titular sin avisar). Ahora se bloquea el
  // envío y se le pide completar los datos.
  const faltaPlusOne =
    puedeAgregarPlusOne && agregarPlusOne && (!plusOneNombre.trim() || !plusOneApellido.trim())
  const errorPlusOne =
    intentoEnviar && faltaPlusOne
      ? 'Completá el nombre y apellido de tu acompañante, o volvé el contador a 1.'
      : null

  async function confirmar() {
    setIntentoEnviar(true)
    if (faltaPlusOne) return

    setEstado('loading')
    try {
      const response = await confirmarAsistencia(invitacionId, {
        invitadoSlug,
        restriccionAlimentaria: restriccionAlimentaria.trim() || undefined,
        plusOne:
          puedeAgregarPlusOne && agregarPlusOne
            ? { nombre: plusOneNombre.trim(), apellido: plusOneApellido.trim() }
            : undefined,
      })
      setEstado('success')
      setConfirmado(true)
      setMensaje(response.mensaje || '¡Gracias por confirmar tu asistencia!')
    } catch (err) {
      setEstado('error')
      setMensaje(extraerMensajeError(err, 'No se pudo registrar tu confirmación. Intentá de nuevo.'))
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
    errorPlusOne,
    confirmar,
    reintentar,
  }
}
