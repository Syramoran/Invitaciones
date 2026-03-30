import { Calendar, Clock, MapPin, Shirt } from "lucide-react"
import type { InvitacionPublica, CamposEspecificosBoda } from "@/types/invitation"

interface InfoSectionProps {
  invitacion: InvitacionPublica
}

function formatFechaCompleta(fechaISO: string): string {
  const fecha = new Date(fechaISO)
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const diaSemana = diasSemana[fecha.getDay()]
  
  return `${diaSemana} ${fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`
}

function formatHora(hora: string): string {
  return `${hora} hs`
}

export function InfoSection({ invitacion }: InfoSectionProps) {
  const { fechaEvento, horaEvento, ubicacion, direccion, camposEspecificos } = invitacion

  // Obtener vestimenta si existe en campos específicos
  const campos = camposEspecificos as unknown as CamposEspecificosBoda | null
  const vestimenta = campos?.vestimenta || campos?.dresscode

  // Generar URL de Google Calendar
  const generarLinkCalendario = () => {
    const fechaInicio = new Date(fechaEvento)
    const [hora, minuto] = horaEvento.split(":").map(Number)
    fechaInicio.setHours(hora, minuto, 0, 0)

    const fechaFin = new Date(fechaInicio)
    fechaFin.setHours(fechaFin.getHours() + 4) // Evento de 4 horas por defecto

    const formatoGoogle = (fecha: Date) =>
      fecha.toISOString().replace(/-|:|\.\d{3}/g, "")

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: invitacion.titulo,
      dates: `${formatoGoogle(fechaInicio)}/${formatoGoogle(fechaFin)}`,
      details: `Invitación: ${invitacion.titulo}`,
      location: `${ubicacion}, ${direccion}`,
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  return (
    <section className="border-b border-[#e0e0e0] px-7 py-12">
      <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#777777]">
        Información
      </p>

      <div className="flex flex-col gap-6">
        {/* Fecha */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#e0e0e0] bg-[#f5f5f5] text-xl">
            <Calendar className="h-5 w-5 text-[#777777]" />
          </div>
          <div className="flex-1">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777777]">
              Fecha
            </p>
            <p className="text-[15px] font-medium leading-snug text-[#1a1a1a]">
              {formatFechaCompleta(fechaEvento)}
            </p>
          </div>
        </div>

        {/* Hora */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#e0e0e0] bg-[#f5f5f5] text-xl">
            <Clock className="h-5 w-5 text-[#777777]" />
          </div>
          <div className="flex-1">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777777]">
              Hora
            </p>
            <p className="text-[15px] font-medium leading-snug text-[#1a1a1a]">
              {formatHora(horaEvento)}
            </p>
            <a
              href={generarLinkCalendario()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block rounded-md border border-[var(--invitation-primary)] bg-transparent px-4 py-1.5 text-[11px] font-semibold tracking-wide text-[var(--invitation-primary)] transition-colors hover:bg-[var(--invitation-primary)] hover:text-white"
            >
              Agendar en calendario
            </a>
          </div>
        </div>

        {/* Lugar */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#e0e0e0] bg-[#f5f5f5] text-xl">
            <MapPin className="h-5 w-5 text-[#777777]" />
          </div>
          <div className="flex-1">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777777]">
              Lugar
            </p>
            <p className="text-[15px] font-medium leading-snug text-[#1a1a1a]">
              {ubicacion}
            </p>
            <p className="mt-0.5 text-xs text-[#777777]">{direccion}</p>
          </div>
        </div>

        {/* Vestimenta (si existe) */}
        {vestimenta && (
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#e0e0e0] bg-[#f5f5f5] text-xl">
              <Shirt className="h-5 w-5 text-[#777777]" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777777]">
                Vestimenta
              </p>
              <p className="text-[15px] font-medium leading-snug text-[#1a1a1a]">
                {vestimenta}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
