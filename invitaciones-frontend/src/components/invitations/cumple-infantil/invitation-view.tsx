import { useState, useEffect } from "react"
import type { InvitacionPublica } from "@/types/invitation"
import { getAccentColor, PALETTES } from "./colors"
import { EnvelopeOverlay } from "./envelope-overlay"
import { MusicPlayer } from "./music-player"
import { HeroSection } from "./hero-section"
import { CountdownSection } from "./countdown-section"
import { InfoSection } from "./info-section"
import { MapSection } from "./map-section"
import { StorySection } from "./story-section"
import { RsvpSection } from "./rsvp-section"

const ACCENT_BORDER: Record<string, string> = {
  "#da8f0b": "#F7A921",
  "#cb4d4d": "#F5ADA3",
  "#849b4b": "#C4D98D",
  "#4d99b2": "#8DCCD9",
  "#7a5eba": "#D3C0E7",
  "#d775b6": "#E7C0DA",
}
function resolveOuterBg(primary: string | null): string {
  if (!primary) return "#F7A921"
  return ACCENT_BORDER[primary.toLowerCase()] ?? "#F7A921"
}

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

export function InvitationView({ invitacion, invitadoParam }: InvitationViewProps) {
  const [showOverlay, setShowOverlay] = useState(true)
  const [autoPlayMusic, setAutoPlayMusic] = useState(false)

  // Extraer colores con fallback a la primera paleta
  const colorPrimario = invitacion?.colorPrimario || PALETTES[0].primary
  const colorAcento = getAccentColor(invitacion?.colorPrimario)
  const outerBg = resolveOuterBg(invitacion?.colorPrimario ?? null)

  // Aplicar variables CSS de color
  useEffect(() => {
    document.documentElement.style.setProperty("--invitation-primary", colorPrimario)
    document.documentElement.style.setProperty("--invitation-accent", colorAcento)
    return () => {
      document.documentElement.style.removeProperty("--invitation-primary")
      document.documentElement.style.removeProperty("--invitation-accent")
    }
  }, [colorPrimario, colorAcento])

  const handleOpenInvitation = () => {
    setShowOverlay(false)
    if (invitacion?.musica) {
      setAutoPlayMusic(true)
    }
  }

  // Guard: si no hay invitación, mostrar loading (después de todos los hooks)
  if (!invitacion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e8e8e8]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
          <p className="text-sm text-gray-500">Cargando invitación...</p>
        </div>
      </div>
    )
  }

  // Verificar qué servicios están habilitados
  const tieneCountdown = invitacion.servicios.some(
    (s) => s.nombre.toLowerCase().includes("cuenta regresiva") ||
           s.nombre.toLowerCase().includes("countdown")
  )
  const tieneConfirmacion = invitacion.tieneConfirmacion

  return (
    <div
      className="min-h-screen"
      style={
        {
          background: outerBg,
          "--invitation-primary": colorPrimario,
          "--invitation-accent": colorAcento,
          "--font-infantil-display": "'Baloo 2', sans-serif",
          "--font-infantil-body": "'Nunito', sans-serif",
        } as React.CSSProperties
      }
    >
      {/* Overlay del sobre */}
      {showOverlay && (
        <EnvelopeOverlay
          titulo={invitacion.titulo}
          onOpen={handleOpenInvitation}
          tieneMusica={!!invitacion.musica}
        />
      )}

      {/* Reproductor de música */}
      {invitacion.musica && !showOverlay && (
        <MusicPlayer musica={invitacion.musica} autoPlay={autoPlayMusic} />
      )}

      {/* Contenedor principal (frame de celular) */}
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white">
        {/* Hero */}
        <HeroSection invitacion={invitacion} />

        {/* Countdown (si el servicio está habilitado) */}
        {tieneCountdown && (
          <CountdownSection
            fechaEvento={invitacion.fechaEvento}
            horaEvento={invitacion.horaEvento}
          />
        )}

        {/* Información del evento */}
        <InfoSection invitacion={invitacion} accentColor={colorPrimario} />

        {/* Mapa */}
        <MapSection invitacion={invitacion} accentColor={colorPrimario} />

        {/* Historia */}
        {invitacion.historias.length > 0 && (
          <StorySection historias={invitacion.historias} />
        )}

        {/* RSVP / Confirmación (si el servicio está habilitado) */}
        {tieneConfirmacion && (
          <RsvpSection
            invitacionId={invitacion.id}
            invitadoParam={invitadoParam ?? null}
            mostrarBoton={invitacion.mostrarBotonConfirmar}
            accentColor={colorPrimario}
          />
        )}

        {/* Footer */}
        <footer className="px-7 pb-10 pt-6 text-center text-[10px] tracking-[0.1em] text-[#777777]">
          Hecho con ♥ ·{" "}
          <a
            href="https://festeja.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--invitation-primary)] hover:underline"
          >
            festeja.com.ar
          </a>
        </footer>
      </div>
    </div>
  )
}
