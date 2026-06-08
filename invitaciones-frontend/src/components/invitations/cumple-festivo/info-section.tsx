import { Calendar, Clock, MapPin, Shirt, Zap, FileText } from "lucide-react"
import type { InvitacionPublica, CamposEspecificosCumple } from "@/types/invitation"

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

function formatHora(hora: string): string {
  return `${hora.slice(0, 5)} hs`
}

export function InfoSection({ invitacion, colorAccent }: InfoSectionProps) {
  const { fechaEvento, horaEvento, ubicacion, direccion, camposEspecificos } = invitacion

  const campos = (camposEspecificos ?? {}) as CamposEspecificosCumple
  const dressCode = campos.dressCode
  const actividades = campos.actividades
  const notas = campos.notas

  const generarLinkCalendario = () => {
    const [year, month, day] = fechaEvento.split("T")[0].split("-").map(Number)
    const [hora, minuto] = horaEvento.split(":").map(Number)
    const fechaInicio = new Date(year, month - 1, day, hora, minuto, 0, 0)
    const fechaFin = new Date(fechaInicio)
    fechaFin.setHours(fechaFin.getHours() + 4)

    const formatoGoogle = (f: Date) => f.toISOString().replace(/-|:|\.\d{3}/g, "")

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
    <section
      className="relative px-14 py-14"
      style={{
        backgroundImage: "url('/cumple-festivo/fondo-info-disco.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative">
        <p className="mb-8 text-center text-[13px] font-medium tracking-[0.3em] text-[#aaaaaa] uppercase">
          Información
        </p>

        <div className="flex flex-col gap-7">
          {/* Fecha */}
          <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <Calendar className="h-6 w-6 text-[#cccccc]" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-[11px] font-medium tracking-[0.2em] text-[#888888] uppercase">
                Fecha
              </p>
              <p className="text-[17px] font-medium leading-snug text-white">
                {formatFechaCompleta(fechaEvento)}
              </p>
            </div>
          </div>

          {/* Hora */}
          <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <Clock className="h-6 w-6 text-[#cccccc]" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-[11px] font-medium tracking-[0.2em] text-[#888888] uppercase">
                Hora
              </p>
              <p className="text-[17px] font-medium leading-snug text-white">
                {formatHora(horaEvento)}
              </p>
              <a
                href={generarLinkCalendario()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded-lg bg-white/15 px-5 py-2 text-[13px] font-medium text-[#dddddd] transition-colors hover:bg-white/20"
              >
                Agendar en calendario
              </a>
            </div>
          </div>

          {/* Lugar */}
          <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <MapPin className="h-6 w-6 text-[#cccccc]" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-[11px] font-medium tracking-[0.2em] text-[#888888] uppercase">
                Lugar
              </p>
              {ubicacion === "multiple" ? (
                <p className="text-[17px] font-medium leading-snug text-white">
                  Múltiples lugares — ver ubicaciones abajo
                </p>
              ) : (
                <>
                  <p className="text-[17px] font-medium leading-snug text-white">
                    {ubicacion}
                  </p>
                  <p className="mt-1 text-[14px] text-[#999999]">{direccion}</p>
                </>
              )}
            </div>
          </div>

          {/* Vestimenta */}
          {dressCode && (
            <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                <Shirt className="h-6 w-6 text-[#cccccc]" />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-[11px] font-medium tracking-[0.2em] text-[#888888] uppercase">
                  Vestimenta
                </p>
                <p className="text-[17px] font-medium leading-snug text-white">
                  {dressCode}
                </p>
              </div>
            </div>
          )}

          {/* Actividades */}
          {actividades && (
            <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                <Zap className="h-6 w-6 text-[#cccccc]" />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-[11px] font-medium tracking-[0.2em] text-[#888888] uppercase">
                  Actividades
                </p>
                <p className="whitespace-pre-line text-[17px] font-medium leading-snug text-white">
                  {actividades}
                </p>
              </div>
            </div>
          )}

          {/* Notas */}
          {notas && (
            <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                <FileText className="h-6 w-6 text-[#cccccc]" />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-[11px] font-medium tracking-[0.2em] text-[#888888] uppercase">
                  Notas
                </p>
                <p className="whitespace-pre-line text-[17px] font-medium leading-snug text-white">
                  {notas}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

