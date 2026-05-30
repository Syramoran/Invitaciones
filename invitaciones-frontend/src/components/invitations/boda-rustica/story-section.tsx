import type { Historia } from "@/types/invitation"

interface StorySectionProps {
  historias: Historia[]
}

export function StorySection({ historias }: StorySectionProps) {
  if (historias.length === 0) return null

  const ordenadas = [...historias].sort((a, b) => a.orden - b.orden)

  return (
    <section
      className="self-stretch flex flex-col items-start py-12 px-7 gap-6 bg-cover bg-no-repeat bg-top"
      style={{
        backgroundImage: "url('/boda-rustica/section-fondo.png')",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Título */}
      <h2
        className="self-stretch text-center text-[3rem] font-bold text-[#333]"
        style={{ fontFamily: "'Dancing Script', cursive" }}
      >
        Nuestra Historia
      </h2>

      {/* Historias */}
      <div className="self-stretch flex flex-col gap-9">
        {ordenadas.map((historia) => (
          <div key={historia.id} className="flex flex-col gap-4">
            {historia.imagenUrl ? (
              <div className="self-stretch h-[13.75rem] overflow-hidden rounded-[1px]">
                <img
                  src={historia.imagenUrl}
                  alt={`Historia ${historia.orden}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="self-stretch h-[13.75rem] rounded-[1px] bg-[#d9d9d9] flex items-center justify-center">
                <span className="text-xs text-[#787878]">Foto {historia.orden}</span>
              </div>
            )}

            {historia.texto && (
              <p
                className="self-stretch text-left text-base font-semibold text-[#787878]"
                style={{ fontFamily: "Quicksand, sans-serif" }}
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
