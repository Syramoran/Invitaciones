import type { Historia } from "@/types/invitation"

const FONT_DISPLAY = "'Pinyon Script', cursive"
const FONT_BODY = "Montserrat, sans-serif"

interface StorySectionProps {
  historias: Historia[]
}

export function StorySection({ historias }: StorySectionProps) {
  if (historias.length === 0) return null

  const ordenadas = [...historias].sort((a, b) => a.orden - b.orden)

  return (
    <section
      className="flex flex-col items-start gap-6 px-7 py-12"
      style={{
        fontFamily: FONT_BODY,
        backgroundImage: "url('/boda-moderna/Section Texture-B3.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Título */}
      <div className="flex flex-col items-center self-stretch w-full">
        <h2
          className="text-[52px] font-normal text-center leading-tight"
          style={{ fontFamily: FONT_DISPLAY, color: "var(--invitation-primary)" }}
        >
          Nuestra Historia
        </h2>
      </div>

      {/* Items */}
      <div className="flex flex-col items-start gap-9 self-stretch w-full">
        {ordenadas.map((historia) => (
          <div
            key={historia.id}
            className="flex flex-col items-start gap-4 self-stretch w-full"
          >
            {/* Imagen */}
            {historia.imagenUrl ? (
              <div className="h-[220px] self-stretch w-full overflow-hidden">
                <img
                  src={historia.imagenUrl}
                  alt={`Historia ${historia.orden}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            {/* Texto */}
            {historia.texto && (
              <p
                className="self-stretch text-[#555555] text-base leading-relaxed"
                style={{ fontFamily: FONT_BODY }}
              >
                {historia.texto}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
