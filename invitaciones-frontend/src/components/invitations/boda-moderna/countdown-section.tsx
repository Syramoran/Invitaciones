import { useState, useEffect, Fragment } from "react"

const FONT_BODY = "Montserrat, sans-serif"

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

function calcular(fechaEvento: string, horaEvento: string): TimeLeft {
  const [hora, minuto] = horaEvento.split(":").map(Number)
  const [y, m, d] = fechaEvento.split("T")[0].split("-").map(Number)
  const target = new Date(y, m - 1, d, hora, minuto, 0, 0)
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    dias: Math.floor(diff / 1000 / 60 / 60 / 24),
    horas: Math.floor((diff / 1000 / 60 / 60) % 24),
    minutos: Math.floor((diff / 1000 / 60) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  }
}

function formatFechaEvento(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number)
  const fecha = new Date(y, m - 1, d)
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]
  return `${diasSemana[fecha.getDay()]} ${d} de ${meses[m - 1]}, ${y}`
}

export function CountdownSection({ fechaEvento, horaEvento }: CountdownSectionProps) {
  const [timeLeft, setTimeLeft] = useState(() => calcular(fechaEvento, horaEvento))

  useEffect(() => {
    const interval = setInterval(
      () => setTimeLeft(calcular(fechaEvento, horaEvento)),
      1000,
    )
    return () => clearInterval(interval)
  }, [fechaEvento, horaEvento])

  const units = [
    { valor: timeLeft.dias, label: "Dias" },
    { valor: timeLeft.horas, label: "Horas" },
    { valor: timeLeft.minutos, label: "Min" },
    { valor: timeLeft.segundos, label: "Seg" },
  ]

  return (
    <section
      className="flex flex-col items-center gap-8 px-7 py-14"
      style={{ fontFamily: FONT_BODY }}
    >
      {/* "Faltan" */}
      <p
        style={{
          fontSize: "16px",
          color: "#777777",
          letterSpacing: "0.06em",
          fontWeight: 400,
        }}
      >
        Faltan
      </p>

      {/* Números + etiquetas */}
      <div className="flex items-center justify-center">
        {units.map((unit, i) => (
          <Fragment key={unit.label}>
            <div className="flex flex-col items-center" style={{ minWidth: "56px" }}>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 300,
                  color: "#1a1a1a",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(unit.valor).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#777777",
                  marginTop: "8px",
                  letterSpacing: "0.06em",
                  fontWeight: 400,
                }}
              >
                {unit.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 300,
                  color: "#999999",
                  lineHeight: 1,
                  margin: "0 2px",
                  paddingBottom: "20px",
                }}
              >
                :
              </span>
            )}
          </Fragment>
        ))}
      </div>

      {/* Te esperamos */}
      <div className="flex flex-col items-center gap-2 text-center pt-8" style={{ marginTop: "8px" }}>
        <p
          style={{
            fontSize: "22px",
            fontWeight: 400,
            color: "#1a1a1a",
            lineHeight: 1.4,
          }}
        >
          Te esperamos para
          <br />
          celebrar nuestra boda
        </p>
        <p
          style={{
            fontSize: "16px",
            color: "#777777",
            fontWeight: 400,
            marginTop: "4px",
          }}
        >
          {formatFechaEvento(fechaEvento)}
        </p>
      </div>
    </section>
  )
}
