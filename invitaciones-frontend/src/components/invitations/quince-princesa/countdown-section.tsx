import { useState, useEffect } from "react"

interface CountdownSectionProps {
  fechaEvento: string // ISO 8601
  horaEvento: string  // HH:mm
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
    <section className="flex flex-col items-center px-7 pb-4 pt-14 gap-6 text-center">
      <p
        className="text-lg text-[#787878]"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        Faltan
      </p>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {boxes.map((box, i) => (
          <div key={box.unidad} className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center">
              <span
                className="text-[2.5rem] font-light leading-none"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "var(--invitation-primary)",
                }}
              >
                {box.valor.toString().padStart(2, "0")}
              </span>
              <span
                className="mt-1 text-[1.05rem] text-[#787878]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {box.unidad}
              </span>
            </div>

            {i < boxes.length - 1 && (
              <span
                className="text-[2rem] font-light leading-none mb-5"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "var(--invitation-primary)",
                }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
