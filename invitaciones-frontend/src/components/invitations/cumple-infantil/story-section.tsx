import type { Historia } from "@/types/invitation"

interface StorySectionProps {
  historias: Historia[]
}

export function StorySection({ historias }: StorySectionProps) {
  if (historias.length === 0) return null

  const historiasOrdenadas = [...historias].sort((a, b) => a.orden - b.orden)

  return (
    <section className="px-7 py-6">
      <div className="mb-6 flex flex-col items-center">
        <h2
          className="mb-4 text-3xl font-extrabold leading-none text-center"
          style={{
            fontFamily: "var(--font-infantil-display)",
            color: "var(--invitation-primary)",
          }}
        >
          Un día especial
        </h2>
        <img
          src="/cumple-infantil/3-animalitos.svg"
          alt=""
          aria-hidden="true"
          className="w-full max-w-[320px] object-contain"
        />
      </div>

      <div className="flex flex-col gap-6">
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
                style={{ fontFamily: "'Nunito', sans-serif" }}
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
