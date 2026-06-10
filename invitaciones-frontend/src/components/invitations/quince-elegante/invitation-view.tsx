import { useState, useEffect } from "react"
import type { InvitacionPublica, CamposEspecificosQuince } from "@/types/invitation"
import { EnvelopeOverlayElegante } from "./envelope-overlay"
import { MusicPlayer } from "../invitation-basic/music-player"
import { HeroSection } from "./hero-section"
import { CountdownSection } from "./countdown-section"
import { InfoSection } from "./info-section"
import { MapSection } from "./map-section"
import { StorySection } from "./story-section"
import { RsvpSection } from "./rsvp-section"

// ─── Color palette ────────────────────────────────────────────────────────────

const COLOR_DEFAULT = "#2A63A8"

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#e8f0fb" }}>
      <div className="mx-auto w-full max-w-[430px] animate-pulse">
        <div className="flex flex-col items-center px-7 py-16 gap-5 min-h-[480px] justify-center bg-[#eef2f8]">
          <div className="h-[7rem] w-[18rem] rounded-xl bg-[#d8e0ec]" />
          <div className="h-[14rem] w-[11rem] rounded-xl bg-[#d8e0ec]" />
        </div>
        <div className="flex justify-center gap-5 px-7 py-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded bg-[#d8e0ec]" />
              <div className="h-3 w-8 rounded bg-[#d8e0ec]" />
            </div>
          ))}
        </div>
        <div className="px-10 py-8 flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-5 w-5 rounded bg-[#d8e0ec] shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-2.5 w-12 rounded bg-[#d8e0ec]" />
                <div className="h-4 w-36 rounded bg-[#d8e0ec]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main view ───────────────────────────────────────────────────────────────

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

export function InvitationView({ invitacion, invitadoParam }: InvitationViewProps) {
  const [showOverlay, setShowOverlay] = useState(true)
  const [autoPlayMusic, setAutoPlayMusic] = useState(false)

  const colorAccent = invitacion?.colorPrimario || COLOR_DEFAULT
  const colorBgSoft = hexToRgba(colorAccent, 0.07)
  const colorBorder = hexToRgba(colorAccent, 0.2)

  useEffect(() => {
    document.documentElement.style.setProperty("--invitation-primary", colorAccent)
    document.documentElement.style.setProperty("--invitation-bg-soft", colorBgSoft)
    document.documentElement.style.setProperty("--invitation-border", colorBorder)
    return () => {
      document.documentElement.style.removeProperty("--invitation-primary")
      document.documentElement.style.removeProperty("--invitation-bg-soft")
      document.documentElement.style.removeProperty("--invitation-border")
    }
  }, [colorAccent, colorBgSoft, colorBorder])

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

  const campos = (invitacion.camposEspecificos ?? {}) as CamposEspecificosQuince
  const fechaLimiteConfirmacion =
    (campos as Record<string, unknown>).fechaLimiteConfirmacion as string | null ?? null
  const nombreQuince = campos.nombre || invitacion.titulo

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#e8f0fb" }}>
      {/* Opening overlay */}
      {showOverlay && (
        <EnvelopeOverlayElegante
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
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white">

        {/* 1. Hero: floral bg + texto + foto */}
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
            colorAccent={colorAccent}
          />
        )}

        {/* 3. Información del evento */}
        <InfoSection invitacion={invitacion} colorAccent={colorAccent} />

        {/* 4. Mapa */}
        <MapSection invitacion={invitacion} colorAccent={colorAccent} />

        {/* 5. Historia */}
        {invitacion.historias.length > 0 && (
          <StorySection
            historias={invitacion.historias}
            colorAccent={colorAccent}
          />
        )}

        {/* 6. RSVP */}
        {invitacion.tieneConfirmacion && (
          <RsvpSection
            invitacionId={invitacion.id}
            invitadoParam={invitadoParam ?? null}
            mostrarBoton={invitacion.mostrarBotonConfirmar}
            fechaLimite={fechaLimiteConfirmacion}
            colorAccent={colorAccent}
          />
        )}

        {/* Footer */}
        <footer
          className="px-7 pb-10 pt-4 text-center text-[10px] text-[#aaa]"
          style={{ fontFamily: "'Nunito Sans', sans-serif" }}
        >
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
