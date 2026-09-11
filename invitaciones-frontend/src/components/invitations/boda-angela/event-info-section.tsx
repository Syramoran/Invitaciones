import type { InvitacionPublica } from "@/types/invitation"
import { COLOR, TYPO } from "./theme"

interface EventInfoSectionProps {
  invitacion: InvitacionPublica
}

function formatDiaMes(fechaISO: string): { diaSemana: string; dia: string; mes: string } {
  const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number)
  const fecha = new Date(y, m - 1, d)
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
  return { diaSemana: diasSemana[fecha.getDay()], dia: String(d), mes: meses[m - 1] }
}

export function EventInfoSection({ invitacion }: EventInfoSectionProps) {
  const { fechaEvento, horaEvento, titulo, ubicacion, direccion } = invitacion
  const { diaSemana, dia, mes } = formatDiaMes(fechaEvento)
  const esMultiple = ubicacion === "multiple"

  const generarLinkCalendario = () => {
    const [year, month, day] = fechaEvento.split("T")[0].split("-").map(Number)
    const [hora, minuto] = horaEvento.split(":").map(Number)
    const inicio = new Date(year, month - 1, day, hora, minuto, 0, 0)
    const fin = new Date(inicio)
    fin.setHours(fin.getHours() + 5)
    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, "")
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: titulo,
      dates: `${fmt(inicio)}/${fmt(fin)}`,
      details: `Invitación: ${titulo}`,
      location: esMultiple ? "" : `${ubicacion}, ${direccion}`,
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  return (
    <section className="flex flex-col items-center gap-16 px-7 pt-20 pb-10 text-center">
      <h2
        style={{ ...TYPO.h2, color: COLOR.brown, lineHeight: 1.4 }}
      >
        Te esperamos<br />para celebrar<br />nuestra boda
      </h2>

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 uppercase">
          <span style={{ ...TYPO.detailsH, color: COLOR.darkBrown, fontSize: 24 }}>{diaSemana}</span>
          <span style={{ ...TYPO.numero, fontSize: 64, color: COLOR.brown, lineHeight: 1 }}>{dia}</span>
          <span style={{ ...TYPO.detailsH, color: COLOR.darkBrown, fontSize: 24 }}>{mes}</span>
        </div>
        <div className="h-px w-[11.5rem]" style={{ backgroundColor: `${COLOR.brown}66` }} />
        <p
          style={{ ...TYPO.horarios, color: COLOR.darkBrown, letterSpacing: '0.3em', textTransform: 'uppercase' }}
        >
          {horaEvento} hs
        </p>
      </div>

      <a
        href={generarLinkCalendario()}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-[4px] px-4 py-3 transition-opacity hover:opacity-85"
        style={{ ...TYPO.text, backgroundColor: COLOR.crema, color: COLOR.negro }}
      >
        Agendar en calendario
      </a>
    </section>
  )
}
