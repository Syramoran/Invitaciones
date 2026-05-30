import type { InvitacionPublica, CamposEspecificosBoda } from "@/types/invitation"

const FONT_SCRIPT = "'Pinyon Script', cursive"
const FONT_AMPERSAND = "'Cormorant Garamond', serif"
const FONT_BODY = "Montserrat, sans-serif"
const COLOR_DEFAULT = "#4E1319"

interface HeroSectionProps {
  invitacion: InvitacionPublica
  invitadoParam?: string | null
}

function formatFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number)
  return `${String(d).padStart(2, "0")} / ${String(m).padStart(2, "0")} / ${y}`
}

export function HeroSection({ invitacion, invitadoParam }: HeroSectionProps) {
  const { camposEspecificos, fotosAnfitrion, saludoPersonalizado, titulo } = invitacion

  const campos = camposEspecificos as unknown as CamposEspecificosBoda | null
  const nombreNovio1 = campos?.novio1
  const nombreNovio2 = campos?.novio2
  const esBoda = !!(nombreNovio1 && nombreNovio2)
  const colorAccent = invitacion.colorPrimario || COLOR_DEFAULT

  const saludo =
    saludoPersonalizado ||
    (invitadoParam ? `¡Hola ${invitadoParam.replace(/-/g, " ")}!` : null)

  const fotoHeader =
    fotosAnfitrion.length > 0
      ? [...fotosAnfitrion].sort((a, b) => a.orden - b.orden)[0]
      : null

  return (
    <section
      className="relative flex flex-col h-[740px] items-center justify-center pt-[50px] pb-6 px-7 overflow-hidden"
      style={{
        backgroundImage: "url('/boda-moderna/Fondo1-B3(3) 1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: FONT_BODY,
      }}
    >
      {/* Saludo */}
      {saludo && (
        <p className="mb-4 text-base text-[#777777] text-center tracking-wide">
          {saludo}
        </p>
      )}

      {/* NOS CASAMOS / título */}
      <p
        className="mb-4 text-2xl font-normal text-[#555555] text-center"
        style={{ letterSpacing: "2.4px" }}
      >
        {esBoda ? "NOS CASAMOS" : titulo.toUpperCase()}
      </p>

      {/* Nombres + foto superpuesta */}
      <div className="relative flex flex-col items-center w-[332px] px-6">
        {/* Nombre 1 – encima de la foto, sin margen inferior: renglón toca borde superior */}
        {esBoda && (
          <div className="self-stretch flex items-start" style={{ transform: "translateY(21px)" }}>
            <span
              className="text-[80px] leading-none text-[#bfbfbf]"
              style={{ fontFamily: FONT_SCRIPT }}
            >
              {nombreNovio1}
            </span>
          </div>
        )}

        {/* Foto + Nombre 2 en contenedor relativo */}
        <div className="relative self-stretch flex justify-center">
          {/* & – detrás de la foto */}
          {esBoda && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <span
                className="text-5xl font-normal"
                style={{ fontFamily: FONT_AMPERSAND, color: colorAccent }}
              >
                &amp;
              </span>
            </div>
          )}

          {fotoHeader && (
            <img
              src={fotoHeader.url}
              alt={titulo}
              className="relative z-10 w-[260px] h-[330px] object-cover"
              loading="lazy"
            />
          )}

          {/* Nombre 2 – superpuesto a la foto, renglón en el borde inferior */}
          {esBoda && (
            <div className="absolute bottom-0 right-0 z-20 flex items-end justify-end" style={{ transform: "translateY(21px)" }}>
              <span
                className="text-[80px] leading-none text-[#bfbfbf] text-right"
                style={{ fontFamily: FONT_SCRIPT }}
              >
                {nombreNovio2}
              </span>
            </div>
          )}
        </div>

        {/* Título para eventos no-boda */}
        {!esBoda && (
          <h1
            className="relative z-10 text-[64px] leading-none text-center"
            style={{ fontFamily: FONT_SCRIPT, color: colorAccent }}
          >
            {titulo}
          </h1>
        )}
      </div>

      {/* Fecha */}
      <p
        className="mt-12 text-xl font-normal text-[#777777] text-center"
        style={{ letterSpacing: "2px" }}
      >
        {formatFecha(invitacion.fechaEvento)}
      </p>
    </section>
  )
}
