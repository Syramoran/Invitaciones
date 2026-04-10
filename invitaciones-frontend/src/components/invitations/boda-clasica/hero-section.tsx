import type { InvitacionPublica, CamposEspecificosBoda } from "@/types/invitation"

interface HeroSectionProps {
  invitacion: InvitacionPublica
  invitadoParam?: string | null
}

function formatFechaCorta(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-")
  return `${d}/${m}/${y}`
}

export function HeroSection({ invitacion, invitadoParam }: HeroSectionProps) {
  const { camposEspecificos, fotosAnfitrion, saludoPersonalizado, titulo } = invitacion

  const campos = camposEspecificos as unknown as CamposEspecificosBoda | null
  const nombreNovio1 = campos?.novio1
  const nombreNovio2 = campos?.novio2
  const esBoda = !!(nombreNovio1 && nombreNovio2)

  // Saludo: saludoPersonalizado → "¡Hola {invitado}!" → null
  const saludo =
    saludoPersonalizado ||
    (invitadoParam ? `¡Hola ${invitadoParam.replace(/-/g, " ")}!` : null)

  const fotoHeader =
    fotosAnfitrion.length > 0
      ? [...fotosAnfitrion].sort((a, b) => a.orden - b.orden)[0]
      : null

  return (
    <section
      className="grid text-center"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
    >
      {/* Fondo floral — ocupa la misma celda que el contenido y define la altura */}
      <img
        src="/boda-clasica/hero-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none col-start-1 row-start-1 w-full self-start"
        loading="lazy"
      />

      <div className="col-start-1 row-start-1 z-10 flex flex-col items-center gap-0 self-center px-7 py-12">
        {/* Saludo */}
        {saludo && (
          <p
            className="mb-4 text-base text-[#787878]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            {saludo}
          </p>
        )}

        {/* Título principal */}
        <h2 className="mb-6 text-[1.8rem] font-semibold uppercase leading-tight tracking-widest text-[#333]">
          {esBoda ? "NOS CASAMOS" : titulo}
        </h2>

        {/* Foto principal — oval */}
        <div className="mb-2 h-[17rem] w-[13.75rem] overflow-hidden rounded-[50%]">
          {fotoHeader ? (
            <img
              src={fotoHeader.url}
              alt={titulo}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#f0ece4] text-xs text-[#aaa]">
              Foto principal
            </div>
          )}
        </div>

        {/* Nombres */}
        {esBoda ? (
          <div className="mt-4 flex flex-col items-center leading-tight">
            <h1 className="text-[3rem] font-medium italic -mb-3" style={{ color: "var(--invitation-accent)" }}>
              {nombreNovio1}
            </h1>
            <span
              className="text-[3rem] font-medium italic -mb-3"
              style={{ color: "var(--invitation-primary)" }}
            >
              &amp;
            </span>
            <h1 className="text-[3rem] font-medium italic" style={{ color: "var(--invitation-accent)" }}>
              {nombreNovio2}
            </h1>
          </div>
        ) : (
          <h1 className="mt-4 text-[3rem] font-semibold italic leading-tight text-[#333]">
            {titulo}
          </h1>
        )}

        {/* Fecha */}
        <p
          className="mt-5 text-base text-[#1e1e1e]"
          style={{ fontFamily: "Lato, sans-serif" }}
        >
          {formatFechaCorta(invitacion.fechaEvento)}
        </p>
      </div>
    </section>
  )
}
