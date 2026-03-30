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
  const fechaObjetivo = new Date(fechaEvento)
  fechaObjetivo.setHours(hora, minuto, 0, 0)

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
    <section className="border-b border-[#e0e0e0] px-7 py-12 text-center">
      <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#777777]">
        Faltan
      </p>

      <div className="flex justify-center gap-3">
        {boxes.map((box) => (
          <div
            key={box.unidad}
            className="flex h-[78px] w-[70px] flex-col items-center justify-center rounded-lg border border-[#e0e0e0]"
          >
            <span className="text-[28px] font-bold leading-none text-[#1a1a1a]">
              {box.valor.toString().padStart(2, "0")}
            </span>
            <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.15em] text-[#777777]">
              {box.unidad}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
