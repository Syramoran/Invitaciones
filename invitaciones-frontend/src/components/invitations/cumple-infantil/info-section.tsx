import { Calendar, Clock, MapPin, StickyNote } from "lucide-react"
import type { InvitacionPublica, CamposEspecificosCumple } from "@/types/invitation"

interface InfoSectionProps {
  invitacion: InvitacionPublica
  accentColor: string
}

function formatFechaCompleta(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number)
  const fecha = new Date(y, m - 1, d)
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  return `${diasSemana[fecha.getDay()]} ${fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`
}

function formatHora(horaEvento: string): string {
  const [h, m] = horaEvento.split(":").map(Number)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function InfoSection({ invitacion, accentColor }: InfoSectionProps) {
  const { fechaEvento, horaEvento, ubicacion, direccion, camposEspecificos, titulo } = invitacion
  const campos = (camposEspecificos ?? {}) as CamposEspecificosCumple

  const generarLinkCalendario = () => {
    const [year, month, day] = fechaEvento.split("T")[0].split("-").map(Number)
    const [hora, minuto] = horaEvento.split(":").map(Number)
    const inicio = new Date(year, month - 1, day, hora, minuto, 0, 0)
    const fin = new Date(inicio)
    fin.setHours(fin.getHours() + 4)
    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, "")
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: titulo,
      dates: `${fmt(inicio)}/${fmt(fin)}`,
      details: `Invitación: ${titulo}`,
      location: `${ubicacion}, ${direccion}`,
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  const iconStyle: React.CSSProperties = { color: accentColor }

  return (
    <section className="flex flex-col items-center px-12 pt-6 pb-6 gap-5">
      <p className="text-lg text-[#787878]" style={{ fontFamily: "'Nunito', sans-serif" }}>
        Información
      </p>

      <div className="flex flex-col gap-6 w-full pr-6">
        <div className="flex items-start gap-4">
          <Calendar className="h-6 w-6 shrink-0 mt-0.5" style={iconStyle} />
          <div className="flex flex-col gap-1">
            <p className="text-base text-[#787878]" style={{ fontFamily: "'Nunito', sans-serif" }}>Fecha</p>
            <p className="text-[17px] font-medium text-[#1a1a1a]" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {formatFechaCompleta(fechaEvento)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Clock className="h-6 w-6 shrink-0 mt-0.5" style={iconStyle} />
          <div className="flex flex-col gap-1">
            <p className="text-base text-[#787878]" style={{ fontFamily: "'Nunito', sans-serif" }}>Hora</p>
            <p className="text-[17px] font-medium text-[#1a1a1a]" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {formatHora(horaEvento)} hs
            </p>
            <a
              href={generarLinkCalendario()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block rounded-3xl border px-4 py-1.5 text-base text-[#555] transition-colors"
              style={{ fontFamily: "'Nunito', sans-serif", borderColor: accentColor, backgroundColor: "#fcf8f0" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e3ded6")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fcf8f0")}
            >
              Agendar en calendario
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <MapPin className="h-6 w-6 shrink-0 mt-0.5" style={iconStyle} />
          <div className="flex flex-col gap-0.5">
            <p className="text-base text-[#787878]" style={{ fontFamily: "'Nunito', sans-serif" }}>Lugar</p>
            <p className="text-[17px] font-medium text-[#1a1a1a]" style={{ fontFamily: "'Nunito', sans-serif" }}>{ubicacion}</p>
            <p className="text-base text-[#787878]" style={{ fontFamily: "'Nunito', sans-serif" }}>{direccion}</p>
          </div>
        </div>

        {campos.notas && (
          <div className="flex items-start gap-4">
            <StickyNote className="h-6 w-6 shrink-0 mt-0.5" style={iconStyle} />
            <div className="flex flex-col gap-1">
              <p className="text-base text-[#787878]" style={{ fontFamily: "'Nunito', sans-serif" }}>Notas</p>
              <p className="text-[17px] font-medium text-[#1a1a1a]" style={{ fontFamily: "'Nunito', sans-serif" }}>{campos.notas}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
