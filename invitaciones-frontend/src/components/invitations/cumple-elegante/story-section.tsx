import type { Historia } from "@/types/invitation"

interface StorySectionProps {
  historias: Historia[]
}

export function StorySection({ historias }: StorySectionProps) {
  if (historias.length === 0) return null

  const historiasOrdenadas = [...historias].sort((a, b) => a.orden - b.orden)

  return (
    <section className="px-7 py-12">
      {/* Title + decorative image flush together */}
      <div className="mb-8 flex flex-col items-center">
        <p
          className="text-lg text-[#787878]"
          style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}
        >
          Un día
        </p>
        <img
          src="/cumple-elegante/recurso-especial.svg"
          alt=""
          aria-hidden="true"
          className="w-full max-w-[320px] object-contain"
        />
      </div>

      <div className="flex flex-col gap-9">
        {historiasOrdenadas.map((historia) => (
          <div key={historia.id} className="flex flex-col gap-4">
            {historia.imagenUrl && (
              <div className="h-[220px] w-full overflow-hidden rounded-xl">
                <img
                  src={historia.imagenUrl}
                  alt={`Historia ${historia.orden}`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {historia.texto && (
              <p
                className="text-sm leading-relaxed text-[#777777]"
                style={{ fontFamily: "'Raleway', sans-serif" }}
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
