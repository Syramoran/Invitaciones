import type { InvitacionPublica } from "@/types/invitation"
import type { CamposEspecificosQuince } from "@/types/invitation"

interface HeroSectionProps {
  invitacion: InvitacionPublica
  invitadoParam?: string | null
  colorAsset: string
}

function formatFechaCorta(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number)
  const fecha = new Date(y, m - 1, d)
  return fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function HeroSection({ invitacion, invitadoParam, colorAsset }: HeroSectionProps) {
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
    <section
      className="relative grid overflow-hidden"
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      {/* Fondo decorativo (marco princess) — misma celda, define altura */}
      <img
        src={`/quince-princesa/Fondo-princess-${colorAsset}.png`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none col-start-1 row-start-1 w-full select-none"
        loading="eager"
      />

      {/* Contenido superpuesto */}
      <div className="col-start-1 row-start-1 z-10 flex flex-col items-center gap-2 px-8 pb-14 pt-8 self-center">
        {/* Corona */}
        <img
          src={`/quince-princesa/Corona-${colorAsset}.png`}
          alt="Corona"
          className="w-24 h-auto mb-1"
          loading="eager"
        />

        {/* Saludo personalizado */}
        {saludo && (
          <p
            className="text-sm text-[#888]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {saludo}
          </p>
        )}

        {/* Título del evento */}
        <p
          className="text-lg"
          style={{ color: "#555", fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}
        >
          {invitacion.titulo}
        </p>

        {/* Nombre de la quinceañera */}
        <h1
          className="w-full break-words text-center text-[3.5rem] font-light italic leading-none"
          style={{ color: "var(--invitation-primary)" }}
        >
          {nombre}
        </h1>

        {/* Fecha */}
        <p
          className="text-sm text-[#888] mt-1"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {formatFechaCorta(invitacion.fechaEvento)}
        </p>

        {/* Foto ovalada */}
        {fotoHeader && (
          <div
            className="mt-5 w-[12rem] h-[16rem] overflow-hidden"
            style={{ borderRadius: "50%" }}
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
    </section>
  )
}
