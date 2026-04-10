import { useState, useEffect } from "react"

interface CountdownSectionProps {
  fechaEvento: string // ISO 8601
  horaEvento: string // HH:mm
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
    calcularTiempoRestante(fechaEvento, horaEvento)
  )

  useEffect(() => {
    const id = setInterval(() => {
      setTiempo(calcularTiempoRestante(fechaEvento, horaEvento))
    }, 1000)
    return () => clearInterval(id)
  }, [fechaEvento, horaEvento])

  const boxes = [
    { valor: tiempo.dias, unidad: "Días" },
    { valor: tiempo.horas, unidad: "Horas" },
    { valor: tiempo.minutos, unidad: "Min" },
    { valor: tiempo.segundos, unidad: "Seg" },
  ]

  return (
    <section className="flex flex-col items-start px-7 pb-4 pt-14 gap-6 text-center">
      <div className="self-stretch flex flex-col items-center">
        <p className="text-base text-[#787878]" style={{ fontFamily: "Lato, sans-serif" }}>
          Faltan
        </p>
      </div>

      <div className="self-stretch flex items-center justify-center gap-3 flex-wrap">
        {boxes.map((box, i) => (
          <div key={box.unidad} className="flex items-center gap-3">
            <div className="h-[4.875rem] w-[3.75rem] rounded-lg flex flex-col items-center justify-center">
              <span
                className="text-[2.25rem] font-bold leading-none text-[#666]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {box.valor.toString().padStart(2, "0")}
              </span>
              <span
                className="mt-1 text-base text-[#787878]"
                style={{ fontFamily: "Lato, sans-serif" }}
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
