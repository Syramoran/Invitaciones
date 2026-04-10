import type { Historia } from "@/types/invitation"

interface StorySectionProps {
  historias: Historia[]
}

export function StorySection({ historias }: StorySectionProps) {
  if (historias.length === 0) return null

  const ordenadas = [...historias].sort((a, b) => a.orden - b.orden)

  return (
    <section className="flex flex-col items-start px-7 py-12 gap-9">
      <h2
        className="self-stretch text-center text-[2.5rem] font-medium italic"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "var(--invitation-accent)" }}
      >
        Nuestra historia
      </h2>

      <div className="self-stretch flex flex-col gap-9 text-center">
        {ordenadas.map((historia) => (
          <div key={historia.id} className="flex flex-col gap-4">
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
                className="self-stretch text-left text-base text-[#787878]"
                style={{ fontFamily: "Lato, sans-serif" }}
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
