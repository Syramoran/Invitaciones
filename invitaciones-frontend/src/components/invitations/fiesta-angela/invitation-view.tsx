import { useState, useEffect } from 'react'
import type { InvitacionPublica } from '@/types/invitation'
import { EnvelopeOverlayAngela } from './envelope-overlay-angela'
import { MusicPlayerAngela } from './music-player-angela'
import { Reveal } from './reveal'
import { useRevealOnScroll } from './use-reveal-on-scroll'
import { HeroSection } from './hero-section'
import { CountdownSection } from './countdown-section'
import { CeremoniaSection } from './ceremonia-section'
import { CenaSection } from './cena-section'
import { DetallesSection } from './detalles-section'
import { FechaLimiteSection } from './fecha-limite-section'
import { RsvpSection } from './rsvp-section'
import { COLOR, TYPO } from './theme'

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
  previewMode?: boolean
}

function Divisor() {
  const { ref, inView } = useRevealOnScroll<HTMLDivElement>()
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="mx-auto w-[90%] sm:w-[75%] origin-center"
      style={{
        borderTop: `1px solid ${COLOR.brown}`,
        transform: inView ? 'scaleX(1)' : 'scaleX(0)',
        opacity: inView ? 1 : 0,
        transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease',
      }}
    />
  )
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLOR.parchment }}>
      <div className="mx-auto w-full max-w-[430px] animate-pulse">
        <div className="flex flex-col items-center gap-5 px-7 py-16 min-h-screen justify-center">
          <div className="h-4 w-24 rounded" style={{ backgroundColor: COLOR.crema }} />
          <div className="h-9 w-52 rounded" style={{ backgroundColor: COLOR.crema }} />
          <div className="h-[19rem] w-[18rem] rounded-sm" style={{ backgroundColor: COLOR.crema }} />
          <div className="h-10 w-36 rounded" style={{ backgroundColor: COLOR.crema }} />
        </div>
      </div>
    </div>
  )
}

export function InvitationView({
  invitacion,
  invitadoParam,
  previewMode = false,
}: InvitationViewProps) {
  const campos = (invitacion?.camposEspecificos ?? {}) as Record<string, unknown>
  // Modo "save the date": el cliente pide mostrar solo el hero (sin sobre ni
  // música) hasta cierta fecha, y recién después habilitar la invitación
  // completa. Por default (campo no seteado) se muestra completa.
  const invitacionCompleta = String(campos.invitacionCompleta) !== 'false'

  const [showOverlay, setShowOverlay] = useState(!previewMode && invitacionCompleta)
  // Separado de showOverlay a propósito: se activa apenas arranca la animación
  // de apertura del sobre, para que el hero empiece a aparecer en simultáneo
  // con las piezas del sobre alejándose (no recién cuando el sobre termina de desmontarse).
  const [heroRevealed, setHeroRevealed] = useState(previewMode || !invitacionCompleta)
  const [autoPlayMusic, setAutoPlayMusic] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty('--invitation-primary', COLOR.brown)
    document.documentElement.style.setProperty('--invitation-accent', COLOR.brown)
    return () => {
      document.documentElement.style.removeProperty('--invitation-primary')
      document.documentElement.style.removeProperty('--invitation-accent')
    }
  }, [])

  const handleOpenInvitation = () => {
    setShowOverlay(false)
    if (invitacion?.musica) setAutoPlayMusic(true)
  }

  const handleRevealStart = () => setHeroRevealed(true)

  if (!invitacion) return <SkeletonLoader />

  const tieneCountdown = invitacion.servicios.some(
    (s) =>
      s.nombre.toLowerCase().includes('cuenta regresiva') ||
      s.nombre.toLowerCase().includes('countdown')
  )

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: COLOR.parchment }}>
      {/* Textura de fondo — un solo <picture> para que el navegador baje
          nada más que la imagen que corresponde (antes se bajaban las dos,
          siempre, sin importar el dispositivo). */}
      <picture
        className="pointer-events-none absolute inset-0 block h-full w-full select-none"
        aria-hidden="true"
      >
        <source media="(max-width: 639px)" srcSet="/fiesta-angela/sections-bg-mobile2.webp" />
        <img
          src="/fiesta-angela/textura-inv.webp"
          alt=""
          className="h-full w-full object-cover"
          style={{
            opacity: 0.7,
            mixBlendMode: 'multiply',
          }}
        />
      </picture>
      {invitacionCompleta && showOverlay && (
        <EnvelopeOverlayAngela
          invitacion={invitacion}
          onOpen={handleOpenInvitation}
          onRevealStart={handleRevealStart}
        />
      )}

      {invitacionCompleta && invitacion.musica && !showOverlay && (
        <MusicPlayerAngela musica={invitacion.musica} autoPlay={autoPlayMusic} />
      )}

      <div className="relative mx-auto min-h-screen overflow-hidden ">
        <div
          className="group/invitation relative z-10 flex flex-col items-center md:mt-4 mx-auto w-full max-w-[750px] bg-transparent "
          data-opened={String(heroRevealed)}
        >
          <HeroSection invitacion={invitacion} isOpened={heroRevealed} />

          {invitacionCompleta && (
            <>
              {tieneCountdown && (
                <Reveal>
                  <CountdownSection
                    fechaObjetivo={invitacion.fechaEvento}
                    horaObjetivo={invitacion.horaEvento}
                  />
                </Reveal>
              )}

              <Divisor />

              <Reveal>
                <CeremoniaSection invitacion={invitacion} />
              </Reveal>

              <Divisor />

              <Reveal>
                <CenaSection invitacion={invitacion} />
              </Reveal>

              <Divisor />

              <Reveal>
                <DetallesSection invitacion={invitacion} />
              </Reveal>

              <Divisor />

              <Reveal>
                <FechaLimiteSection invitacion={invitacion} />
              </Reveal>

              <Divisor />

              <Reveal>
                <RsvpSection invitacion={invitacion} invitadoParam={invitadoParam} />
              </Reveal>

              <Divisor />

              <footer
                className="px-7 pb-10 pt-6 text-center"
                style={{ ...TYPO.text3, color: COLOR.brown }}
              >
                {/* <span>Hecho con </span> */}
                <a
                  href="https://festeja.com.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: COLOR.brown }}
                >
                  festeja.com.ar
                </a>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
