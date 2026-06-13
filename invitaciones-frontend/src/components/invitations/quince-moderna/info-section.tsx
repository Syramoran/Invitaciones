import { Calendar, Clock, MapPin, Shirt } from "lucide-react"
import type { InvitacionPublica, CamposEspecificosQuince } from "@/types/invitation"

const FONT_BODY = "'DM Sans', sans-serif"
const FONT_HEADING = "'Source Serif 4', Georgia, serif"

interface InfoSectionProps {
  invitacion: InvitacionPublica
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

export function InfoSection({ invitacion }: InfoSectionProps) {
  const { fechaEvento, horaEvento, ubicacion, direccion, titulo } = invitacion
  const campos = invitacion.camposEspecificos as unknown as CamposEspecificosQuince | null
  const dressCode = campos?.dressCode
  const horaPresentacion = campos?.horaPresentacion

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
      details: `Mis XV años — ${titulo}`,
      location: `${ubicacion}, ${direccion}`,
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  const iconStyle: React.CSSProperties = {
    color: "var(--invitation-primary)",
    flexShrink: 0,
    marginTop: "2px",
  }

  return (
    <section className="flex flex-col items-center px-10 pb-12 pt-12 gap-7">
      {/* Separator + heading */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="w-2/3 h-[2px] opacity-40" style={{ backgroundColor: "var(--invitation-primary)" }} />
        <h2
          className="text-[1.5rem]"
          style={{ fontFamily: FONT_HEADING, fontStyle: "italic", color: "white" }}
        >
          Detalles del evento
        </h2>
      </div>

      <div className="flex flex-col gap-6 w-full px-3">
        {/* Fecha */}
        <div className="flex items-start gap-4">
          <Calendar className="h-5 w-5" style={iconStyle} />
          <div className="flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-widest text-white/50" style={{ fontFamily: FONT_BODY }}>
              Fecha
            </p>
            <p className="text-base text-white" style={{ fontFamily: FONT_BODY }}>
              {formatFechaCompleta(fechaEvento)}
            </p>
          </div>
        </div>

        {/* Hora */}
        <div className="flex items-start gap-4">
          <Clock className="h-5 w-5" style={iconStyle} />
          <div className="flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-widest text-white/50" style={{ fontFamily: FONT_BODY }}>
              Hora
            </p>
            <p className="text-base text-white" style={{ fontFamily: FONT_BODY }}>
              {horaEvento.slice(0, 5)} hs
              {horaPresentacion && (
                <span className="text-white/70"> · Presentación: {horaPresentacion.slice(0, 5)} hs</span>
              )}
            </p>
            <a
              href={generarLinkCalendario()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block px-4 py-1.5 text-sm text-white transition-opacity hover:opacity-80"
              style={{
                fontFamily: FONT_BODY,
                backgroundColor: "#181C47",
                border: "1px solid",
                borderImage: "linear-gradient(to right, var(--invitation-primary), transparent) 1",
              }}
            >
              + Agendar en calendario
            </a>
          </div>
        </div>

        {/* Lugar */}
        <div className="flex items-start gap-4">
          <MapPin className="h-5 w-5" style={iconStyle} />
          <div className="flex flex-col gap-0.5">
            <p className="text-[11px] uppercase tracking-widest text-white/50" style={{ fontFamily: FONT_BODY }}>
              Lugar
            </p>
            <p className="text-base text-white" style={{ fontFamily: FONT_BODY }}>
              {ubicacion}
            </p>
            {direccion && (
              <p className="text-sm text-white/70" style={{ fontFamily: FONT_BODY }}>
                {direccion}
              </p>
            )}
          </div>
        </div>

        {/* Vestimenta */}
        {dressCode && (
          <div className="flex items-start gap-4">
            <Shirt className="h-5 w-5" style={iconStyle} />
            <div className="flex flex-col gap-1">
              <p className="text-[11px] uppercase tracking-widest text-white/50" style={{ fontFamily: FONT_BODY }}>
                Vestimenta
              </p>
              <p className="text-base text-white" style={{ fontFamily: FONT_BODY }}>
                {dressCode}
              </p>
            </div>
          </div>
        )}
      </div>

    </section>
  )
}
