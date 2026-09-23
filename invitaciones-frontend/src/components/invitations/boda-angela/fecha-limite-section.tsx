import { useState, useEffect } from 'react'
import type { InvitacionPublica } from '@/types/invitation'
import { COLOR, TYPO } from './theme'
import { useRevealOnScroll } from './use-reveal-on-scroll'

interface FechaLimiteSectionProps {
  invitacion?: InvitacionPublica
}

// Argentina es UTC-3 todo el año (no tiene horario de verano) — se fija el
// offset en vez de confiar en la zona horaria del entorno donde corra el JS
// (el navegador del invitado, o eventualmente un server de Vercel en UTC).
export const ARGENTINA_UTC_OFFSET_HORAS = 3

const FECHA_LIMITE_FALLBACK = "2027-02-01"

export function obtenerFechaLimiteStr(invitacion?: Pick<InvitacionPublica, 'camposEspecificos'> | null): string {
  const campos = (invitacion?.camposEspecificos ?? {}) as Record<string, unknown>
  return (campos.fechaLimiteConfirmacion as string) || FECHA_LIMITE_FALLBACK
}

interface FechaYMD {
  y: number
  m: number
  d: number
}

function parseFechaYMD(fechaStr: string): FechaYMD | null {
  const parts = fechaStr.split("T")[0].split("-").map(Number)
  if (parts.length < 3 || parts.some(isNaN)) return null
  const [y, m, d] = parts
  return { y, m, d }
}

// Fecha (año/mes/día) de "ahora" según la hora de Argentina, sin importar
// la zona horaria del navegador del invitado o del server que ejecute esto.
function hoyEnArgentina(): FechaYMD {
  const shifted = new Date(Date.now() - ARGENTINA_UTC_OFFSET_HORAS * 60 * 60 * 1000)
  return { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth() + 1, d: shifted.getUTCDate() }
}

function compararYMD(a: FechaYMD, b: FechaYMD): number {
  if (a.y !== b.y) return a.y - b.y
  if (a.m !== b.m) return a.m - b.m
  return a.d - b.d
}

export type EstadoFechaLimite = 'antes' | 'hoy' | 'vencido'

// El día límite en sí cuenta completo como día hábil para confirmar — recién
// pasa a "vencido" al empezar el día siguiente (hora Argentina).
export function estadoFechaLimite(fechaStr: string): EstadoFechaLimite {
  const limite = parseFechaYMD(fechaStr)
  if (!limite) return 'vencido'
  const cmp = compararYMD(hoyEnArgentina(), limite)
  if (cmp < 0) return 'antes'
  if (cmp === 0) return 'hoy'
  return 'vencido'
}

export function haPasadoFechaLimite(fechaStr: string): boolean {
  return estadoFechaLimite(fechaStr) === 'vencido'
}

export function calcularDiasRestantes(fechaStr: string): number {
  const limite = parseFechaYMD(fechaStr)
  if (!limite) return 0
  const hoy = hoyEnArgentina()
  const hoyUTC = Date.UTC(hoy.y, hoy.m - 1, hoy.d)
  const limiteUTC = Date.UTC(limite.y, limite.m - 1, limite.d)
  const dias = Math.round((limiteUTC - hoyUTC) / (1000 * 60 * 60 * 24))
  return dias > 0 ? dias : 0
}

export function FechaLimiteSection({ invitacion }: FechaLimiteSectionProps) {
  const fechaLimiteStr = obtenerFechaLimiteStr(invitacion)

  const [diasRestantes, setDiasRestantes] = useState<number>(() =>
    calcularDiasRestantes(fechaLimiteStr)
  )
  const [estado, setEstado] = useState<EstadoFechaLimite>(() => estadoFechaLimite(fechaLimiteStr))

  useEffect(() => {
    const actualizar = () => {
      setDiasRestantes(calcularDiasRestantes(fechaLimiteStr))
      setEstado(estadoFechaLimite(fechaLimiteStr))
    }
    actualizar()
    const id = setInterval(actualizar, 60000)
    return () => clearInterval(id)
  }, [fechaLimiteStr])

  const { ref, inView } = useRevealOnScroll<HTMLDivElement>()

  if (estado === 'vencido') return null

  return (
    <section ref={ref} className="flex flex-col items-center gap-6 px-7 py-40 gap-18 text-center">
      <div className={`flex flex-col items-center gap-12 opacity-0 ${inView ? 'animate-fade-in-up' : ''}`}>
        <h4 className='max-w-[200px]' style={{ ...TYPO.h4, fontSize: 18, color: COLOR.brown }}>
          Fecha límite para confirmar asistencia
        </h4>

        <h1 style={{ ...TYPO.h1, color: COLOR.negro }}>
          1 de febrero
        </h1>
      </div>

      {estado === 'antes' && (
        <div
          className={`flex flex-col items-center gap-2 opacity-0 ${inView ? 'animate-fade-in-up' : ''}`}
          style={{ animationDelay: '0.2s' }}
        >
          <p style={{ ...TYPO.h4, fontSize: 18, color: COLOR.brown }}>
            Faltan
          </p>

          <span style={{ ...TYPO.numero, color: COLOR.brown }}>
            {diasRestantes}
          </span>

          <p style={{ ...TYPO.h4, fontSize: 18, color: COLOR.brown }}>
            días
          </p>
        </div>
      )}

      <svg
        width="75"
        height="75"
        viewBox="0 0 61.2 60.3422"
        fill="none"
        aria-hidden="true"
        className={`mt-4 opacity-0 ${inView ? 'animate-fade-in-up' : ''}`}
        style={{ animationDelay: '0.4s' }}
      >
        <path
          d="M37.5545 13.1001C34.3594 13.0753 31.0091 18.1323 31.0091 18.1323C31.0091 18.1323 27.6588 13.1009 24.4636 13.1001C19.5545 13.0988 17.1 16.4561 17.1 21.4872C17.1 28.1955 31.0091 39.1 31.0091 39.1C31.0091 39.1 44.1 28.248 44.1 21.4872C44.1 16.4538 42.4636 13.1382 37.5545 13.1001Z"
          fill={COLOR.brown}
          stroke={COLOR.brown}
        />
      </svg>
    </section>
  )
}
