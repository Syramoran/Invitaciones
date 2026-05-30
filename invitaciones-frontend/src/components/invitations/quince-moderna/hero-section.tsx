import type { InvitacionPublica, CamposEspecificosQuince } from "@/types/invitation"

const FONT_TITLE = "'Puppies Play', cursive"
const FONT_BODY = "'DM Sans', sans-serif"
const FONT_HEADING = "'Source Serif 4', Georgia, serif"

interface HeroSectionProps {
  invitacion: InvitacionPublica
  invitadoParam?: string | null
  colorAccent: string
}

export function HeroSection({ invitacion, invitadoParam, colorAccent }: HeroSectionProps) {
  const { fotosAnfitrion, saludoPersonalizado, camposEspecificos, titulo, fechaEvento } = invitacion

  const campos = camposEspecificos as unknown as CamposEspecificosQuince | null
  const nombre = campos?.nombre || titulo

  const saludo =
    saludoPersonalizado ||
    (invitadoParam ? `¡Hola, ${invitadoParam.replace(/-/g, " ")}!` : null)

  const fotoHeader =
    fotosAnfitrion.length > 0
      ? [...fotosAnfitrion].sort((a, b) => a.orden - b.orden)[0]
      : null

  const [anio, mes, dia] = fechaEvento.split("T")[0].split("-").map(Number)
  const fechaObj = new Date(anio, mes - 1, dia)
  const diaSemana = fechaObj.toLocaleDateString("es-ES", { weekday: "long" })
  const nombreMes = fechaObj.toLocaleDateString("es-ES", { month: "long" })
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <section
      className="relative flex flex-col items-center overflow-hidden px-8 pb-14 pt-14"
      style={{
        backgroundImage: "url('/quince-moderna/Fondo-noche.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100svh",
      }}
    >
      {/* Saludo personalizado */}
      {saludo && (
        <p
          className="relative z-10 text-center mb-8"
          style={{ fontFamily: FONT_BODY, fontSize: "1.25rem", color: "rgba(255,255,255,0.55)" }}
        >
          {saludo}
        </p>
      )}

      {/* Event label (titulo from backend) */}
      <p
        className="relative z-10 text-center max-w-[150px] leading-none"
        style={{ fontFamily: FONT_HEADING, fontWeight: 600, fontSize: "2.5rem", color: "rgba(255,255,255,0.85)" }}
      >
        {titulo}
      </p>

      {/* Name */}
      <h1
        className="relative z-10 text-center leading-none mt-1"
        style={{ fontFamily: FONT_TITLE, fontSize: "7.5rem", color: colorAccent }}
      >
        {nombre}
      </h1>

      {/* Date */}
      <div className="relative z-10 flex items-center justify-center w-full max-w-[300px] gap-6 mt-8">
        {/* Col 1: día de la semana con línea arriba y abajo */}
        <div className="flex flex-col items-center gap-1.5 w-24">
          <div className="w-24 h-px" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
          <span
            className="whitespace-nowrap"
            style={{ fontFamily: FONT_BODY, fontSize: "0.95rem", color: "rgba(255,255,255,0.85)" }}
          >
            {capitalize(diaSemana)}
          </span>
          <div className="w-24 h-px" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
        </div>

        {/* Col 2: número del día + mes */}
        <div className="flex flex-col items-center">
          <span
            className="leading-none"
            style={{ fontFamily: FONT_HEADING, fontSize: "2.8rem", color: "rgba(255,255,255,0.95)" }}
          >
            {dia}
          </span>
          <span
            style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}
          >
            {capitalize(nombreMes)}
          </span>
        </div>

        {/* Col 3: año con línea arriba y abajo */}
        <div className="flex flex-col items-center gap-1.5 w-24">
          <div className="w-24 h-px" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
          <span
            className="whitespace-nowrap"
            style={{ fontFamily: FONT_BODY, fontSize: "0.95rem", color: "rgba(255,255,255,0.85)" }}
          >
            {anio}
          </span>
          <div className="w-24 h-px" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
        </div>
      </div>

      {/* Photo */}
      {fotoHeader && (
        <div
          className="relative z-10 mt-10 overflow-hidden"
          style={{
            width: "240px",
            height: "320px",
          }}
        >
          <img
            src={fotoHeader.url}
            alt={nombre}
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
        </div>
      )}
    </section>
  )
}
