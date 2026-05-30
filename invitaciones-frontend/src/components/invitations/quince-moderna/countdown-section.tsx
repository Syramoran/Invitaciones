import { useState, useEffect } from "react"

const FONT_NUMBER = "'Source Serif 4', Georgia, serif"
const FONT_UNIT = "Lato, sans-serif"

interface CountdownSectionProps {
  fechaEvento: string
  horaEvento: string
}

interface TimeLeft {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

function calcularTiempoRestante(fechaEvento: string, horaEvento: string): TimeLeft {
  const [hora, minuto] = horaEvento.split(":").map(Number)
  const [y, m, d] = fechaEvento.split("T")[0].split("-").map(Number)
  const fechaObjetivo = new Date(y, m - 1, d, hora, minuto, 0, 0)
  const diferencia = fechaObjetivo.getTime() - Date.now()
  if (diferencia <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 }
  return {
    dias: Math.floor(diferencia / 1000 / 60 / 60 / 24),
    horas: Math.floor((diferencia / 1000 / 60 / 60) % 24),
    minutos: Math.floor((diferencia / 1000 / 60) % 60),
    segundos: Math.floor((diferencia / 1000) % 60),
  }
}

export function CountdownSection({ fechaEvento, horaEvento }: CountdownSectionProps) {
  const [tiempo, setTiempo] = useState<TimeLeft>(() =>
    calcularTiempoRestante(fechaEvento, horaEvento),
  )

  useEffect(() => {
    const id = setInterval(
      () => setTiempo(calcularTiempoRestante(fechaEvento, horaEvento)),
      1000,
    )
    return () => clearInterval(id)
  }, [fechaEvento, horaEvento])

  const boxes = [
    { valor: tiempo.dias, unidad: "Días" },
    { valor: tiempo.horas, unidad: "Horas" },
    { valor: tiempo.minutos, unidad: "Min" },
    { valor: tiempo.segundos, unidad: "Seg" },
  ]

  return (
    <section
      className="flex flex-col items-start px-7 pb-4 pt-14 gap-6 text-center"
      style={{ background: "linear-gradient(to bottom, #000000, #090819)" }}
    >
      <div className="self-stretch flex flex-col items-center">
        <p className="text-base text-white" style={{ fontFamily: FONT_UNIT }}>
          Faltan
        </p>
      </div>

      <div className="self-stretch flex items-center justify-center gap-3 flex-wrap">
        {boxes.map((box, i) => (
          <div key={box.unidad} className="flex items-center gap-3">
            <div className="h-[4.875rem] w-[3.75rem] rounded-lg flex flex-col items-center justify-center">
              <span
                className="text-[2.25rem] font-light leading-none text-white"
                style={{ fontFamily: FONT_NUMBER }}
              >
                {box.valor.toString().padStart(2, "0")}
              </span>
              <span
                className="mt-1 text-sm text-white/70"
                style={{ fontFamily: FONT_UNIT }}
              >
                {box.unidad}
              </span>
            </div>

            {i < boxes.length - 1 && (
              <div className="h-8 w-px" style={{ backgroundColor: "var(--invitation-primary)" }} />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
