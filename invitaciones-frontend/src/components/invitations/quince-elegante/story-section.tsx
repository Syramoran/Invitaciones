import type { Historia } from "@/types/invitation"

interface StorySectionProps {
  historias: Historia[]
  colorAccent: string
}

export function StorySection({ historias, colorAccent }: StorySectionProps) {
  if (historias.length === 0) return null

  const ordenadas = [...historias].sort((a, b) => a.orden - b.orden)

  return (
    <section
      className="flex flex-col items-start px-7 py-12 gap-4"
      style={{
        backgroundImage: "url('/quince-elegante/fondo-textura-floral.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Title */}
      <div className="self-stretch flex items-center justify-center pt-2 pb-6">
        <h2
          className="text-center text-[2.2rem] italic leading-tight"
          style={{ fontFamily: "'Lora', Georgia, serif", color: "#fff" }}
        >
          Una noche especial
        </h2>
      </div>

      {/* Story blocks */}
      <div className="self-stretch flex flex-col gap-9">
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
                className="self-stretch text-left text-[15px] leading-relaxed"
                style={{
                  fontFamily: "'Nunito Sans', sans-serif",
                  color: "#3a3a3a",
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
