import { useState, useEffect } from "react"
import type { InvitacionPublica } from "@/types/invitation"
import { EnvelopeOverlayModerna } from "./envelope-overlay-moderna"
import { MusicPlayer } from "../invitation-basic/music-player"
import { HeroSection } from "./hero-section"
import { CountdownSection } from "./countdown-section"
import { LocationsSection } from "./locations-section"
import { InfoSection } from "./info-section"
import { MapSection } from "./map-section"
import { StorySection } from "./story-section"
import { RegaloSection } from "./regalo-section"
import { RsvpSection } from "./rsvp-section"

// Color de acento por defecto para boda-moderna (gris oscuro minimalista)
const COLOR_DEFAULT = "#4E1319"

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

function getTituloOverlay(invitacion: InvitacionPublica): string {
  const campos = invitacion.camposEspecificos as Record<string, unknown> | null
  const novio1 = campos?.novio1 as string | undefined
  const novio2 = campos?.novio2 as string | undefined
  if (novio1 && novio2) return `${novio1} & ${novio2}`
  return invitacion.titulo
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="mx-auto w-full max-w-[430px]">
        {/* Hero skeleton */}
        <div className="flex flex-col items-center px-7 py-16 gap-5 min-h-screen justify-center">
          <div className="h-4 w-24 rounded bg-neutral-200" />
          <div className="h-4 w-32 rounded bg-neutral-200" />
          <div className="h-14 w-40 rounded bg-neutral-200" />
          <div className="h-3 w-3 rounded bg-neutral-200" />
          <div className="h-14 w-40 rounded bg-neutral-200" />
          <div className="h-4 w-36 rounded bg-neutral-200" />
          <div className="h-[280px] w-[220px] rounded-xl bg-neutral-200" />
        </div>

        {/* Countdown skeleton */}
        <div className="flex justify-center gap-3 px-7 py-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[78px] w-[70px] rounded-lg bg-neutral-200" />
          ))}
        </div>

        {/* Info skeleton */}
        <div className="px-7 py-12 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-11 w-11 rounded-[10px] bg-neutral-200 shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-3 w-16 rounded bg-neutral-200" />
                <div className="h-4 w-40 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function InvitationView({ invitacion, invitadoParam }: InvitationViewProps) {
  const [showOverlay, setShowOverlay] = useState(true)
  const [autoPlayMusic, setAutoPlayMusic] = useState(false)

  const colorAccent = invitacion?.colorPrimario || COLOR_DEFAULT

  useEffect(() => {
    document.documentElement.style.setProperty("--invitation-primary", colorAccent)
    document.documentElement.style.setProperty("--invitation-accent", colorAccent)
    return () => {
      document.documentElement.style.removeProperty("--invitation-primary")
      document.documentElement.style.removeProperty("--invitation-accent")
    }
  }, [colorAccent])

  const handleOpenInvitation = () => {
    setShowOverlay(false)
    if (invitacion?.musica) setAutoPlayMusic(true)
  }

  if (!invitacion) return <SkeletonLoader />

  const tieneCountdown = invitacion.servicios.some(
    (s) =>
      s.nombre.toLowerCase().includes("cuenta regresiva") ||
      s.nombre.toLowerCase().includes("countdown"),
  )

  const campos = (invitacion.camposEspecificos ?? {}) as Record<string, unknown>
  const fechaLimiteConfirmacion = (campos.fechaLimiteConfirmacion as string) || null

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#e8e8e8",
        "--invitation-primary": colorAccent,
        "--invitation-accent": colorAccent,
      } as React.CSSProperties}
    >
      {/* Overlay de bienvenida */}
      {showOverlay && (
        <EnvelopeOverlayModerna
          titulo={getTituloOverlay(invitacion)}
          onOpen={handleOpenInvitation}
          tieneMusica={!!invitacion.musica}
          colorAccent={colorAccent}
        />
      )}

      {/* Reproductor de música */}
      {invitacion.musica && !showOverlay && (
        <MusicPlayer musica={invitacion.musica} autoPlay={autoPlayMusic} />
      )}

      {/* Frame principal (mobile-first, centrado en desktop) */}
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.08)]">
        {/* 1. Hero */}
        <HeroSection invitacion={invitacion} invitadoParam={invitadoParam} />

        {/* 2. Cuenta regresiva */}
        {tieneCountdown && (
          <CountdownSection
            fechaEvento={invitacion.fechaEvento}
            horaEvento={invitacion.horaEvento}
          />
        )}

        {/* 3. Lugares */}
        <LocationsSection invitacion={invitacion} />

        {/* 4. Información (fecha, hora, vestimenta) */}
        <InfoSection invitacion={invitacion} />

        {/* 5. Mapa */}
        <MapSection invitacion={invitacion} />

        {/* 6. Nuestra Historia */}
        {invitacion.historias.length > 0 && (
          <StorySection historias={invitacion.historias} />
        )}

        {/* 6. Mesa de regalos */}
        <RegaloSection invitacion={invitacion} />

        {/* 7. RSVP */}
        {invitacion.tieneConfirmacion && (
          <RsvpSection
            invitacionId={invitacion.id}
            invitadoParam={invitadoParam ?? null}
            mostrarBoton={invitacion.mostrarBotonConfirmar}
            fechaLimite={fechaLimiteConfirmacion}
          />
        )}

        {/* Footer */}
        <footer
          className="px-7 pb-10 pt-6 text-center text-base text-[#999]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <span>Hecho con ♥ · </span>
          <a
            href="https://festeja.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--invitation-primary)" }}
          >
            festeja.app
          </a>
        </footer>
      </div>
    </div>
  )
}
