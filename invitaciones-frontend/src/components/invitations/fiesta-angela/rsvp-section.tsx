import { useState } from 'react'
import { Loader2, Check, AlertCircle, Minus, Plus } from 'lucide-react'
import type { InvitacionPublica } from '@/types/invitation'
import { useRsvpConfirmacion } from '../shared/useRsvpConfirmacion'
import { useRsvpConfirmacionGrupo } from '../shared/useRsvpConfirmacionGrupo'
import { COLOR, TYPO } from './theme'
import { haPasadoFechaLimite, obtenerFechaLimiteStr } from './fecha-limite-section'

interface RsvpSectionProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

const INPUT_CLASS = 'w-full rounded-sm px-4 py-3 outline-none bg-[#E9E5E2] shadow-sm'
const INPUT_DISABLED_CLASS = `${INPUT_CLASS} opacity-70 cursor-not-allowed`
const TEXTAREA_CLASS = 'w-full resize-none rounded-xl px-4 py-3 outline-none bg-[#E9E5E2] shadow-sm'
const BOTON_CLASS = 'rounded-sm px-12 py-4 transition-opacity hover:opacity-85 cursor-pointer disabled:opacity-50'

// Mismos límites que valida el backend (ConfirmarAsistenciaDto / ConfirmarGrupoDto)
const MAX_NOMBRE = 100
const MAX_RESTRICCION = 500

function ContadorCaracteres({ actual, max }: { actual: number; max: number }) {
  return (
    <span className="self-end text-xs" style={{ color: COLOR.brown }}>
      {actual}/{max}
    </span>
  )
}

function NombreCoupla() {
  return (
    <h1 className="mt-8" style={{ ...TYPO.h1, color: COLOR.negro }}>
      Angie y Fran
    </h1>
  )
}

function EstadoConfirmado() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <Check className="h-7 w-7 text-green-600" />
      </div>
      <h2 style={{ ...TYPO.h2, color: COLOR.darkBrown }}>¡Confirmado!</h2>
    </div>
  )
}

function DespedidaConfirmado() {
  return (
    <>
      <EstadoConfirmado />
      <h2 style={{ ...TYPO.h3, color: COLOR.darkBrown }}>Te esperamos</h2>
      <NombreCoupla />
    </>
  )
}

function CierreTeEsperamos() {
  return (
    <>
      <h2 style={{ ...TYPO.h3, color: COLOR.darkBrown }}>Te esperamos</h2>
      <NombreCoupla />
    </>
  )
}

function DespedidaVencido() {
  return (
    <>
      <h2 style={{ ...TYPO.h3, color: COLOR.darkBrown }}>Ya no se puede confirmar tu asistencia</h2>
      <NombreCoupla />
    </>
  )
}

/**
 * Popup de error de confirmación. A diferencia del resto de los estados
 * (confirmado, vencido), este es transitorio: se superpone sobre el
 * formulario en vez de reemplazarlo, para no perder lo que el invitado ya
 * tipeó — "Cerrar" solo oculta el popup y vuelve a dejar ver el formulario
 * tal cual estaba.
 */
function ErrorPopup({ mensaje, onCerrar }: { mensaje: string; onCerrar: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className="flex w-full max-w-[22rem] flex-col items-center gap-4 rounded-lg px-6 py-8 text-center shadow-lg"
        style={{ backgroundColor: COLOR.crema }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <p style={{ ...TYPO.text, color: COLOR.brown }}>{mensaje}</p>
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-sm px-8 py-3 transition-opacity hover:opacity-85 cursor-pointer"
          style={{ ...TYPO.text, backgroundColor: COLOR.darkBrown, color: COLOR.crema }}
        >
          Entendido
        </button>
      </div>
    </div>
  )
}

interface RsvpIndividualProps {
  invitacionId: string
  invitadoSlug: string
  invitadoNombre: string | null
  invitadoApellido: string | null
  puedeAgregarPlusOne: boolean
  yaConfirmado: boolean
  restriccionAlimentariaExistente: string | null
  plusOneExistente: { nombre: string; apellido: string } | null
  deadlinePassed: boolean
}

function RsvpIndividual({
  invitacionId,
  invitadoSlug,
  invitadoNombre,
  invitadoApellido,
  puedeAgregarPlusOne,
  yaConfirmado,
  restriccionAlimentariaExistente,
  plusOneExistente,
  deadlinePassed,
}: RsvpIndividualProps) {
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
    errorPlusOne,
    confirmar,
    reintentar,
  } = useRsvpConfirmacion({
    invitacionId,
    invitadoSlug,
    puedeAgregarPlusOne,
    yaConfirmado,
    restriccionAlimentariaExistente,
    plusOneExistente,
  })

  if (confirmado) {
    return (
      <section className="flex flex-col items-center gap-14 px-7 py-16 text-center">
        <DespedidaConfirmado />
      </section>
    )
  }

  if (deadlinePassed) {
    return (
      <section className="flex flex-col items-center gap-14 px-7 py-16 text-center">
        <DespedidaVencido />
      </section>
    )
  }

  const cantidad = agregarPlusOne ? 2 : 1

  return (
    <section className="flex flex-col items-center gap-14 px-7 py-16 text-center">
      {estado === 'error' && <ErrorPopup mensaje={mensaje} onCerrar={reintentar} />}
      <div className="flex flex-col items-center gap-16">
        <h2 style={{ ...TYPO.h2, color: COLOR.darkBrown }}>¿Nos acompañás?</h2>

        {puedeAgregarPlusOne && (
          <h3 className="max-w-[280px]" style={{ ...TYPO.h4, color: COLOR.darkBrown }}>
            Selecciona la cantidad de invitados que van a asistir
          </h3>
        )}
      </div>

      {puedeAgregarPlusOne && (
        <>
          <div className="flex items-center justify-center gap-10">
            <button
              type="button"
              onClick={() => setAgregarPlusOne(false)}
              disabled={!agregarPlusOne}
              aria-label="Restar invitado"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-opacity disabled:opacity-40"
              style={{ backgroundColor: COLOR.crema, color: COLOR.darkBrown }}
            >
              <Minus className="h-6 w-6" strokeWidth={1.5} />
            </button>

            <span
              className="inline-block min-w-[3rem] text-center"
              style={{ ...TYPO.numero, fontSize: 90, lineHeight: 1, color: COLOR.brown }}
            >
              {cantidad}
            </span>

            <button
              type="button"
              onClick={() => setAgregarPlusOne(true)}
              disabled={agregarPlusOne}
              aria-label="Sumar invitado"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-opacity disabled:opacity-40"
              style={{ backgroundColor: COLOR.crema, color: COLOR.darkBrown }}
            >
              <Plus className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>

          {agregarPlusOne && (
            <>
              {(invitadoNombre || invitadoApellido) && (
                <div className="flex w-full max-w-[20.75rem] flex-col items-start gap-3 text-left">
                  <label style={{ ...TYPO.text2, color: COLOR.brown }}>Invitado 1</label>
                  <div className="flex w-full gap-3">
                    <input
                      value={invitadoNombre ?? ''}
                      disabled
                      className={INPUT_DISABLED_CLASS}
                      style={{ ...TYPO.text, color: COLOR.darkBrown }}
                    />
                    <input
                      value={invitadoApellido ?? ''}
                      disabled
                      className={INPUT_DISABLED_CLASS}
                      style={{ ...TYPO.text, color: COLOR.darkBrown }}
                    />
                  </div>
                </div>
              )}

              <div className="flex w-full max-w-[20.75rem] flex-col items-start gap-3 text-left">
                <label style={{ ...TYPO.text2, color: COLOR.brown }}>Invitado 2</label>
                <div className="flex w-full gap-3">
                  <input
                    value={plusOneNombre}
                    onChange={(e) => setPlusOneNombre(e.target.value)}
                    placeholder="Nombre"
                    maxLength={MAX_NOMBRE}
                    className={INPUT_CLASS}
                    style={{ ...TYPO.text, color: COLOR.darkBrown }}
                  />
                  <input
                    value={plusOneApellido}
                    onChange={(e) => setPlusOneApellido(e.target.value)}
                    placeholder="Apellido"
                    maxLength={MAX_NOMBRE}
                    className={INPUT_CLASS}
                    style={{ ...TYPO.text, color: COLOR.darkBrown }}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}

      <div className="flex w-full max-w-[20.75rem] flex-col items-start gap-3 text-left">
        <label style={{ ...TYPO.text2, color: COLOR.brown }}>
          ¿Tenés/tienen alguna restricción alimentaria?
        </label>
        <textarea
          value={restriccionAlimentaria}
          onChange={(e) => setRestriccionAlimentaria(e.target.value)}
          placeholder="Explicalo acá"
          rows={2}
          maxLength={MAX_RESTRICCION}
          className={TEXTAREA_CLASS}
          style={{ ...TYPO.text, color: COLOR.darkBrown }}
        />
        <ContadorCaracteres actual={restriccionAlimentaria.length} max={MAX_RESTRICCION} />
      </div>

      {errorPlusOne && (
        <p className="max-w-[20.75rem] text-sm text-red-600">{errorPlusOne}</p>
      )}

      <button
        type="button"
        onClick={confirmar}
        disabled={estado === 'loading'}
        className={BOTON_CLASS}
        style={{ ...TYPO.text, backgroundColor: COLOR.crema, color: COLOR.negro }}
      >
        {estado === 'loading' ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirmando...
          </span>
        ) : (
          'Confirmar asistencia'
        )}
      </button>

      <CierreTeEsperamos />
    </section>
  )
}

interface RsvpGrupoProps {
  invitacionId: string
  grupo: NonNullable<InvitacionPublica['grupo']>
  deadlinePassed: boolean
}

function RsvpGrupo({ invitacionId, grupo, deadlinePassed }: RsvpGrupoProps) {
  const {
    seleccionados,
    toggleIntegrante,
    restriccionAlimentaria,
    setRestriccionAlimentaria,
    estado,
    mensaje,
    confirmar,
    reintentar,
  } = useRsvpConfirmacionGrupo({ invitacionId, grupo })

  // Sin al menos un integrante marcado, el backend acepta el envío y responde
  // "confirmado" sin registrar a nadie — el grupo se quedaría afuera creyendo
  // que confirmó. Se corta acá antes de mandarlo.
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const sinSeleccion = seleccionados.size === 0
  const errorSeleccion =
    intentoEnviar && sinSeleccion ? 'Marcá al menos una persona para poder confirmar.' : null

  const intentarConfirmar = () => {
    setIntentoEnviar(true)
    if (sinSeleccion) return
    confirmar()
  }

  const yaConfirmado = grupo.integrantes.some((i) => i.confirmado) || estado === 'success'

  if (yaConfirmado) {
    return (
      <section className="flex flex-col items-center gap-14 px-7 py-16 text-center">
        <DespedidaConfirmado />
      </section>
    )
  }

  if (deadlinePassed) {
    return (
      <section className="flex flex-col items-center gap-14 px-7 py-16 text-center">
        <DespedidaVencido />
      </section>
    )
  }

  return (
    <section className="flex flex-col items-center gap-14 px-7 py-16 text-center">
      {estado === 'error' && <ErrorPopup mensaje={mensaje} onCerrar={reintentar} />}
      <div className="flex flex-col items-center gap-16">
        <h2 style={{ ...TYPO.h2, color: COLOR.darkBrown }}>¿Nos acompañás?</h2>
        <h3 className="max-w-[280px]" style={{ ...TYPO.h4, color: COLOR.darkBrown }}>
          Marcá quiénes de tu grupo van a asistir
        </h3>
      </div>

      <div className="flex w-full max-w-[20.75rem] flex-col gap-3">
        {grupo.integrantes.map((integrante) => (
          <label
            key={integrante.id}
            className="flex w-full cursor-pointer items-center gap-3 rounded-sm px-4 py-3 text-left bg-[#E9E5E2] shadow-sm"
          >
            <input
              type="checkbox"
              checked={seleccionados.has(integrante.id)}
              onChange={() => toggleIntegrante(integrante.id)}
              className="h-4 w-4 shrink-0"
              style={{ accentColor: COLOR.darkBrown }}
            />
            <span style={{ ...TYPO.text, color: COLOR.darkBrown }}>
              {integrante.nombre} {integrante.apellido}
            </span>
          </label>
        ))}
      </div>

      <div className="flex w-full max-w-[20.75rem] flex-col items-start gap-3 text-left">
        <label style={{ ...TYPO.text2, color: COLOR.brown }}>
          ¿Tenés/tienen alguna restricción alimentaria?
        </label>
        <textarea
          value={restriccionAlimentaria}
          onChange={(e) => setRestriccionAlimentaria(e.target.value)}
          placeholder="Explicalo acá"
          rows={2}
          maxLength={MAX_RESTRICCION}
          className={TEXTAREA_CLASS}
          style={{ ...TYPO.text, color: COLOR.darkBrown }}
        />
        <ContadorCaracteres actual={restriccionAlimentaria.length} max={MAX_RESTRICCION} />
      </div>

      {errorSeleccion && (
        <p className="max-w-[20.75rem] text-sm text-red-600">{errorSeleccion}</p>
      )}

      <button
        type="button"
        onClick={intentarConfirmar}
        disabled={estado === 'loading'}
        className={BOTON_CLASS}
        style={{ ...TYPO.text, backgroundColor: COLOR.crema, color: COLOR.negro }}
      >
        {estado === 'loading' ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirmando...
          </span>
        ) : (
          'Confirmar asistencia'
        )}
      </button>

      <CierreTeEsperamos />
    </section>
  )
}

export function RsvpSection({ invitacion, invitadoParam }: RsvpSectionProps) {
  if (!invitacion.tieneConfirmacion) return null

  if (!invitacion.mostrarBotonConfirmar) {
    return (
      <section className="flex flex-col items-center gap-14 px-7 py-16 text-center">
        <h2 style={{ ...TYPO.h2, color: COLOR.darkBrown }}>¡Te esperamos!</h2>
        <NombreCoupla />
      </section>
    )
  }

  const deadlinePassed = haPasadoFechaLimite(obtenerFechaLimiteStr(invitacion))

  if (invitacion.grupo) {
    return <RsvpGrupo invitacionId={invitacion.id} grupo={invitacion.grupo} deadlinePassed={deadlinePassed} />
  }

  return (
    <RsvpIndividual
      invitacionId={invitacion.id}
      invitadoSlug={invitadoParam ?? ''}
      invitadoNombre={invitacion.invitadoNombre ?? null}
      invitadoApellido={invitacion.invitadoApellido ?? null}
      puedeAgregarPlusOne={invitacion.puedeAgregarPlusOne ?? false}
      yaConfirmado={invitacion.yaConfirmado ?? false}
      restriccionAlimentariaExistente={invitacion.restriccionAlimentariaExistente ?? null}
      plusOneExistente={invitacion.plusOneExistente ?? null}
      deadlinePassed={deadlinePassed}
    />
  )
}
