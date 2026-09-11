import { useState, useEffect } from "react"
import { COLOR, FONT, TYPO } from "./theme"

interface CountdownSectionProps {
  fechaObjetivo: string // ISO 8601 (fecha, hora opcional dentro de la misma cadena)
  horaObjetivo?: string // HH:mm — si se omite, se usa 00:00
  label?: string
}

interface TimeLeft {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

function calcularTiempoRestante(fecha: string, hora: string): TimeLeft {
  const [h, m] = hora.split(":").map(Number)
  const [y, mo, d] = fecha.split("T")[0].split("-").map(Number)
  const objetivo = new Date(y, mo - 1, d, h || 0, m || 0, 0, 0)
  const diferencia = objetivo.getTime() - Date.now()

  if (diferencia <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 }

  return {
    dias: Math.floor(diferencia / 1000 / 60 / 60 / 24),
    horas: Math.floor((diferencia / 1000 / 60 / 60) % 24),
    minutos: Math.floor((diferencia / 1000 / 60) % 60),
    segundos: Math.floor((diferencia / 1000) % 60),
  }
}

export function CountdownSection({ fechaObjetivo, horaObjetivo = "00:00", label = "Faltan" }: CountdownSectionProps) {
  const [tiempo, setTiempo] = useState<TimeLeft>(() =>
    calcularTiempoRestante(fechaObjetivo, horaObjetivo)
  )

  useEffect(() => {
    const id = setInterval(() => {
      setTiempo(calcularTiempoRestante(fechaObjetivo, horaObjetivo))
    }, 1000)
    return () => clearInterval(id)
  }, [fechaObjetivo, horaObjetivo])

  const boxes = [
    { valor: tiempo.dias, unidad: "Días" },
    { valor: tiempo.horas, unidad: "Horas" },
    { valor: tiempo.minutos, unidad: "Min" },
    { valor: tiempo.segundos, unidad: "Seg" },
  ]

  return (
    <section className="flex flex-col items-center gap-20 px-7 p-40 text-center">
      {/* Título "Cuenta regresiva" — H1: absolute-beauty — negro (letras cursivas) */}
      <p
        className="opacity-0 group-data-[opened=true]/invitation:animate-fade-in-up sm:text-center text-left"
        style={{ ...TYPO.h1, color: COLOR.negro, animationDelay: '0.2s' }}
      >
        <span className="block sm:inline">Cuenta</span>
        <span className="block pl-10 sm:inline sm:pl-0"> regresiva</span>
      </p>

      {/* "FALTAN" + cuenta regresiva — agrupados */}
      <div
        className="flex flex-col items-center gap-4 opacity-0 group-data-[opened=true]/invitation:animate-fade-in-up"
        style={{ animationDelay: '0.5s' }}
      >
        <p style={{ ...TYPO.h4, color: COLOR.brown}}>
          {label}
        </p>

        {/* Números con separador ":" */}
        <div className="flex items-end justify-center gap-4">
          {boxes.map((box, i) => (
            <div key={box.unidad} className="flex items-end gap-4">
              {/* Bloque número + etiqueta */}
              <div className="flex flex-col items-center">
                {/* fontSize fuera del inline style para poder sobreescribir con Tailwind */}
                <span
                  className="text-[2.5rem] sm:text-[1.875rem]"
                  style={{ fontFamily: FONT.garamond, fontWeight: 400, lineHeight: 'normal', color: COLOR.darkBrown }}
                >
                  {box.valor.toString().padStart(2, "0")}
                </span>
                <span style={{ ...TYPO.text, color: COLOR.brown }}>
                  {box.unidad}
                </span>
              </div>
              {/* Separador entre bloques, elevado para quedar a la altura del número */}
              {i < boxes.length - 1 && (
                <div className="flex flex-col items-center gap-2 pb-[45px] sm:pb-[35px]">
                  <div style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: COLOR.brown }} />
                  <div style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: COLOR.brown }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* "Te esperamos para celebrar nuestra boda" — H3 */}
      <p
        className="max-w-[220px] opacity-0 group-data-[opened=true]/invitation:animate-fade-in-up"
        style={{ ...TYPO.h3, color: COLOR.brown, animationDelay: '0.8s' }}
      >
        Te esperamos para celebrar nuestra boda
      </p>
    </section>
  )
}
