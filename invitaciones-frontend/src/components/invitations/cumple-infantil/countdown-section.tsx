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
  const [y, m, d] = fechaEvento.split('T')[0].split('-').map(Number)
  const fechaObjetivo = new Date(y, m - 1, d, hora, minuto, 0, 0)

  const ahora = new Date()
  const diferencia = fechaObjetivo.getTime() - ahora.getTime()

  if (diferencia <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0 }
  }

  const segundos = Math.floor((diferencia / 1000) % 60)
  const minutos = Math.floor((diferencia / 1000 / 60) % 60)
  const horas = Math.floor((diferencia / 1000 / 60 / 60) % 24)
  const dias = Math.floor(diferencia / 1000 / 60 / 60 / 24)

  return { dias, horas, minutos, segundos }
}

export function CountdownSection({ fechaEvento, horaEvento }: CountdownSectionProps) {
  const [tiempoRestante, setTiempoRestante] = useState<TimeLeft>(() =>
    calcularTiempoRestante(fechaEvento, horaEvento)
  )

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempoRestante(calcularTiempoRestante(fechaEvento, horaEvento))
    }, 1000)

    return () => clearInterval(intervalo)
  }, [fechaEvento, horaEvento])

  const boxes = [
    { valor: tiempoRestante.dias, unidad: "Días" },
    { valor: tiempoRestante.horas, unidad: "Horas" },
    { valor: tiempoRestante.minutos, unidad: "Min" },
    { valor: tiempoRestante.segundos, unidad: "Seg" },
  ]

  return (
    <section className="px-7 py-6 text-center">
      <div className="mx-auto rounded-2xl bg-[#f5f0e8] px-6 py-6">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#777777]" style={{ fontFamily: "var(--font-infantil-body)" }}>
          Faltan
        </p>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {boxes.map((box, i) => (
            <div key={box.unidad} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span
                  className="text-[2.5rem] font-bold leading-none"
                  style={{ fontFamily: "var(--font-infantil-display)", color: "var(--invitation-primary)" }}
                >
                  {box.valor.toString().padStart(2, "0")}
                </span>
                <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.15em] text-[#777777]" style={{ fontFamily: "var(--font-infantil-body)" }}>
                  {box.unidad}
                </span>
              </div>
              {i < boxes.length - 1 && (
                <span
                  className="text-[2rem] font-bold leading-none mb-5"
                  style={{ fontFamily: "var(--font-infantil-display)", color: "var(--invitation-primary)" }}
                >
                  :
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
