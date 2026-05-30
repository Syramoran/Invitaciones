import type { InvitacionPublica, CamposEspecificosBoda } from "@/types/invitation"

interface TaglineSectionProps {
  invitacion: InvitacionPublica
}

function formatFechaLarga(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number)
  const fecha = new Date(y, m - 1, d)
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  return `${diasSemana[fecha.getDay()]} ${fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`
}

export function TaglineSection({ invitacion }: TaglineSectionProps) {
  const { fechaEvento, camposEspecificos, titulo } = invitacion
  const campos = camposEspecificos as unknown as (CamposEspecificosBoda & { lemaEvento?: string }) | null

  const novio1 = campos?.novio1
  const novio2 = campos?.novio2
  const lema =
    campos?.lemaEvento ||
    ((novio1 && novio2)
      ? "Te esperamos para celebrar nuestra boda"
      : `Te esperamos para celebrar ${titulo}`)

  return (
    <section
      className="flex flex-col items-center px-0 pt-10 pb-20 gap-4 text-center"
      style={{ fontFamily: "Quicksand, sans-serif" }}
    >
      <div className="flex flex-col items-center px-7">
        <h3 className="w-[19rem] text-[1.5rem] font-semibold leading-[2rem] text-[#555]">
          {lema}
        </h3>
        <p className="mt-4 text-[1.25rem] font-semibold text-[#1a1a1a]">
          {formatFechaLarga(fechaEvento)}
        </p>
      </div>
    </section>
  )
}
