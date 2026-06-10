import { useState, useEffect } from "react"
import type { InvitacionPublica, CamposEspecificosBoda } from "@/types/invitation"
import { EnvelopeOverlayClasica } from "./envelope-overlay-clasica"
import { MusicPlayer } from "../invitation-basic/music-player"
import { HeroSection } from "./hero-section"
import { CountdownSection } from "./countdown-section"
import { TaglineSection } from "./tagline-section"
import { LocationsSection } from "./locations-section"
import { InfoSection } from "./info-section"
import { MapSection } from "./map-section"
import { StorySection } from "./story-section"
import { GiftSection } from "./gift-section"
import { RsvpSection } from "./rsvp-section"

// Color fijo dorado para iconos, separadores y recursos de UI
const COLOR_DORADO = "#BD9848"

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

function getTituloOverlay(invitacion: InvitacionPublica): string {
  const campos = invitacion.camposEspecificos as unknown as CamposEspecificosBoda | null
  if (campos?.novio1 && campos?.novio2) {
    return `${campos.novio1} & ${campos.novio2}`
  }
  return invitacion.titulo
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[430px] bg-background animate-pulse">
        {/* Hero skeleton */}
        <div className="flex flex-col items-center px-7 py-16 gap-5 min-h-screen justify-center">
          <div className="h-4 w-24 rounded bg-[#e0d8cc]" />
          <div className="h-9 w-52 rounded bg-[#e0d8cc]" />
          <div className="h-[19rem] w-[13.75rem] rounded-xl bg-[#e0d8cc]" />
          <div className="h-10 w-36 rounded bg-[#e0d8cc]" />
          <div className="h-4 w-4 rounded bg-[#e0d8cc]" />
          <div className="h-10 w-36 rounded bg-[#e0d8cc]" />
          <div className="h-4 w-32 rounded bg-[#e0d8cc]" />
        </div>

        {/* Countdown skeleton */}
        <div className="flex justify-center gap-3 px-7 pb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[4.875rem] w-[3.75rem] rounded-lg bg-[#e0d8cc]" />
          ))}
        </div>

        {/* Info block skeleton */}
        <div className="px-7 py-8 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-11 w-11 rounded-[10px] bg-[#e0d8cc] shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-3 w-16 rounded bg-[#e0d8cc]" />
                <div className="h-4 w-40 rounded bg-[#e0d8cc]" />
              </div>
            </div>
          ))}
        </div>

        {/* Map skeleton */}
        <div className="px-7 pb-8">
          <div className="h-[12rem] w-full rounded-xl bg-[#e0d8cc]" />
          <div className="mt-3 flex gap-2.5">
            <div className="flex-1 h-10 rounded-[30px] bg-[#e0d8cc]" />
            <div className="flex-1 h-10 rounded-[34px] bg-[#e0d8cc]" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main view ───────────────────────────────────────────────────────────────

export function InvitationView({ invitacion, invitadoParam }: InvitationViewProps) {
  const [showOverlay, setShowOverlay] = useState(true)
  const [autoPlayMusic, setAutoPlayMusic] = useState(false)

  // Color de acento: el del pedido si existe, sino gris oscuro para títulos variables
  const colorAccent = invitacion?.colorPrimario || "#333333"

  // Fondo de locaciones: color del pedido si existe, sino dorado — siempre al 20%
  const colorBgLocaciones = hexToRgba(invitacion?.colorPrimario || COLOR_DORADO, 0.2)

  useEffect(() => {
    // Primario (dorado fijo): iconos, separadores, bordes, links
    document.documentElement.style.setProperty("--invitation-primary", COLOR_DORADO)
    // Acento (variable): nombres, títulos de sección destacados
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
      s.nombre.toLowerCase().includes("countdown")
  )

  const campos = (invitacion.camposEspecificos ?? {}) as Record<string, unknown>
  const fechaLimiteConfirmacion = (campos.fechaLimiteConfirmacion as string) || null

  return (
    <div
      className="min-h-screen bg-secondary"
      style={{
        "--invitation-primary": COLOR_DORADO,
        "--invitation-accent": colorAccent,
      } as React.CSSProperties}
    >
      {/* Overlay de bienvenida */}
      {showOverlay && (
        <EnvelopeOverlayClasica
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
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background shadow-[0_0_40px_rgba(0,0,0,0.08)]">
        {/* 1. Hero */}
        <HeroSection invitacion={invitacion} invitadoParam={invitadoParam} />

        {/* 2. Cuenta regresiva */}
        {tieneCountdown && (
          <CountdownSection
            fechaEvento={invitacion.fechaEvento}
            horaEvento={invitacion.horaEvento}
          />
        )}

        {/* 3. Tagline + Dresscode */}
        <TaglineSection invitacion={invitacion} />

        {/* 4. Lugares (oval o full-width) */}
        <LocationsSection invitacion={invitacion} colorBg={colorBgLocaciones} />

        {/* 5. Información (fecha/hora/lugar/vestimenta) */}
        <InfoSection invitacion={invitacion} />

        {/* 6. Mapa */}
        <MapSection invitacion={invitacion} />

        {/* 7. Nuestra Historia */}
        {invitacion.historias.length > 0 && (
          <StorySection historias={invitacion.historias} />
        )}

        {/* 8. Mesa de regalos + Info adicional */}
        <GiftSection invitacion={invitacion} />

        {/* 9. RSVP */}
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
          className="px-7 pb-10 pt-6 text-center text-[10px] text-[#999]"
          style={{ fontFamily: "Lato, sans-serif" }}
        >
          <span>Hecho con ♥ · </span>
          <a
            href="https://festeja.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--invitation-primary)" }}
          >
            festeja.com.ar
          </a>
        </footer>
      </div>
    </div>
  )
}
