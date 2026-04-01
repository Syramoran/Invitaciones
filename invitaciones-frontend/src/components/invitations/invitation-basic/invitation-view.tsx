import { useState, useEffect } from "react"
import type { InvitacionPublica, CamposEspecificosBoda } from "@/types/invitation"
import { EnvelopeOverlay } from "./envelope-overlay"
import { MusicPlayer } from "./music-player"
import { HeroSection } from "./hero-section"
import { CountdownSection } from "./countdown-section"
import { InfoSection } from "./info-section"
import { MapSection } from "./map-section"
import { StorySection } from "./story-section"
import { RsvpSection } from "./rsvp-section"

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string // formato: "nombre-apellido" del ?invitado URL param
}

function getTituloInvitacion(invitacion: InvitacionPublica): string {
  const { camposEspecificos, titulo } = invitacion

  if (camposEspecificos?.nombreNovia && camposEspecificos?.nombreNovio) {
    const campos = camposEspecificos as unknown as CamposEspecificosBoda
    return `${campos.nombreNovia} & ${campos.nombreNovio}`
  }

  return titulo
}

export function InvitationView({ invitacion, invitadoParam }: InvitationViewProps) {
  const [showOverlay, setShowOverlay] = useState(true)
  const [autoPlayMusic, setAutoPlayMusic] = useState(false)

  // Extraer color primario con fallback
  const colorPrimario = invitacion?.colorPrimario || "#555555"

  // Aplicar color primario personalizado
  useEffect(() => {
    if (colorPrimario) {
      document.documentElement.style.setProperty(
        "--invitation-primary",
        colorPrimario
      )
    }
    return () => {
      document.documentElement.style.removeProperty("--invitation-primary")
    }
  }, [colorPrimario])

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
      className="min-h-screen bg-[#e8e8e8]"
      style={
        {
          "--invitation-primary": colorPrimario,
        } as React.CSSProperties
      }
    >
      {/* Overlay del sobre */}
      {showOverlay && (
        <EnvelopeOverlay
          titulo={getTituloInvitacion(invitacion)}
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
        <InfoSection invitacion={invitacion} />

        {/* Mapa */}
        <MapSection
          ubicacion={invitacion.ubicacion}
          direccion={invitacion.direccion}
          latitud={invitacion.latitud}
          longitud={invitacion.longitud}
        />

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
          />
        )}

        {/* Footer */}
        <footer className="px-7 pb-10 pt-6 text-center text-[10px] tracking-[0.1em] text-[#777777]">
          Hecho con ♥ ·{" "}
          <a
            href="https://invitaciones.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--invitation-primary)] hover:underline"
          >
            invitaciones.app
          </a>
        </footer>
      </div>
    </div>
  )
}
