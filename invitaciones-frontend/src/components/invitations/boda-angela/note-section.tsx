import type { InvitacionPublica } from "@/types/invitation"
import { COLOR, TYPO } from "./theme"

interface CamposNota {
  soloAdultos?: string
  reglaPuntualidad?: string
}

interface NoteSectionProps {
  invitacion: InvitacionPublica
}

export function NoteSection({ invitacion }: NoteSectionProps) {
  const campos = (invitacion.camposEspecificos ?? {}) as CamposNota
  const soloAdultos = String(campos.soloAdultos) !== "false"
  const puntualidad = String(campos.reglaPuntualidad) !== "false"

  if (!soloAdultos && !puntualidad) return null

  return (
    <section className="flex flex-col items-center gap-16 px-16 py-24">
      <h2
        style={{ ...TYPO.h2, color: COLOR.darkBrown }}
      >
        Nota especial
      </h2>

      <div className="flex flex-col items-center gap-16">
        {soloAdultos && (
          <p
            className="text-center"
            style={{ ...TYPO.text2, color: COLOR.darkBrown }}
          >
            Será una celebración exclusiva para adultos
          </p>
        )}
        {soloAdultos && puntualidad && <div className="h-px w-[10rem]" style={{ backgroundColor: `${COLOR.darkBrown}66` }} />}
        {puntualidad && (
          <p
            className="text-center"
            style={{ ...TYPO.text2, color: COLOR.darkBrown }}
          >
            Se ruega puntualidad
          </p>
        )}
      </div>
    </section>
  )
}
