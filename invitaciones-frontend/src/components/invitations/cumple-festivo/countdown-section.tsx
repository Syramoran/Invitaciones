import { useState, useEffect } from "react"

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

  const ahora = new Date()
  const diferencia = fechaObjetivo.getTime() - ahora.getTime()

  if (diferencia <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0 }
  }

  return {
    dias: Math.floor(diferencia / 1000 / 60 / 60 / 24),
    horas: Math.floor((diferencia / 1000 / 60 / 60) % 24),
    minutos: Math.floor((diferencia / 1000 / 60) % 60),
    segundos: Math.floor((diferencia / 1000) % 60),
  }
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

  const unidades = [
    { valor: tiempoRestante.dias, unidad: "Días" },
    { valor: tiempoRestante.horas, unidad: "Horas" },
    { valor: tiempoRestante.minutos, unidad: "Min" },
    { valor: tiempoRestante.segundos, unidad: "Seg" },
  ]

  return (
    <section className="px-7 py-12 text-center">
      <p className="mb-8 text-[13px] font-medium tracking-[0.3em] text-[#aaaaaa] uppercase">
        Faltan
      </p>

      <div className="flex items-start justify-center">
        {unidades.map((u, i) => (
          <div key={u.unidad} className="flex items-start">
            <div className="flex flex-col items-center">
              <span className="text-[32px] font-light leading-none text-white">
                {u.valor.toString().padStart(2, "0")}
              </span>
              <span className="mt-2 text-[10px] font-medium tracking-[0.15em] text-[#888888] uppercase">
                {u.unidad}
              </span>
            </div>
            {i < unidades.length - 1 && (
              <span className="mx-3 mt-1 text-[26px] font-light leading-none text-[#555555]">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

