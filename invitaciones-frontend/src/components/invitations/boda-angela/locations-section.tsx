import type { InvitacionPublica, CamposEspecificosBoda } from "@/types/invitation"
import { COLOR, TYPO } from "./theme"

interface CamposAngela extends Partial<CamposEspecificosBoda> {
  nombreLugar?: string
  fotoLugar?: string
  horaCivil?: string
  notaCelebracion?: string
}

interface LocationsSectionProps {
  invitacion: InvitacionPublica
}

export function LocationsSection({ invitacion }: LocationsSectionProps) {
  const { ubicacion, direccion, camposEspecificos } = invitacion
  const campos = (camposEspecificos ?? {}) as CamposAngela
  const esMultiple = ubicacion === "multiple"

  const nombreLugar = campos.nombreLugar || (esMultiple ? "" : ubicacion)
  const direccionLugar = esMultiple ? "" : direccion
  const fotoLugar = campos.fotoLugar || "/boda-angela/villa-elina.png"

  return (
    <section className="flex flex-col items-center gap-24 px-7 pt-20 pb-10">
      {/* Lugar principal */}
      {nombreLugar && (
        <div className="flex flex-col items-center gap-6">
          <div className="h-[13.5rem] w-full max-w-[19.5rem] overflow-hidden rounded-sm">
            <img src={fotoLugar} alt={nombreLugar} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <h1
            className="leading-none text-center"
            style={{ ...TYPO.h1, fontSize: 54, color: COLOR.brown }}
          >
            {nombreLugar}
          </h1>
          {direccionLugar && (
            <p
              className="max-w-[19rem] text-center"
              style={{ ...TYPO.h3, color: COLOR.brown }}
            >
              {direccionLugar}
            </p>
          )}
        </div>
      )}

      {/* Civil */}
      {campos.horaCivil && (
        <div className="flex flex-col items-center gap-6 w-full">
          <img src="/boda-angela/icon-civil.svg" alt="Civil" className="h-[5.2rem] w-[5.5rem]" loading="lazy" />
          <h1
            className="leading-none text-center"
            style={{ ...TYPO.h1, fontSize: 54, color: COLOR.brown }}
          >
            Civil
          </h1>
          <p
            className="text-center"
            style={{ ...TYPO.h3, color: COLOR.brown }}
          >
            {campos.horaCivil} hs
          </p>
        </div>
      )}

      {/* Celebración */}
      {campos.notaCelebracion && (
        <div className="flex flex-col items-center gap-6 w-full">
          <img src="/boda-angela/icon-celebracion.svg" alt="Celebración" className="h-[13.75rem] w-[11.4rem]" loading="lazy" />
          <h1
            className="leading-none text-center"
            style={{ ...TYPO.h1, fontSize: 54, color: COLOR.brown }}
          >
            Celebración
          </h1>
          <p
            className="text-center"
            style={{ ...TYPO.h3, color: COLOR.brown }}
          >
            {campos.notaCelebracion}
          </p>
        </div>
      )}
    </section>
  )
}
