import type { InvitacionPublica } from "@/types/invitation"

interface GiftSectionProps {
  invitacion: InvitacionPublica
}

interface CamposGift {
  alias?: string
  cbu?: string
  cvu?: string
  infoAdicional?: string
  mostrarMesaRegalos?: boolean
  mostrarLluviaSobres?: boolean
  fechaLimiteConfirmacion?: string
}

export function GiftSection({ invitacion }: GiftSectionProps) {
  const campos = (invitacion.camposEspecificos ?? {}) as CamposGift

  const alias = campos.alias
  const cbu = campos.cbu || campos.cvu
  const infoAdicional = campos.infoAdicional
  const mostrarRegalos = String(campos.mostrarMesaRegalos) !== 'false'
  const mostrarSobres = String(campos.mostrarLluviaSobres) !== 'false'

  const tieneDatos = alias || cbu || mostrarSobres || mostrarRegalos

  return (
    <>
      {/* Mesa de regalos */}
      {tieneDatos && (
        <section className="flex flex-col items-center px-7 py-12 gap-6 text-center">
          {/* Título */}
          <h2
            className="text-[2.5rem] font-medium italic"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: "var(--invitation-accent)",
            }}
          >
            Mesa de regalos
          </h2>

          {/* Subtítulo */}
          <div
            className="flex flex-col gap-2 text-base text-[#787878]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            <p>Tu presencia es nuestro más valioso regalo</p>
            {(alias || cbu) && (
              <p className="w-[18.5rem]">
                Si además quisieras hacernos otro regalo te dejamos estas maneras de hacerlo
              </p>
            )}
          </div>

          {/* Lluvia de sobres */}
          {mostrarSobres && (
            <div className="flex flex-col items-center gap-1">
              <img
                src="/boda-clasica/vectores/Sobres-B1-vector.svg"
                alt="Lluvia de sobres"
                className="w-[5.25rem] h-[4.588rem] drop-shadow-md"
              />
              <div className="rounded-[29px] flex items-center justify-center py-4 px-7">
                <h3
                  className="text-[1.5rem] font-semibold text-[#333]"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
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
                src="/boda-clasica/vectores/Cuenta-B1-vector.svg"
                alt="Info de cuenta"
                className="w-[3.519rem] h-[2.5rem] drop-shadow-md"
              />
              <h3
                className="text-[1.5rem] font-semibold text-[#333]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Info de cuenta
              </h3>

              <div
                className="text-left text-base text-[#787878]"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                {alias && <p>Alias: {alias}</p>}
                {cbu && <p>CBU: {cbu}</p>}
              </div>
            </div>
          )}

          {/* Información adicional */}
          {infoAdicional && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Divider arriba de información adicional */}
              <div className="w-[17.813rem] h-[2px] rounded-md mt-6" style={{ backgroundColor: "var(--invitation-primary)", opacity: 0.4 }} />
              <p
                className="text-base text-[#787878]"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                Información adicional
              </p>

              <p
                className="self-stretch text-center text-[1.25rem] text-[#333] px-4 break-normal"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                {infoAdicional}
              </p>
            </div>
          )}

          {/* Divider al final de la sección */}
          <div className="w-[17.813rem] h-[2px] rounded-md" style={{ backgroundColor: "var(--invitation-primary)", opacity: 0.4 }} />
        </section>
      )}
    </>
  )
}
