import { Calendar, Clock, MapPin } from "lucide-react"
import type { InvitacionPublica, CamposEspecificosBoda } from "@/types/invitation"

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

function formatHora(horaEvento: string): string {
  const [h, m] = horaEvento.split(":").map(Number)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function SuitIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 20 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M6 1L9 5.5H10.5M10.5 5.5L14 1M10.5 5.5L11.573 7.37767C11.9692 8.07113 12.9784 8.04312 13.3356 7.32875L14.7764 4.44721C14.9172 4.16569 14.9172 3.83431 14.7764 3.55279L14 2M9.5 5.5L8.42704 7.37767C8.03078 8.07113 7.02156 8.04312 6.66437 7.32875L5.20083 4.40166C5.07309 4.14618 5.0607 3.84826 5.16678 3.58305L6 1.5M10 6V21M19 19V6C19 4.89543 18.1046 4 17 4H16.4415C15.5807 4 14.8164 3.44914 14.5442 2.63246L14.4558 2.36754C14.1836 1.55086 13.4193 1 12.5585 1H7.44152C6.58066 1 5.81638 1.55086 5.54415 2.36754L5.45585 2.63246C5.18362 3.44914 4.41934 4 3.55848 4H3C1.89543 4 1 4.89543 1 6V19C1 20.1046 1.89543 21 3 21H17C18.1046 21 19 20.1046 19 19Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

export function InfoSection({ invitacion }: InfoSectionProps) {
  const { fechaEvento, horaEvento, ubicacion, direccion, camposEspecificos, titulo } = invitacion

  const campos = camposEspecificos as unknown as CamposEspecificosBoda | null
  const vestimenta = campos?.dressCode
  const esMultiple = ubicacion === "multiple"

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
      location: esMultiple ? "" : `${ubicacion}, ${direccion}`,
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  const iconStyle: React.CSSProperties = { color: "var(--invitation-primary)" }

  return (
    <section className="flex flex-col items-center px-12 pt-12 pb-8 gap-6">
      <p
        className="text-lg text-[#787878]"
        style={{ fontFamily: "Lato, sans-serif" }}
      >
        Información
      </p>

      <div className="flex flex-col gap-6 w-full pr-6">
        {/* Fecha */}
        <div className="flex items-start gap-4">
          <Calendar className="h-6 w-6 shrink-0 mt-0.5" style={iconStyle} />
          <div className="flex flex-col gap-1">
            <p className="text-base text-[#787878]" style={{ fontFamily: "Lato, sans-serif" }}>
              Fecha
            </p>
            <p className="text-[17px] font-medium text-[#1a1a1a]" style={{ fontFamily: "Lato, sans-serif" }}>
              {formatFechaCompleta(fechaEvento)}
            </p>
          </div>
        </div>

        {/* Hora */}
        <div className="flex items-start gap-4">
          <Clock className="h-6 w-6 shrink-0 mt-0.5" style={iconStyle} />
          <div className="flex flex-col gap-1">
            <p className="text-base text-[#787878]" style={{ fontFamily: "Lato, sans-serif" }}>
              Hora
            </p>
            <p className="text-[17px] font-medium text-[#1a1a1a]" style={{ fontFamily: "Lato, sans-serif" }}>
              {formatHora(horaEvento)} hs
            </p>
            <a
              href={generarLinkCalendario()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block rounded-3xl border border-[var(--invitation-primary)] bg-[#fcf8f0] px-4 py-1.5 text-base text-[#555] transition-colors hover:bg-[#e3ded6]"
              style={{ fontFamily: "Lato, sans-serif" }}
            >
              Agendar en calendario
            </a>
          </div>
        </div>

        {/* Lugar — solo si no es múltiple */}
        {!esMultiple && (
          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 shrink-0 mt-0.5" style={iconStyle} />
            <div className="flex flex-col gap-0.5">
              <p className="text-base text-[#787878]" style={{ fontFamily: "Lato, sans-serif" }}>
                Lugar
              </p>
              <p className="text-[17px] font-medium text-[#1a1a1a]" style={{ fontFamily: "Lato, sans-serif" }}>
                {ubicacion}
              </p>
              <p className="text-base text-[#787878]" style={{ fontFamily: "Lato, sans-serif" }}>
                {direccion}
              </p>
            </div>
          </div>
        )}

        {/* Vestimenta */}
        {vestimenta && (
          <div className="flex items-start gap-4">
            <SuitIcon className="h-6 w-6 shrink-0 mt-0.5" style={iconStyle} />
            <div className="flex flex-col gap-1">
              <p className="text-base text-[#787878]" style={{ fontFamily: "Lato, sans-serif" }}>
                Vestimenta
              </p>
              <p className="text-[17px] font-medium text-[#1a1a1a]" style={{ fontFamily: "Lato, sans-serif" }}>
                {vestimenta}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
