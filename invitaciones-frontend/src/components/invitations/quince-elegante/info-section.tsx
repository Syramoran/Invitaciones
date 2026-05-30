import { Calendar, Clock, MapPin } from "lucide-react"
import type { InvitacionPublica, CamposEspecificosQuince } from "@/types/invitation"
import { DresscodeEleganteSvg } from "./elegante-svgs"

interface InfoSectionProps {
  invitacion: InvitacionPublica
  colorAccent: string
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

export function InfoSection({ invitacion, colorAccent }: InfoSectionProps) {
  const { fechaEvento, horaEvento, ubicacion, direccion, titulo } = invitacion
  const campos = invitacion.camposEspecificos as unknown as CamposEspecificosQuince | null
  const dressCode = campos?.dressCode
  const horaPresentacion = campos?.horaPresentacion

  const iconStyle: React.CSSProperties = { color: colorAccent }
  const bodyFont = "'Nunito Sans', sans-serif"

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

  return (
    <section className="flex flex-col items-center px-10 pt-2 pb-10 gap-6 bg-white">
      <p
        className="text-sm text-[#999] tracking-widest"
        style={{ fontFamily: bodyFont }}
      >
        Información
      </p>

      <div className="flex flex-col gap-6 w-full">
        {/* Fecha */}
        <div className="flex items-start gap-4">
          <Calendar className="h-5 w-5 shrink-0 mt-0.5" style={iconStyle} />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#aaa] tracking-wide" style={{ fontFamily: bodyFont }}>
              Fecha
            </p>
            <p className="text-[15px] text-[#2a2a2a]" style={{ fontFamily: bodyFont }}>
              {formatFechaCompleta(fechaEvento)}
            </p>
          </div>
        </div>

        {/* Hora */}
        <div className="flex items-start gap-4">
          <Clock className="h-5 w-5 shrink-0 mt-0.5" style={iconStyle} />
          <div className="flex flex-col gap-1">
            <p className="text-xs text-[#aaa] tracking-wide" style={{ fontFamily: bodyFont }}>
              Hora
            </p>
            <p className="text-[15px] text-[#2a2a2a]" style={{ fontFamily: bodyFont }}>
              {horaEvento.slice(0, 5)} hs
              {horaPresentacion && ` · Presentación: ${horaPresentacion.slice(0, 5)} hs`}
            </p>
            <a
              href={generarLinkCalendario()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block px-4 py-1.5 text-sm font-semibold transition-colors"
              style={{
                fontFamily: bodyFont,
                backgroundColor: "#414E81",
                color: "#fff",
              }}
            >
              Agendar en calendario
            </a>
          </div>
        </div>

        {/* Lugar */}
        <div className="flex items-start gap-4">
          <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={iconStyle} />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#aaa] tracking-wide" style={{ fontFamily: bodyFont }}>
              Lugar
            </p>
            <p className="text-[15px] text-[#2a2a2a]" style={{ fontFamily: bodyFont }}>
              {ubicacion}
            </p>
            {direccion && (
              <p className="text-sm text-[#888]" style={{ fontFamily: bodyFont }}>
                {direccion}
              </p>
            )}
          </div>
        </div>

        {/* Vestimenta */}
        {dressCode && (
          <div className="flex items-start gap-4">
            <DresscodeEleganteSvg
              className="h-5 w-5 shrink-0 mt-0.5"
              style={iconStyle}
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-[#aaa] tracking-wide" style={{ fontFamily: bodyFont }}>
                Vestimenta
              </p>
              <p className="text-[15px] text-[#2a2a2a]" style={{ fontFamily: bodyFont }}>
                {dressCode}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
