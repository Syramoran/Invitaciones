import { Loader2, Check, AlertCircle, Minus, Plus, X } from 'lucide-react'
import type { InvitacionPublica } from '@/types/invitation'
import { useRsvpConfirmacion } from '../shared/useRsvpConfirmacion'
import { useRsvpConfirmacionGrupo } from '../shared/useRsvpConfirmacionGrupo'
import { COLOR, TYPO } from './theme'

interface RsvpSectionProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

const INPUT_CLASS = 'w-full rounded-sm px-4 py-3 outline-none bg-[#E9E5E2] shadow-sm'
const INPUT_DISABLED_CLASS = `${INPUT_CLASS} opacity-70 cursor-not-allowed`
const TEXTAREA_CLASS = 'w-full resize-none rounded-xl px-4 py-3 outline-none bg-[#E9E5E2] shadow-sm'
const BOTON_CLASS = 'rounded-sm px-12 py-4 transition-opacity hover:opacity-85 cursor-pointer disabled:opacity-50'

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

function EstadoError({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <p style={{ ...TYPO.text, color: COLOR.brown }}>{mensaje}</p>
      <button
        type="button"
        onClick={onReintentar}
        className="underline"
        style={{ ...TYPO.text, color: COLOR.brown }}
      >
        Intentar de nuevo
      </button>
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

  if (estado === 'error') {
    return (
      <section className="flex flex-col items-center px-7 py-16 text-center">
        <EstadoError mensaje={mensaje} onReintentar={reintentar} />
      </section>
    )
  }

  if (confirmado) {
    return (
      <section className="flex flex-col items-center px-7 py-16 text-center">
        <EstadoConfirmado />
      </section>
    )
  }

  const cantidad = agregarPlusOne ? 2 : 1

  return (
    <section className="flex flex-col items-center gap-14 px-7 py-16 text-center">
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
                    className={INPUT_CLASS}
                    style={{ ...TYPO.text, color: COLOR.darkBrown }}
                  />
                  <input
                    value={plusOneApellido}
                    onChange={(e) => setPlusOneApellido(e.target.value)}
                    placeholder="Apellido"
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
          className={TEXTAREA_CLASS}
          style={{ ...TYPO.text, color: COLOR.darkBrown }}
        />
      </div>

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

      <NombreCoupla />
    </section>
  )
}

interface RsvpGrupoProps {
  invitacionId: string
  grupo: NonNullable<InvitacionPublica['grupo']>
}

function RsvpGrupo({ invitacionId, grupo }: RsvpGrupoProps) {
  const {
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
    llegoAlTope,
  } = useRsvpConfirmacionGrupo({ invitacionId, grupo })

  const yaConfirmado = grupo.integrantes.some((i) => i.confirmado) || estado === 'success'

  if (estado === 'error') {
    return (
      <section className="flex flex-col items-center px-7 py-16 text-center">
        <EstadoError mensaje={mensaje} onReintentar={reintentar} />
      </section>
    )
  }

  if (yaConfirmado) {
    return (
      <section className="flex flex-col items-center px-7 py-16 text-center">
        <EstadoConfirmado />
      </section>
    )
  }

  return (
    <section className="flex flex-col items-center gap-14 px-7 py-16 text-center">
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

        {nuevos.map((integrante, i) => (
          <div
            key={i}
            className="flex w-full items-center justify-between gap-3 rounded-sm px-4 py-3 text-left bg-[#E9E5E2] shadow-sm"
          >
            <span style={{ ...TYPO.text, color: COLOR.darkBrown }}>
              {integrante.nombre} {integrante.apellido}
            </span>
            <button
              type="button"
              onClick={() => quitarNuevo(i)}
              aria-label={`Quitar ${integrante.nombre}`}
              className="shrink-0 transition-opacity hover:opacity-60"
              style={{ color: COLOR.brown }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {!llegoAlTope && (
        <div className="flex w-full max-w-[20.75rem] flex-col items-start gap-3 text-left">
          <label style={{ ...TYPO.text2, color: COLOR.brown }}>Sumar a alguien más del grupo</label>
          <div className="flex w-full gap-3">
            <input
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              placeholder="Nombre"
              className={INPUT_CLASS}
              style={{ ...TYPO.text, color: COLOR.darkBrown }}
            />
            <input
              value={apellidoNuevo}
              onChange={(e) => setApellidoNuevo(e.target.value)}
              placeholder="Apellido"
              className={INPUT_CLASS}
              style={{ ...TYPO.text, color: COLOR.darkBrown }}
            />
          </div>
          <button
            type="button"
            onClick={agregarNuevo}
            disabled={!nombreNuevo.trim() || !apellidoNuevo.trim()}
            className="self-start transition-opacity hover:opacity-70 disabled:opacity-40"
            style={{ ...TYPO.text2, color: COLOR.darkBrown }}
          >
            + Agregar
          </button>
        </div>
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
          className={TEXTAREA_CLASS}
          style={{ ...TYPO.text, color: COLOR.darkBrown }}
        />
      </div>

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

      <NombreCoupla />
    </section>
  )
}

export function RsvpSection({ invitacion, invitadoParam }: RsvpSectionProps) {
  if (!invitacion.tieneConfirmacion) return null

  if (!invitacion.mostrarBotonConfirmar) {
    return (
      <section className="flex flex-col items-center px-7 py-16 text-center">
        <h2 style={{ ...TYPO.h2, color: COLOR.darkBrown }}>¡Te esperamos!</h2>
      </section>
    )
  }

  if (invitacion.grupo) {
    return <RsvpGrupo invitacionId={invitacion.id} grupo={invitacion.grupo} />
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
    />
  )
}
