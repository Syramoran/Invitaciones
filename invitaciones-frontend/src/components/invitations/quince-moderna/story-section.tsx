import type { Historia } from "@/types/invitation"

const FONT_BODY = "'DM Sans', sans-serif"
const FONT_HEADING = "'Source Serif 4', Georgia, serif"

interface StorySectionProps {
  historias: Historia[]
}

export function StorySection({ historias }: StorySectionProps) {
  if (historias.length === 0) return null

  const ordenadas = [...historias].sort((a, b) => a.orden - b.orden)

  return (
    <section
      className="relative flex flex-col items-center overflow-hidden px-10 py-14 gap-8"
    >
      {/* Background image */}
      <img
        src="/quince-moderna/section-historia.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
      />
      {/* Dark overlay for readability */}
      <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: "rgba(9,8,25,0.55)" }} />

      {/* Heading */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <h2
          className="text-center text-[2rem] leading-tight text-white"
          style={{ fontFamily: FONT_HEADING, fontStyle: "italic" }}
        >
          Una noche especial
        </h2>
      </div>

      {/* Stories */}
      <div className="relative z-10 flex flex-col gap-8 w-full">
        {ordenadas.map((historia) => (
          <div key={historia.id} className="flex flex-col gap-3">
            {historia.imagenUrl && (
              <div className="w-full h-[13rem] overflow-hidden rounded-xl">
                <img
                  src={historia.imagenUrl}
                  alt={`Momento ${historia.orden}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            {historia.texto && (
              <p
                className="text-sm leading-relaxed text-white"
                style={{
                  fontFamily: FONT_BODY,
                  fontWeight: 300,
                }}
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
