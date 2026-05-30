import type { Historia } from "@/types/invitation"
import { DestellosSvg } from "./quince-svgs"

interface StorySectionProps {
  historias: Historia[]
}

export function StorySection({ historias }: StorySectionProps) {
  if (historias.length === 0) return null

  const ordenadas = [...historias].sort((a, b) => a.orden - b.orden)

  return (
    <section
      className="flex flex-col items-start px-7 py-12 gap-4"
      style={{ backgroundColor: "var(--invitation-bg)" }}
    >
      <div className="relative self-stretch flex items-center justify-center py-4 overflow-hidden">
        <DestellosSvg
          className="absolute w-[140%] left-1/2 -translate-x-1/2 -translate-y-3 pointer-events-none"
          style={{ color: "#fff" }}
        />
        <h2
          className="relative text-center text-[2.5rem] font-light italic leading-tight text-white px-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Una noche especial
        </h2>
      </div>

      <div className="self-stretch flex flex-col gap-9">
        {ordenadas.map((historia) => (
          <div key={historia.id} className="flex flex-col gap-4 text-center">
            {historia.imagenUrl ? (
              <div className="self-stretch h-[13.75rem] overflow-hidden rounded-xl">
                <img
                  src={historia.imagenUrl}
                  alt={`Historia ${historia.orden}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            {historia.texto && (
              <p
                className="self-stretch text-left text-base"
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.85)" }}
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
