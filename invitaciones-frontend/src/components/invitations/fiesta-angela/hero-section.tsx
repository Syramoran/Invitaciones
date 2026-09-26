import { useState, useEffect } from 'react'
import type { InvitacionPublica, CamposEspecificosBoda } from '@/types/invitation'
import { COLOR, TYPO } from './theme'

interface HeroSectionProps {
  invitacion?: InvitacionPublica
  invitadoParam?: string | null
  isOpened?: boolean
}

export function HeroSection({
  invitacion,
  invitadoParam: _invitadoParam,
  isOpened = true,
}: HeroSectionProps = {}) {
  const [animKey, setAnimKey] = useState<number | null>(() => (isOpened ? Date.now() : null))

  useEffect(() => {
    if (isOpened && !animKey) {
      setAnimKey(Date.now())
    }
  }, [isOpened, animKey])
  const campos = (invitacion?.camposEspecificos ?? {}) as Partial<CamposEspecificosBoda>
  const nombreNovio1 = campos?.novio1 || 'Angela'
  const nombreNovio2 = campos?.novio2 || 'Francisco'
  const titulo = invitacion?.titulo || `${nombreNovio1} y ${nombreNovio2}`
  const esBoda = Boolean(campos?.novio1 && campos?.novio2) || true
  const altFoto = `${nombreNovio1} y ${nombreNovio2}`

  const generarLinkCalendario = () => {
    if (!invitacion?.fechaEvento) return undefined
    const [year, month, day] = invitacion.fechaEvento.split('T')[0].split('-').map(Number)
    const inicio = new Date(year, month - 1, day)
    const fin = new Date(year, month - 1, day + 1)
    const fmt = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: 'Boda Angie y Fran',
      dates: `${fmt(inicio)}/${fmt(fin)}`,
      details: '¡Nos casamos! Queremos compartir este día tan especial junto a vos. Te esperamos para celebrar nuestra boda.',
      location:
        invitacion.ubicacion === 'multiple'
          ? ''
          : `${invitacion.ubicacion}, ${invitacion.direccion}`,
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  return (
    <section className="relative z-10 flex w-full flex-col items-center gap-2 bg-transparent shadow-md text-center md:max-w-[620px] md:shadow-none pb-8">
      {/* Fondo responsive */}
      <picture className="pointer-events-none absolute inset-0 -z-10 block h-full w-full select-none">
        <source media="(min-width: 768px)" srcSet="/fiesta-angela/s-t-d/std-bg.webp" />
        <img
          src="/fiesta-angela/s-t-d/Std-bg-mobile.webp"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-top"
        />
      </picture>

      <div className="mt-6 w-[200px] max-w-[75%] aspect-[291.77/97.96] -rotate-[-7deg] md:rotate-0 md:mt-6 md:mb-0 md:self-start md:ml-8 md:w-[250px]">
        {isOpened && animKey ? (
          <img
            key={animKey}
            src={`/fiesta-angela/std_animated.svg?t=${animKey}`}
            alt="Save the date"
            className="w-full h-auto"
          />
        ) : null}
      </div>

      <div className="opacity-0 group-data-[opened=true]/invitation:animate-fade-in-up md:mt-2 w-[340px] max-w-[85%]" style={{ animationDelay: '0.3s' }}>
        <picture>
          <source media="(min-width: 640px)" srcSet="/fiesta-angela/s-t-d/std_mobile.webp" />
          <img
            src="/fiesta-angela/s-t-d/std_mobile.webp"
            alt={altFoto}
            className="h-auto w-full"
            loading="lazy"
          />
        </picture>
      </div>

      <div className="mt-2 opacity-0 group-data-[opened=true]/invitation:animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        {esBoda ? (
          <h1
            className="max-w-[22rem] break-words"
            style={{ ...TYPO.h1, color: COLOR.negro, lineHeight: 0.9 }}
          >
            {nombreNovio1} y {nombreNovio2}
          </h1>
        ) : (
          <h1
            className="max-w-[22rem] break-words"
            style={{ ...TYPO.h1, color: COLOR.negro, lineHeight: 0.9 }}
          >
            {titulo}
          </h1>
        )}
      </div>

      <div
        className="mt-4 mb-3 flex flex-col items-center gap-2 opacity-0 group-data-[opened=true]/invitation:animate-fade-in-up"
        style={{ color: COLOR.darkBrown, animationDelay: '0.9s' }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{ ...TYPO.h2, color: COLOR.darkBrown, fontSize: 22, letterSpacing: 'normal', lineHeight: 1 }}
          >
            SÁBADO
          </span>
          <span
            style={{ ...TYPO.numero, fontSize: 62, color: COLOR.brown, lineHeight: 1 }}
          >
            20
          </span>
          <span
            style={{ ...TYPO.h2, color: COLOR.darkBrown, fontSize: 22, letterSpacing: 'normal', lineHeight: 1 }}
          >
            FEBRERO
          </span>
        </div>
        <div className="w-full h-[0.7px]" style={{ backgroundColor: COLOR.darkBrown }} />
        <span
          style={{ ...TYPO.horarios, fontSize: 30, letterSpacing: '0.2em', color: COLOR.brown, textTransform: 'uppercase' }}
        >
          2027
        </span>
      </div>

      <button
        onClick={() => {
          const link = generarLinkCalendario()
          if (link) window.open(link, '_blank')
        }}
        className="mb-10 mt-6 flex items-center gap-2 rounded-sm px-4 py-2 cursor-pointer transition hover:opacity-85 opacity-0 group-data-[opened=true]/invitation:animate-fade-in-up"
        style={{ ...TYPO.text, backgroundColor: COLOR.crema, color: COLOR.darkBrown, letterSpacing: '0.03em', animationDelay: '1.2s' }}
      >
        <img src="/fiesta-angela/vector-date.svg" alt="" className="h-[20px] w-[20px]" />
        Agendar en calendario
      </button>
    </section>
  )
}
