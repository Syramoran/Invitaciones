import type { InvitacionPublica, CamposEspecificosBoda } from "@/types/invitation"

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

function esBoda(camposEspecificos: Record<string, unknown> | null): boolean {
  return !!(camposEspecificos?.novio1 && camposEspecificos?.novio2)
}

export function HeroSection({ invitacion }: HeroSectionProps) {
  const { camposEspecificos, fotosAnfitrion, saludoPersonalizado } = invitacion

  // Primera foto ordenada por el campo orden
  const fotoHeader = [...fotosAnfitrion].sort((a, b) => a.orden - b.orden)[0] ?? null

  const renderNombres = () => {
    if (esBoda(camposEspecificos)) {
      const campos = camposEspecificos as unknown as CamposEspecificosBoda
      return (
        <>
          <h1 className="text-[44px] font-bold leading-tight text-[#1a1a1a]">
            {campos.novio1}
          </h1>
          <p className="my-1 text-3xl font-light text-[#777777]">&</p>
          <h1 className="text-[44px] font-bold leading-tight text-[#1a1a1a]">
            {campos.novio2}
          </h1>
        </>
      )
    }

    return (
      <h1 className="text-[44px] font-bold leading-tight text-[#1a1a1a]">
        {invitacion.titulo}
      </h1>
    )
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-7 py-[60px] text-center">
      {saludoPersonalizado && (
        <p className="mb-8 text-sm text-[#777777]">{saludoPersonalizado}</p>
      )}

      {renderNombres()}

      <p className="mt-5 text-sm tracking-[0.15em] text-[#777777]">
        {formatFechaLarga(invitacion.fechaEvento)}
      </p>

      {fotoHeader ? (
        <div className="mt-8 h-[280px] w-[220px] overflow-hidden rounded-xl border border-dashed border-[#e0e0e0] bg-[#f5f5f5]">
          <img
            src={fotoHeader.url}
            alt={invitacion.titulo}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="mt-8 flex h-[280px] w-[220px] items-center justify-center rounded-xl border border-dashed border-[#e0e0e0] bg-[#f5f5f5] text-xs font-medium text-[#777777]">
          Foto principal
        </div>
      )}
    </section>
  )
}
