import { useState, useEffect } from "react"
import type { InvitacionPublica, CamposEspecificosCumple } from "@/types/invitation"
import { EnvelopeOverlay } from "./envelope-overlay"
import { MusicPlayer } from "../invitation-basic/music-player"
import { HeroSection } from "./hero-section"
import { CountdownSection } from "./countdown-section"
import { InfoSection } from "./info-section"
import { MapSection } from "./map-section"
import { StorySection } from "./story-section"
import { RsvpSection } from "./rsvp-section"

const COLOR_DEFAULT = "#B5B5B5"
const DEFAULT_ACCENT = "#555555"

const ACCENT_MAP: Record<string, string> = {
  "#b5b5b5": "#555555",
  "#ffa366": "#cc7033",
  "#edc25e": "#bf930d",
  "#c2d65c": "#618a0f",
  "#5c99d6": "#1466b8",
  "#a285e0": "#5e39ac",
  "#e599bf": "#b72e73",
  "#fb6a6c": "#a3292b",
}

function resolveAccent(bgColor: string | null): string {
  if (!bgColor) return DEFAULT_ACCENT
  return ACCENT_MAP[bgColor.toLowerCase()] ?? DEFAULT_ACCENT
}

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

export function InvitationView({ invitacion, invitadoParam }: InvitationViewProps) {
  const [showOverlay, setShowOverlay] = useState(true)
  const [autoPlayMusic, setAutoPlayMusic] = useState(false)

  const colorBase = invitacion?.colorPrimario || COLOR_DEFAULT
  const colorAccent = resolveAccent(invitacion?.colorPrimario)

  useEffect(() => {
    document.documentElement.style.setProperty("--invitation-primary", colorBase)
    return () => {
      document.documentElement.style.removeProperty("--invitation-primary")
    }
  }, [colorBase])

  const handleOpenInvitation = () => {
    setShowOverlay(false)
    if (invitacion?.musica) setAutoPlayMusic(true)
  }

  if (!invitacion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
          <p className="text-sm text-gray-500">Cargando invitación...</p>
        </div>
      </div>
    )
  }

  const tieneCountdown = invitacion.servicios.some(
    (s) =>
      s.nombre.toLowerCase().includes("cuenta regresiva") ||
      s.nombre.toLowerCase().includes("countdown")
  )

  const campos = (invitacion.camposEspecificos ?? {}) as CamposEspecificosCumple
  const nombreFestejado = campos.nombre || invitacion.titulo

  return (
    <div
      className="min-h-screen bg-[#111111]"
      style={{ "--invitation-primary": colorBase } as React.CSSProperties}
    >
      {/* Overlay de apertura */}
      {showOverlay && (
        <EnvelopeOverlay
          nombre={nombreFestejado}
          tituloEvento={invitacion.titulo}
          edad={campos.edad}
          onOpen={handleOpenInvitation}
          tieneMusica={!!invitacion.musica}
          colorAccent={colorAccent}
        />
      )}

      {/* Reproductor de música */}
      {invitacion.musica && !showOverlay && (
        <MusicPlayer musica={invitacion.musica} autoPlay={autoPlayMusic} />
      )}

      {/* Contenedor principal */}
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#1a1a1a]">
        {/* 1. Hero */}
        <HeroSection
          invitacion={invitacion}
          invitadoParam={invitadoParam}
          colorAccent={colorAccent}
        />

        {/* 2. Cuenta regresiva */}
        {tieneCountdown && (
          <CountdownSection
            fechaEvento={invitacion.fechaEvento}
            horaEvento={invitacion.horaEvento}
          />
        )}

        {/* 3. Información del evento */}
        <InfoSection invitacion={invitacion} colorAccent={colorAccent} />

        {/* 4. Mapa */}
        <MapSection
          ubicacion={invitacion.ubicacion}
          direccion={invitacion.direccion}
          latitud={invitacion.latitud}
          longitud={invitacion.longitud}
          camposEspecificos={invitacion.camposEspecificos}
        />

        {/* 5. Historia */}
        {invitacion.historias.length > 0 && (
          <StorySection historias={invitacion.historias} />
        )}

        {/* 6. RSVP */}
        {invitacion.tieneConfirmacion && (
          <RsvpSection
            invitacionId={invitacion.id}
            invitadoParam={invitadoParam ?? null}
            mostrarBoton={invitacion.mostrarBotonConfirmar}
          />
        )}

        {/* Footer */}
        <footer className="px-7 pb-10 pt-4 text-center text-[10px] text-[#aaa]">
          <span>Hecho con ♥ · </span>
          <a
            href="https://festeja.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: colorAccent }}
          >
            festeja.com.ar
          </a>
        </footer>
      </div>
    </div>
  )
}
