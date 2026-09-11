import { useState, useEffect } from 'react'
import type { InvitacionPublica, CamposEspecificosBoda } from '@/types/invitation'
import { EnvelopeOverlayAngela } from './envelope-overlay-angela'
import { MusicPlayer } from '../invitation-basic/music-player'
import { Reveal } from './reveal'
import { HeroSection } from './hero-section'
import { CountdownSection } from './countdown-section'
import { EventInfoSection } from './event-info-section'
import { LocationsSection } from './locations-section'
import { MapSection } from './map-section'
import { NoteSection } from './note-section'
import { DresscodeSection } from './dresscode-section'
import { GiftSection } from './gift-section'
import { RsvpSection } from './rsvp-section'
import { COLOR, TYPO } from './theme'

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
  previewMode?: boolean
}

function getTituloOverlay(invitacion: InvitacionPublica): string {
  const campos = invitacion.camposEspecificos as unknown as CamposEspecificosBoda | null
  if (campos?.novio1 && campos?.novio2) {
    return `${campos.novio1} y ${campos.novio2}`
  }
  return invitacion.titulo
}

function Divisor() {
  return <div aria-hidden="true" className="mx-auto h-px w-[90%] sm:w-[75%]" style={{ backgroundColor: COLOR.brown }} />
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
  const [showOverlay, setShowOverlay] = useState(!previewMode)
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

  if (!invitacion) return <SkeletonLoader />

  const tieneCountdown = invitacion.servicios.some(
    (s) =>
      s.nombre.toLowerCase().includes('cuenta regresiva') ||
      s.nombre.toLowerCase().includes('countdown')
  )

  const campos = (invitacion.camposEspecificos ?? {}) as Record<string, unknown>
  const fechaLimiteConfirmacion = (campos.fechaLimiteConfirmacion as string) || null

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: COLOR.crema }}>
      <img
        src="/boda-angela/textura-inv.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 w-full h-auto select-none"
        style={{
          opacity: 0.7,
        }}
      />
      {/* Fondo mobile — solo visible en pantallas pequeñas */}
      <img
        src="/boda-angela/sections-bg-mobile2.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 w-full h-full object-cover select-none sm:hidden"
      />
      {showOverlay && (
        <EnvelopeOverlayAngela
          titulo={getTituloOverlay(invitacion)}
          onOpen={handleOpenInvitation}
          tieneMusica={!!invitacion.musica}
        />
      )}

      {invitacion.musica && !showOverlay && (
        <MusicPlayer musica={invitacion.musica} autoPlay={autoPlayMusic} />
      )}

      <div className="relative mx-auto min-h-screen overflow-hidden ">
        <div
          className="group/invitation relative z-10 flex flex-col items-center md:mt-4 mx-auto w-full max-w-[750px] bg-transparent "
          data-opened={String(!showOverlay)}
        >
          <HeroSection invitacion={invitacion} isOpened={!showOverlay} />
          {tieneCountdown && (
            <Reveal>
              <CountdownSection
                fechaObjetivo={invitacion.fechaEvento}
                horaObjetivo={invitacion.horaEvento}
              />
            </Reveal>
          )}


          {/* <LocationsSection invitacion={invitacion} />

          <MapSection invitacion={invitacion} />

          <Divisor />
          <NoteSection invitacion={invitacion} />

          <Divisor />
          <DresscodeSection />

          <Divisor />
          <GiftSection invitacion={invitacion} />

          {fechaLimiteConfirmacion && (
            <>
              <Divisor />
              <CountdownSection fechaObjetivo={fechaLimiteConfirmacion} label="Faltan" />
            </>
          )}

          {invitacion.tieneConfirmacion && (
            <>
              <Divisor />
              <RsvpSection
                invitacionId={invitacion.id}
                invitadoParam={invitadoParam ?? null}
                mostrarBoton={invitacion.mostrarBotonConfirmar}
              />
            </>
          )} */}

          <footer
            className="px-7 pb-10 pt-6 text-center"
            style={{ ...TYPO.text3, color: COLOR.brown }}
          >
            <span>Hecho con </span>
            <a
              href="https://festeja.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: COLOR.darkBrown }}
            >
              festeja.com.ar
            </a>
          </footer>
        </div>
      </div>
    </div>
  )
}
