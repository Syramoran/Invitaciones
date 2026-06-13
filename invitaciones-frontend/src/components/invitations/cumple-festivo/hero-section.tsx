import type { InvitacionPublica, CamposEspecificosCumple } from "@/types/invitation"

interface HeroSectionProps {
  invitacion: InvitacionPublica
  invitadoParam?: string | null
  colorAccent: string
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

function formatFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number)
  return `${d} de ${MESES[m - 1]}, ${y}`
}

export function HeroSection({ invitacion, invitadoParam }: HeroSectionProps) {
  const { fotosAnfitrion, saludoPersonalizado, camposEspecificos } = invitacion

  const campos = (camposEspecificos ?? {}) as CamposEspecificosCumple
  const nombre = campos.nombre || invitacion.titulo

  const saludo =
    saludoPersonalizado ||
    (invitadoParam ? `¡Hola ${invitadoParam.replace(/-/g, " ")}!` : null)

  const fotoHeader =
    fotosAnfitrion.length > 0
      ? [...fotosAnfitrion].sort((a, b) => a.orden - b.orden)[0]
      : null

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-7 py-[60px] text-center"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Fondo disco */}
      <img
        src="/cumple-festivo/Fondo-disco.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        loading="eager"
      />



      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center pt-32">
        {saludo && (
          <p className="mb-4 text-sm text-white/70">{saludo}</p>
        )}

        {/* Título del evento desde el backend */}
        <p
          className="mb-1 text-sm font-medium uppercase tracking-[0.25em] text-white/70"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {invitacion.titulo}
        </p>

        {/* Nombre del festejado desde camposEspecificos */}
        <h1
          className="text-[52px] leading-tight text-white"
          style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700 }}
        >
          {nombre}
        </h1>


        <p
          className="mt-4 text-sm text-white/75"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.06em" }}
        >
          {formatFecha(invitacion.fechaEvento)}
        </p>

        {/* Polaroid stack */}
        <div className="relative mt-10" style={{ width: 224, height: 300 }}>
          {/* Polaroid trasera: rotada +5°, desplazada hacia abajo y levemente a la derecha */}
          <div
            className="absolute bg-white shadow-lg"
            style={{
              width: 210,
              height: 272,
              top: 14,
              left: 7,
              transform: "rotate(5deg)",
              borderRadius: 6,
            }}
          />

          {/* Polaroid delantera: rotada -3°, marco tipo polaroid (más espacio abajo) */}
          <div
            className="absolute bg-white shadow-2xl"
            style={{
              width: 210,
              height: 272,
              top: 0,
              left: 7,
              transform: "rotate(-3deg)",
              padding: "8px 8px 44px 8px",
              borderRadius: 6,
            }}
          >
            {fotoHeader ? (
              <img
                src={fotoHeader.url}
                alt={nombre}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#2a2a2a] text-xs font-medium text-white/50">
                Foto principal
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}


