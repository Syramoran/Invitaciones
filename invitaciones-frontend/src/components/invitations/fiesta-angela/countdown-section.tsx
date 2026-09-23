import { useState, useEffect } from "react"
import { COLOR, FONT, TYPO } from "./theme"
import { estadoFechaLimite as estadoDelDia, ARGENTINA_UTC_OFFSET_HORAS } from "./fecha-limite-section"

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

type EstadoCountdown = "antes" | "hoy" | "despues"

// El evento ocurre a la hora indicada en Argentina, sin importar en qué
// zona horaria esté el dispositivo de quien mira la invitación (hay
// invitados en el extranjero) — antes esto se construía con el
// constructor local de Date, que interpreta y/m/d/h/m en la zona horaria
// del navegador, corriendo la cuenta regresiva varias horas para cualquiera
// que no esté en UTC-3. Mismo offset fijo que usa fecha-limite-section.tsx.
function calcularDiferenciaMs(fecha: string, hora: string): number {
  const [h, m] = hora.split(":").map(Number)
  const [y, mo, d] = fecha.split("T")[0].split("-").map(Number)
  const objetivoUTC = Date.UTC(y, mo - 1, d, (h || 0) + ARGENTINA_UTC_OFFSET_HORAS, m || 0, 0, 0)
  return objetivoUTC - Date.now()
}

function calcularTiempoRestante(diferencia: number): TimeLeft {
  if (diferencia <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 }

  return {
    dias: Math.floor(diferencia / 1000 / 60 / 60 / 24),
    horas: Math.floor((diferencia / 1000 / 60 / 60) % 24),
    minutos: Math.floor((diferencia / 1000 / 60) % 60),
    segundos: Math.floor((diferencia / 1000) % 60),
  }
}

// 'antes' mientras no se llegó a la hora exacta del evento; una vez llegada,
// 'hoy' o 'despues' según el día calendario (Argentina) siga siendo el del
// evento o ya haya pasado — así "Gracias por asistir" no aparece en medio
// de la fiesta, solo al otro día.
function calcularEstadoCountdown(fecha: string, diferencia: number): EstadoCountdown {
  if (diferencia > 0) return "antes"
  return estadoDelDia(fecha) === "vencido" ? "despues" : "hoy"
}

export function CountdownSection({ fechaObjetivo, horaObjetivo = "00:00", label = "Faltan" }: CountdownSectionProps) {
  const [diferencia, setDiferencia] = useState<number>(() =>
    calcularDiferenciaMs(fechaObjetivo, horaObjetivo)
  )

  useEffect(() => {
    const actualizar = () => setDiferencia(calcularDiferenciaMs(fechaObjetivo, horaObjetivo))
    actualizar()
    const id = setInterval(actualizar, 1000)
    return () => clearInterval(id)
  }, [fechaObjetivo, horaObjetivo])

  const estado = calcularEstadoCountdown(fechaObjetivo, diferencia)

  if (estado === "despues") {
    return (
      <section className="flex flex-col items-center gap-6 px-7 p-40 text-center">
        <p
          className="opacity-0 group-data-[opened=true]/invitation:animate-fade-in-up"
          style={{ ...TYPO.h1, color: COLOR.negro }}
        >
          Gracias por asistir
        </p>
      </section>
    )
  }

  if (estado === "hoy") {
    return (
      <section className="flex flex-col items-center gap-10 px-7 p-40 text-center">
        <p
          className="opacity-0 group-data-[opened=true]/invitation:animate-fade-in-up"
          style={{ ...TYPO.h1, color: COLOR.negro }}
        >
          ¡Es hoy!
        </p>
        <p
          className="max-w-[220px] opacity-0 group-data-[opened=true]/invitation:animate-fade-in-up"
          style={{ ...TYPO.h3, color: COLOR.brown, animationDelay: '0.3s' }}
        >
          Te esperamos para celebrar nuestra boda
        </p>
      </section>
    )
  }

  const tiempo = calcularTiempoRestante(diferencia)

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
