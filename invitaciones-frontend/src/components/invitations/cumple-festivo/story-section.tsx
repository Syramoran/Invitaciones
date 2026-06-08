import type { Historia } from "@/types/invitation"

interface StorySectionProps {
  historias: Historia[]
}

export function StorySection({ historias }: StorySectionProps) {
  if (historias.length === 0) return null

  const historiasOrdenadas = [...historias].sort((a, b) => a.orden - b.orden)

  return (
    <section className="border-b border-[#333333]">
      {/* Banner fondo noche disco */}
      <div className="relative w-full">
        <img
          src="/cumple-festivo/fondo-noche-disco.png"
          alt=""
          aria-hidden="true"
          className="w-full"
        />
        <div className="absolute inset-0 flex items-center justify-center px-14">
          <h2
            className="text-center text-[42px] leading-tight text-white"
            style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700 }}
          >
            Una noche especial
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-9 px-7 py-12 pt-0">
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
              <p className="text-sm leading-relaxed text-[#777777]">
                {historia.texto}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
