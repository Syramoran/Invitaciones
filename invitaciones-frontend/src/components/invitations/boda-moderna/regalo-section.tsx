import type { InvitacionPublica } from "@/types/invitation"

const FONT_SCRIPT = "'Pinyon Script', cursive"
const FONT_BODY = "Montserrat, sans-serif"

interface CamposGift {
  alias?: string
  cbu?: string
  cvu?: string
  infoAdicional?: string
  mostrarMesaRegalos?: boolean | string
  mostrarLluviaSobres?: boolean | string
}

interface RegaloSectionProps {
  invitacion: InvitacionPublica
}

export function RegaloSection({ invitacion }: RegaloSectionProps) {
  const campos = (invitacion.camposEspecificos ?? {}) as CamposGift

  const alias = campos.alias
  const cbu = campos.cbu || campos.cvu
  const infoAdicional = campos.infoAdicional
  const mostrarRegalos = String(campos.mostrarMesaRegalos) !== "false"
  const mostrarSobres = String(campos.mostrarLluviaSobres) !== "false"

  const tieneDatos = alias || cbu || mostrarSobres || mostrarRegalos

  if (!tieneDatos) return null

  return (
    <>
      <section
        className="flex flex-col items-center px-7 py-12 gap-6 text-center"
        style={{ fontFamily: FONT_BODY }}
      >
        {/* Título */}
        <h2
          className="text-[2.8rem] font-medium"
          style={{
            fontFamily: FONT_SCRIPT,
            color: "var(--invitation-primary)",
          }}
        >
          Mesa de regalos
        </h2>

        {/* Subtítulos */}
        <div className="flex flex-col items-center gap-2 text-base text-[#787878]">
          <p>Tu presencia es nuestro más valioso regalo</p>
          {(alias || cbu) && (
            <p className="w-[18.5rem] text-center mx-auto">
              Si además quisieras hacernos otro regalo te dejamos estas maneras de hacerlo
            </p>
          )}
        </div>

        {/* Lluvia de sobres */}
        {mostrarSobres && (
          <div className="flex flex-col items-center gap-1">
            <img
              src="/boda-moderna/vectores/Sobres-B3-vector.svg"
              alt="Lluvia de sobres"
              className="w-[5.25rem] h-[4.588rem] drop-shadow-md"
            />
            <div className="flex items-center justify-center py-4 px-7">
              <h3
                className="text-[2rem] text-[#333]"
                style={{ fontFamily: FONT_SCRIPT }}
              >
                Lluvia de sobres
              </h3>
            </div>
          </div>
        )}

        {/* Info de cuenta */}
        {(alias || cbu) && (
          <div className="flex flex-col items-center gap-2">
            <img
              src="/boda-moderna/vectores/Cuenta-B3-vector.svg"
              alt="Info de cuenta"
              className="w-[3.519rem] h-[2.5rem] drop-shadow-md"
            />
            <div className="flex flex-col items-center py-4">
              <h3
                className="text-[2rem] text-[#333]"
                style={{ fontFamily: FONT_SCRIPT }}
              >
                Info de cuenta
              </h3>

              <div className="mt-4 text-left text-base text-[#787878]">
                {alias && <p>Alias: {alias}</p>}
                {cbu && <p>CBU: {cbu}</p>}
              </div>
            </div>
          </div>
        )}

      </section>

      {/* Información adicional */}
      {infoAdicional && (
        <section
          className="w-full flex flex-col items-center px-10 py-12 gap-6 text-center"
          style={{ fontFamily: FONT_BODY, backgroundColor: "var(--invitation-primary)" }}
        >
          <p className="text-base text-white/70">Información adicional</p>
          <p className="self-stretch text-center text-[1.25rem] text-white">
            {infoAdicional}
          </p>
        </section>
      )}
    </>
  )
}
