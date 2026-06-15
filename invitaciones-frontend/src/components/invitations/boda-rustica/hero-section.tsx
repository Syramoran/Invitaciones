import type { InvitacionPublica, CamposEspecificosBoda } from "@/types/invitation"

interface HeroSectionProps {
  invitacion: InvitacionPublica
  invitadoParam?: string | null
}

function formatFechaCorta(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-")
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]
  return `${Number(d)} de ${meses[Number(m) - 1]}, ${y}`
}

export function HeroSection({ invitacion, invitadoParam }: HeroSectionProps) {
  const { camposEspecificos, fotosAnfitrion, saludoPersonalizado, titulo, fechaEvento } = invitacion

  const campos = camposEspecificos as unknown as CamposEspecificosBoda | null
  const nombreNovio1 = campos?.novio1
  const nombreNovio2 = campos?.novio2
  const esBoda = !!(nombreNovio1 && nombreNovio2)

  const saludo =
    saludoPersonalizado ||
    (invitadoParam ? `¡Hola ${invitadoParam.replace(/-/g, " ")}!` : null)

  const fotoHeader =
    fotosAnfitrion.length > 0
      ? [...fotosAnfitrion].sort((a, b) => a.orden - b.orden)[0]
      : null

  return (
    <section className="relative isolate overflow-hidden min-h-[42rem]">
      {/* Fondo floral rústico — cubre toda el área de la sección */}
      <img
        src="/boda-rustica/hero-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />

      {/* Contenido superpuesto */}
      <div className="relative z-[1] flex flex-col items-center px-7 pb-12 pt-[8.75rem] text-center">
        <div className="flex flex-col items-center pt-5">
          {/* Saludo */}
          {saludo && (
            <p
              className="mb-4 text-base font-semibold text-[#354132]"
              style={{ fontFamily: "Quicksand, sans-serif" }}
            >
              {saludo}
            </p>
          )}

          {/* Título principal */}
          <h2
            className="mb-2 text-[1.5rem] font-semibold uppercase text-[#333]"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            {titulo}
          </h2>

          {/* Nombres con Dancing Script */}
          {esBoda ? (
            <div
              className="flex items-center justify-center gap-1"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              <h1
                className="text-[3rem] font-bold leading-tight"
                style={{ color: "var(--invitation-primary)" }}
              >
                {nombreNovio1}
              </h1>
              <span
                className="text-[3rem] font-bold leading-tight"
                style={{ color: "var(--invitation-primary)", opacity: 0.7 }}
              >
                &amp;
              </span>
              <h1
                className="text-[3rem] font-bold leading-tight"
                style={{ color: "var(--invitation-primary)" }}
              >
                {nombreNovio2}
              </h1>
            </div>
          ) : (
            <h1
              className="text-[3rem] font-bold leading-tight"
              style={{ fontFamily: "'Dancing Script', cursive", color: "var(--invitation-primary)" }}
            >
              {titulo}
            </h1>
          )}

          {/* Fecha */}
          <p
            className="mt-4 mb-8 text-base font-semibold text-[#1e1e1e]"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            {formatFechaCorta(fechaEvento)}
          </p>
        </div>

        {/* Foto principal — rectangular con sombra verde */}
        <div
          className="h-[17.5rem] w-[13.75rem] overflow-hidden"
          style={{ boxShadow: "2px 4px 32px rgba(149, 155, 40, 0.4)" }}
        >
          {fotoHeader ? (
            <img
              src={fotoHeader.url}
              alt={titulo}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#e0ddd6] text-xs text-[#aaa]">
              Foto principal
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
