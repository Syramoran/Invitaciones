import { useState, useEffect } from 'react'
import type { InvitacionPublica } from '@/types/invitation'
import { COLOR, TYPO } from './theme'
import { useRevealOnScroll } from './use-reveal-on-scroll'

interface FechaLimiteSectionProps {
  invitacion?: InvitacionPublica
}

function calcularDiasRestantes(fechaStr: string): number {
  const parts = fechaStr.split("T")[0].split("-").map(Number)
  if (parts.length < 3 || parts.some(isNaN)) return 0
  const [y, m, d] = parts
  const objetivo = new Date(y, m - 1, d, 0, 0, 0, 0)
  const ahora = new Date()
  const diffTime = objetivo.getTime() - ahora.getTime()
  if (diffTime <= 0) return 0
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function FechaLimiteSection({ invitacion }: FechaLimiteSectionProps) {
  const campos = (invitacion?.camposEspecificos ?? {}) as Record<string, unknown>
  const fechaLimiteStr = (campos.fechaLimiteConfirmacion as string) || "2027-02-13"

  const [diasRestantes, setDiasRestantes] = useState<number>(() =>
    calcularDiasRestantes(fechaLimiteStr)
  )

  useEffect(() => {
    setDiasRestantes(calcularDiasRestantes(fechaLimiteStr))
    const id = setInterval(() => {
      setDiasRestantes(calcularDiasRestantes(fechaLimiteStr))
    }, 60000)
    return () => clearInterval(id)
  }, [fechaLimiteStr])

  const { ref, inView } = useRevealOnScroll<HTMLDivElement>()

  return (
    <section ref={ref} className="flex flex-col items-center gap-6 px-7 py-40 gap-18 text-center">
      <div className={`flex flex-col items-center gap-12 opacity-0 ${inView ? 'animate-fade-in-up' : ''}`}>
        <h4 className='max-w-[200px]' style={{ ...TYPO.h4, fontSize: 18, color: COLOR.brown }}>
          Fecha límite para confirmar asistencia
        </h4>

        <h1 style={{ ...TYPO.h1, color: COLOR.negro }}>
          13 de febrero
        </h1>
      </div>

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
