import { COLOR, TYPO } from "./theme"

const COLORES_MUJERES = ["#bf7340", "#6b2e2e", "#5e3b1a", "#5f743e", "#abc76b", "#39acac", "#5398c6", "#223677"]
const COLORES_HOMBRES = ["#2a365c", "#58422d", "#000000"]

export function DresscodeSection() {
  return (
    <section className="flex flex-col items-center gap-20 px-7 py-24">
      <h2
        style={{ ...TYPO.h2, color: COLOR.brown }}
      >
        Dresscode
      </h2>

      <div className="flex flex-col items-center gap-20">
        {/* Mujeres */}
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-6">
            <p
              style={{ ...TYPO.h3, color: COLOR.brown }}
            >
              Mujeres
            </p>
            <div className="h-px w-[5.6rem]" style={{ backgroundColor: `${COLOR.brown}80` }} />
            <p
              className="text-center"
              style={{ ...TYPO.h4, color: COLOR.brown }}
            >
              Elegante,<br />largo y liso
            </p>
          </div>

          <p
            className="text-center"
            style={{ ...TYPO.text, color: COLOR.brown }}
          >
            Colores sin estampas en tonalidades
          </p>

          <div className="flex h-14 items-center justify-center">
            {COLORES_MUJERES.map((color, i) => (
              <div
                key={color + i}
                className="h-[3.3rem] w-[3.3rem] rounded-[4px] border-2"
                style={{ backgroundColor: color, borderColor: COLOR.parchment, marginLeft: i === 0 ? 0 : "-0.4rem" }}
              />
            ))}
          </div>

          <div
            className="flex flex-col items-center gap-4 text-center"
            style={{ ...TYPO.text3, color: COLOR.brown }}
          >
            <p>Aclaración:</p>
            <p className="max-w-[14.6rem]">Blanco y colores muy claros están reservados para la novia</p>
          </div>
        </div>

        {/* Hombres */}
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-6">
            <p
              style={{ ...TYPO.h3, color: COLOR.brown }}
            >
              Hombres
            </p>
            <div className="h-px w-[5.6rem]" style={{ backgroundColor: `${COLOR.brown}80` }} />
          </div>

          <div
            className="flex flex-col items-center gap-10 text-center"
          >
            <p
              style={{ ...TYPO.h4, color: COLOR.brown }}
            >
              Elegante
            </p>
            <p
              style={{ ...TYPO.text, color: COLOR.brown }}
            >
              Colores oscuros:<br />azul, marrones y negro
            </p>
          </div>

          <div className="flex gap-1.5">
            {COLORES_HOMBRES.map((color) => (
              <div
                key={color}
                className="h-[3.3rem] w-[3.3rem] rounded-[4px] border-2"
                style={{ backgroundColor: color, borderColor: COLOR.parchment }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
