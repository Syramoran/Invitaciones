import type { InvitacionPublica, CamposEspecificosQuince } from "@/types/invitation"

interface HeroSectionProps {
  invitacion: InvitacionPublica
  invitadoParam?: string | null
  colorAccent: string
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

function formatFechaCorta(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number)
  return `${d} de ${MESES[m - 1]}, ${y}`
}

export function HeroSection({ invitacion, invitadoParam, colorAccent }: HeroSectionProps) {
  const { fotosAnfitrion, saludoPersonalizado, camposEspecificos } = invitacion

  const campos = camposEspecificos as unknown as CamposEspecificosQuince | null
  const nombre = campos?.nombre || invitacion.titulo

  const saludo =
    saludoPersonalizado ||
    (invitadoParam ? `¡Hola ${invitadoParam.replace(/-/g, " ")}!` : null)

  const fotoHeader =
    fotosAnfitrion.length > 0
      ? [...fotosAnfitrion].sort((a, b) => a.orden - b.orden)[0]
      : null

  return (
    <section className="relative grid overflow-hidden bg-white">
      {/* Overlaid content */}
      <div className="col-start-1 row-start-1 z-10 flex flex-col items-center gap-5 px-7 py-10 self-center">

        {/* Text frame card */}
        <div
          className="w-full max-w-[260px] rounded-xl bg-white px-6 py-5 text-center"
        >
          {/* Saludo */}
          {saludo && (
            <p
              className="mb-1 text-sm text-[#888]"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {saludo}
            </p>
          )}

          {/* Evento label */}
          <p
            className="text-sm font-semibold uppercase tracking-[0.18em] text-[#555]"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            {invitacion.titulo}
          </p>

          {/* Nombre */}
          <h1
            className="mt-1 break-words text-center text-[3rem] font-bold italic leading-none"
            style={{
              fontFamily: "'Lora', Georgia, serif",
              color: colorAccent,
            }}
          >
            {nombre}
          </h1>

          {/* Fecha */}
          <div className="mt-4 flex items-center justify-center">
            <p
              className="text-sm text-[#888]"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              {formatFechaCorta(invitacion.fechaEvento)}
            </p>
          </div>
        </div>

        {/* Foto */}
        {fotoHeader && (
          <div
            className="overflow-hidden"
            style={{ width: "14rem", height: "18rem" }}
          >
            <img
              src={fotoHeader.url}
              alt={nombre}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Floral background — top layer overlay */}
      <img
        src="/quince-elegante/Fondo-floral.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none col-start-1 row-start-1 z-20 w-full select-none object-cover"
        loading="eager"
        style={{ minHeight: "480px" }}
      />
    </section>
  )
}
