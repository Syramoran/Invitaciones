import { useState } from "react"
import { Calendar, Clock, MapPin } from "lucide-react"
import type { InvitacionPublica } from "@/types/invitation"
import type { CamposEspecificosQuince } from "@/types/invitation"
import { SeparadorSvg, DresscodeSvg } from "./quince-svgs"

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

function DresscodeIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <DresscodeSvg
      className="h-8 w-8 shrink-0 mt-0.5"
      style={style}
    />
  )
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

  const iconStyle: React.CSSProperties = { color: "var(--invitation-primary)" }
  const [calHovered, setCalHovered] = useState(false)

  return (
    <section className="flex flex-col items-center px-10 pt-12 pb-8 gap-6">
      {/* Destellos separador */}
      <SeparadorSvg
        className="w-64 opacity-70"
        style={{ color: "var(--invitation-primary)" }}
      />

      <p
        className="text-base font-light text-[#787878]"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Información
      </p>

      <div className="flex flex-col gap-6 w-full">
        {/* Fecha */}
        <div className="flex items-start gap-4">
          <Calendar className="h-6 w-6 shrink-0 mt-0.5" style={iconStyle} />
          <div className="flex flex-col gap-1">
            <p className="text-base font-light text-[#787878]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Fecha
            </p>
            <p className="text-[17px] font-light text-[#1a1a1a]" style={{ fontFamily: "Poppins, sans-serif" }}>
              {formatFechaCompleta(fechaEvento)}
            </p>
          </div>
        </div>

        {/* Hora */}
        <div className="flex items-start gap-4">
          <Clock className="h-6 w-6 shrink-0 mt-0.5" style={iconStyle} />
          <div className="flex flex-col gap-1">
            <p className="text-base font-light text-[#787878]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Hora
            </p>
            <p className="text-[17px] font-light text-[#1a1a1a]" style={{ fontFamily: "Poppins, sans-serif" }}>
              {horaEvento.slice(0, 5)} hs
              {horaPresentacion && ` · Presentación: ${horaPresentacion.slice(0, 5)} hs`}
            </p>
            <a
              href={generarLinkCalendario()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block rounded-3xl border px-4 py-1.5 text-base font-light transition-colors"
              style={{
                fontFamily: "Poppins, sans-serif",
                borderColor: "var(--invitation-primary)",
                backgroundColor: calHovered ? "var(--invitation-primary)" : "var(--invitation-bg-soft)",
                color: calHovered ? "#fff" : "#555",
              }}
              onMouseEnter={() => setCalHovered(true)}
              onMouseLeave={() => setCalHovered(false)}
            >
              Agendar en calendario
            </a>
          </div>
        </div>

        {/* Lugar */}
        <div className="flex items-start gap-4">
          <MapPin className="h-6 w-6 shrink-0 mt-0.5" style={iconStyle} />
          <div className="flex flex-col gap-0.5">
            <p className="text-base font-light text-[#787878]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Lugar
            </p>
            <p className="text-[17px] font-light text-[#1a1a1a]" style={{ fontFamily: "Poppins, sans-serif" }}>
              {ubicacion}
            </p>
            {direccion && (
              <p className="text-base font-light text-[#787878]" style={{ fontFamily: "Poppins, sans-serif" }}>
                {direccion}
              </p>
            )}
          </div>
        </div>

        {/* Vestimenta */}
        {dressCode && (
          <div className="flex items-start gap-4">
            <DresscodeIcon style={iconStyle} />
            <div className="flex flex-col gap-1">
              <p className="text-base font-light text-[#787878]" style={{ fontFamily: "Poppins, sans-serif" }}>
                Vestimenta
              </p>
              <p className="text-[17px] font-light text-[#1a1a1a]" style={{ fontFamily: "Poppins, sans-serif" }}>
                {dressCode}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
