import type { InvitacionPublica, CamposEspecificosCumple } from "@/types/invitation"

interface HeroSectionProps {
  invitacion: InvitacionPublica
}

function formatFechaLarga(fechaISO: string): string {
  const [y, m, d] = fechaISO.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function HeroSection({ invitacion }: HeroSectionProps) {
  const { camposEspecificos, fotosAnfitrion, saludoPersonalizado } = invitacion
  const campos = camposEspecificos as unknown as CamposEspecificosCumple | null

  // Nombre: preferir camposEspecificos.nombre, si no el título de la invitación
  const nombre = campos?.nombre?.trim() || invitacion.titulo

  // Texto del banner: "CUMPLE X AÑITOS" o "CUMPLE AÑOS"
  const bannerTexto = campos?.edad
    ? `CUMPLE ${campos.edad} ${String(campos.edad) === "1" ? "AÑITO" : "AÑITOS"}`
    : "CUMPLE AÑOS"

  // Primera foto ordenada por el campo orden
  const fotoHeader = [...fotosAnfitrion].sort((a, b) => a.orden - b.orden)[0] ?? null

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-8 pt-8 text-center"
      style={{ fontFamily: "var(--font-infantil-body)" }}
    >
      {/* Fondo ilustrado */}
      <img
        src="/cumple-infantil/Fondo-animalito.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {/* Contenido sobre el fondo */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Saludo personalizado */}
        {saludoPersonalizado && (
          <p
            className="mb-5 text-sm font-semibold text-[#5a4a3a]"
            style={{ fontFamily: "var(--font-infantil-body)" }}
          >
            {saludoPersonalizado}
          </p>
        )}

        {/* Foto circular */}
        {fotoHeader ? (
          <div className="mb-5 h-[190px] w-[190px] overflow-hidden rounded-full shadow-lg">
            <img
              src={fotoHeader.url}
              alt={nombre}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-5 flex h-[190px] w-[190px] items-center justify-center rounded-full bg-white/60 shadow-lg text-xs text-[#999]">
            Foto
          </div>
        )}

        {/* Nombre */}
        <h1
          className="mb-3 text-[54px] font-extrabold leading-none"
          style={{
            fontFamily: "var(--font-infantil-display)",
            color: "var(--invitation-primary)",
          }}
        >
          {nombre}
        </h1>

        {/* Banner tipo banderin con puntas a cada lado */}
        <div
          className="mb-4 flex w-full items-center justify-center px-14 py-3"
          style={{
            background: "var(--invitation-primary)",
            clipPath: "polygon(0% 0%, 100% 0%, calc(100% - 14px) 50%, 100% 100%, 0% 100%, 14px 50%)",
          }}
        >
          <span
            className="text-[13px] font-extrabold tracking-[0.2em] text-white"
            style={{ fontFamily: "var(--font-infantil-display)" }}
          >
            {bannerTexto}
          </span>
        </div>

        {/* Fecha */}
        <p
          className="text-sm font-semibold text-[#5a4a3a]"
          style={{ fontFamily: "var(--font-infantil-body)" }}
        >
          {formatFechaLarga(invitacion.fechaEvento)}
        </p>
      </div>
    </section>
  )
}
