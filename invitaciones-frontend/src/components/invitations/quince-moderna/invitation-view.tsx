import { useState, useEffect } from "react"
import type { InvitacionPublica, CamposEspecificosQuince } from "@/types/invitation"
import { EnvelopeOverlayModerna } from "./envelope-overlay"
import { MusicPlayer } from "../invitation-basic/music-player"
import { HeroSection } from "./hero-section"
import { CountdownSection } from "./countdown-section"
import { InfoSection } from "./info-section"
import { MapSection } from "./map-section"
import { StorySection } from "./story-section"
import { RsvpSection } from "./rsvp-section"

// ─── Color palette ────────────────────────────────────────────────────────────

const COLOR_DEFAULT = "#BD9848" // Dorado

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-[#090819]">
      <div className="mx-auto w-full max-w-[430px] animate-pulse">
        <div className="flex flex-col items-center px-7 py-20 gap-5 justify-center">
          <div className="h-10 w-16 rounded bg-white/10" />
          <div className="h-14 w-48 rounded bg-white/10" />
          <div className="h-3 w-32 rounded bg-white/10" />
          <div className="h-[14rem] w-[12rem] rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  )
}

// ─── Main view ───────────────────────────────────────────────────────────────

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
  previewMode?: boolean
}

export function InvitationView({ invitacion, invitadoParam, previewMode = false }: InvitationViewProps) {
  const [showOverlay, setShowOverlay] = useState(!previewMode)
  const [autoPlayMusic, setAutoPlayMusic] = useState(false)

  const colorAccent = invitacion?.colorPrimario || COLOR_DEFAULT
  const colorBorder = hexToRgba(colorAccent, 0.22)

  useEffect(() => {
    document.documentElement.style.setProperty("--invitation-primary", colorAccent)
    document.documentElement.style.setProperty("--invitation-border", colorBorder)
    return () => {
      document.documentElement.style.removeProperty("--invitation-primary")
      document.documentElement.style.removeProperty("--invitation-border")
    }
  }, [colorAccent, colorBorder])

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

  const campos = (invitacion.camposEspecificos ?? {}) as CamposEspecificosQuince
  const fechaLimiteConfirmacion = (campos as Record<string, unknown>)
    .fechaLimiteConfirmacion as string | null ?? null
  const nombreQuince = campos.nombre || invitacion.titulo

  return (
    <div className="min-h-screen bg-[#0A0B14]">
      {/* Opening overlay */}
      {showOverlay && (
        <EnvelopeOverlayModerna
          nombre={nombreQuince}
          tituloEvento={invitacion.titulo}
          onOpen={handleOpenInvitation}
          tieneMusica={!!invitacion.musica}
          colorAccent={colorAccent}
        />
      )}

      {/* Music player */}
      {invitacion.musica && !showOverlay && (
        <MusicPlayer musica={invitacion.musica} autoPlay={autoPlayMusic} />
      )}

      {/* Invitation frame */}
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#090819] shadow-[0_0_40px_rgba(0,0,0,0.06)]">
        {/* 1. Hero */}
        <HeroSection
          invitacion={invitacion}
          invitadoParam={invitadoParam}
          colorAccent={colorAccent}
        />

        {/* 2. Countdown */}
        {tieneCountdown && (
          <CountdownSection
            fechaEvento={invitacion.fechaEvento}
            horaEvento={invitacion.horaEvento}
          />
        )}

        {/* 3. Información del evento */}
        <InfoSection invitacion={invitacion} />

        {/* 4. Mapa */}
        <MapSection invitacion={invitacion} />

        {/* 5. Historia */}
        {invitacion.historias.length > 0 && (
          <StorySection historias={invitacion.historias}/>
        )}

        {/* 6. RSVP */}
        {invitacion.tieneConfirmacion && (
          <RsvpSection
            invitacionId={invitacion.id}
            invitadoParam={invitadoParam ?? null}
            mostrarBoton={invitacion.mostrarBotonConfirmar}
            fechaLimite={fechaLimiteConfirmacion}
          />
        )}

        {/* Footer */}
        <footer className="px-7 pb-10 pt-4 text-center text-[10px] text-[#ccc]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
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
