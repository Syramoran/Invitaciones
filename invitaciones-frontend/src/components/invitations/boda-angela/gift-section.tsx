import type { InvitacionPublica } from "@/types/invitation"
import { COLOR, TYPO } from "./theme"

interface GiftSectionProps {
  invitacion: InvitacionPublica
}

interface CamposGift {
  alias?: string
  cbu?: string
  cvu?: string
}

export function GiftSection({ invitacion }: GiftSectionProps) {
  const campos = (invitacion.camposEspecificos ?? {}) as CamposGift
  const alias = campos.alias
  const cbu = campos.cbu || campos.cvu

  return (
    <section className="flex flex-col items-center gap-16 px-7 py-24">
      <h2
        style={{ ...TYPO.h2, color: COLOR.brown }}
      >
        Mesa de regalos
      </h2>

      <div className="flex flex-col items-center gap-10 text-center">
        <p
          style={{ ...TYPO.text, color: COLOR.brown }}
        >
          Tu presencia es nuestro más valioso regalo
        </p>
        {(alias || cbu) && (
          <p
            className="max-w-[18.6rem]"
            style={{ ...TYPO.text, color: COLOR.brown }}
          >
            Si además quisieras hacernos otro regalo te dejamos esta manera de hacerlo
          </p>
        )}
      </div>

      {(alias || cbu) && (
        <div className="flex flex-col items-center gap-6">
          <p
            style={{ ...TYPO.h3, color: COLOR.brown }}
          >
            Info de cuenta
          </p>
          <div
            className="text-center"
            style={{ ...TYPO.text, color: COLOR.negro }}
          >
            {alias && <p>Alias: {alias}</p>}
            {cbu && <p>CBU: {cbu}</p>}
          </div>
        </div>
      )}

      <img src="/boda-angela/icon-heart.svg" alt="" aria-hidden="true" className="h-[1.6rem] w-[1.7rem]" />
    </section>
  )
}
