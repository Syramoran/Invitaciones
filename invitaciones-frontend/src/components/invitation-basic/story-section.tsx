import type { Historia } from "@/types/invitation"

interface StorySectionProps {
  historias: Historia[]
}

export function StorySection({ historias }: StorySectionProps) {
  if (historias.length === 0) return null

  // Ordenar por campo "orden"
  const historiasOrdenadas = [...historias].sort((a, b) => a.orden - b.orden)

  return (
    <section className="border-b border-[#e0e0e0] px-7 py-12">
      <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#777777]">
        Nuestra Historia
      </p>

      <div className="flex flex-col gap-9">
        {historiasOrdenadas.map((historia) => (
          <div key={historia.id} className="flex flex-col gap-4">
            {historia.imagenUrl ? (
              <div className="h-[220px] w-full overflow-hidden rounded-xl">
                <img
                  src={historia.imagenUrl}
                  alt={`Historia ${historia.orden}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-[220px] w-full items-center justify-center rounded-xl border border-dashed border-[#e0e0e0] bg-[#f5f5f5] text-xs font-medium text-[#777777]">
                Foto {historia.orden}
              </div>
            )}

            <p className="text-sm leading-relaxed text-[#777777]">
              {historia.texto}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
