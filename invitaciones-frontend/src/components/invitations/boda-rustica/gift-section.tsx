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
}

export function GiftSection({ invitacion }: GiftSectionProps) {
  const campos = (invitacion.camposEspecificos ?? {}) as CamposGift

  const alias = campos.alias
  const cbu = campos.cbu || campos.cvu
  const infoAdicional = campos.infoAdicional
  const mostrarSobres = String(campos.mostrarLluviaSobres) !== "false"
  const mostrarRegalos = String(campos.mostrarMesaRegalos) !== "false"

  const tieneDatos = alias || cbu || mostrarSobres || mostrarRegalos

  if (!tieneDatos) return null

  return (
    <>
      {/* Mesa de regalos */}
      <section
        className="relative w-full flex flex-col items-center py-12 px-7 gap-8 bg-cover bg-no-repeat bg-top text-center"
        style={{ backgroundImage: "url('/boda-rustica/fondo-historia.png')" }}
      >
        <div className="absolute inset-0 bg-white/80" />
        <div className="relative z-10 w-full flex flex-col items-center gap-8">
        {/* Título */}
        <h2
          className="text-[3rem] font-semibold text-[#333]"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Mesa de regalos
        </h2>

        {/* Subtítulo */}
        <div
          className="flex flex-col items-center gap-4 text-lg text-[#787878]"
          style={{ fontFamily: "Quicksand, sans-serif" }}
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
              src="/boda-rustica/vectores/Sobres-B2-vector.svg"
              alt="Lluvia de sobres"
              className="w-[5.344rem] h-[4.625rem] drop-shadow-md"
            />
            <div className="rounded-[29px] flex items-center justify-center py-4 px-8">
              <h3
                className="text-[1.5rem] font-semibold text-[#333]"
                style={{ fontFamily: "'Dancing Script', cursive" }}
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
              src="/boda-rustica/vectores/Cuenta-B2-vector.svg"
              alt="Info de cuenta"
              className="w-[3.5rem] h-[2.5rem]"
            />
            <div className="flex flex-col items-center py-4">
              <h3
                className="text-[1.5rem] font-semibold text-[#333]"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Info de cuenta
              </h3>

              <div
                className="mt-4 text-left text-base text-[#787878]"
                style={{ fontFamily: "Quicksand, sans-serif" }}
              >
                {alias && <p>Alias: {alias}</p>}
                {cbu && <p>CBU: {cbu}</p>}
              </div>
            </div>
          </div>
        )}
        </div>
      </section>

      {/* Nota especial / Información adicional — fondo verde */}
      {infoAdicional && (
        <section
          className="w-full flex flex-col items-center pt-10 px-16 pb-12 gap-8 text-center"
          style={{ backgroundColor: "var(--invitation-primary)", fontFamily: "Quicksand, sans-serif" }}
        >
          {/* Divider */}
          <div className="w-[17.813rem] h-[2px] rounded-md bg-white/30" />

          <p className="text-base text-[#e1e1e1]">Nota especial</p>

          <p className="self-stretch text-[1.25rem] font-medium text-white">
            {infoAdicional}
          </p>
        </section>
      )}
    </>
  )
}
