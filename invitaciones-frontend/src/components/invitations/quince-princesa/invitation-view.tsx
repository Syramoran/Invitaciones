import { useState, useEffect } from "react"
import type { InvitacionPublica } from "@/types/invitation"
import { EnvelopeOverlayPrincesa } from "./envelope-overlay-princesa"
import { MusicPlayer } from "../invitation-basic/music-player"
import { HeroSection } from "./hero-section"
import { CountdownSection } from "./countdown-section"
import { InfoSection } from "./info-section"
import { MapSection } from "./map-section"
import { StorySection } from "./story-section"
import { RsvpSection } from "./rsvp-section"

// ─── Paleta: hex → nombre de asset ───────────────────────────────────────────

const COLOR_TO_ASSET: Record<string, string> = {
  "#894F8E": "violeta", // Violeta
  "#B14B8F": "rosa",    // Fucsia
  "#DC83AA": "rosa",    // Rosa
  "#D16A32": "naranja", // Naranja
  "#BD9848": "dorado",  // Dorado
  "#65795A": "verde",   // Verde Claro
  "#2A63A8": "azul",    // Azul
  "#A41B1D": "rosa",    // Rojo → fallback rosa
  "#6B1533": "rosa",    // Bordo → fallback rosa
}

// ─── Paleta: hex primario → color de fondo sólido ────────────────────────────

const COLOR_TO_BG: Record<string, string> = {
  "#894F8E": "#7B4D80", // Violeta
  "#B14B8F": "#9B4B6D", // Fucsia
  "#DC83AA": "#9B4B6D", // Rosa
  "#D16A32": "#A35429", // Naranja
  "#BD9848": "#AC8839", // Dorado
  "#65795A": "#546B47", // Verde
  "#2A63A8": "#24548F", // Azul
  "#A41B1D": "#9B4B6D", // Rojo → fallback rosa
  "#6B1533": "#9B4B6D", // Bordo → fallback rosa
}

function getColorBg(colorPrimario: string | null): string {
  if (!colorPrimario) return "#9B4B6D"
  return COLOR_TO_BG[colorPrimario.toUpperCase()] ?? "#9B4B6D"
}

function getColorAsset(colorPrimario: string | null): string {
  if (!colorPrimario) return "rosa"
  return COLOR_TO_ASSET[colorPrimario.toUpperCase()] ?? "rosa"
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[430px] animate-pulse">
        <div className="flex flex-col items-center px-7 py-16 gap-5 min-h-screen justify-center">
          <div className="h-16 w-20 rounded bg-pink-100" />
          <div className="h-4 w-24 rounded bg-pink-100" />
          <div className="h-9 w-48 rounded bg-pink-100" />
          <div className="h-[15rem] w-[15rem] rounded-full bg-pink-100" />
          <div className="h-4 w-32 rounded bg-pink-100" />
        </div>
        <div className="flex justify-center gap-3 px-7 pb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[4.875rem] w-[3.75rem] rounded-lg bg-pink-100" />
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

  const colorAccent = invitacion?.colorPrimario || "#B14B8F"
  const colorAsset = getColorAsset(invitacion?.colorPrimario ?? null)
  const colorBgSoft = hexToRgba(colorAccent, 0.08)
  const colorBorder = hexToRgba(colorAccent, 0.25)
  const colorBg = getColorBg(invitacion?.colorPrimario ?? null)

  useEffect(() => {
    document.documentElement.style.setProperty("--invitation-primary", colorAccent)
    document.documentElement.style.setProperty("--invitation-accent", colorAccent)
    document.documentElement.style.setProperty("--invitation-bg-soft", colorBgSoft)
    document.documentElement.style.setProperty("--invitation-border", colorBorder)
    document.documentElement.style.setProperty("--invitation-bg", colorBg)
    return () => {
      document.documentElement.style.removeProperty("--invitation-primary")
      document.documentElement.style.removeProperty("--invitation-accent")
      document.documentElement.style.removeProperty("--invitation-bg-soft")
      document.documentElement.style.removeProperty("--invitation-border")
      document.documentElement.style.removeProperty("--invitation-bg")
    }
  }, [colorAccent, colorBgSoft, colorBorder, colorBg])

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
  const nombreQuince = (campos.nombre as string) || invitacion.titulo

  return (
    <div
      className="min-h-screen"
      style={{
        "--invitation-primary": colorAccent,
        "--invitation-accent": colorAccent,
        "--invitation-bg-soft": colorBgSoft,
        "--invitation-border": colorBorder,
        backgroundColor: "#fdf6fa",
        backgroundImage: `radial-gradient(${colorAccent}1a 1.5px, transparent 1.5px), radial-gradient(${colorAccent}0d 1px, transparent 1px)`,
        backgroundSize: "28px 28px, 14px 14px",
        backgroundPosition: "0 0, 7px 7px",
      } as React.CSSProperties}
    >
      {/* Overlay de bienvenida */}
      {showOverlay && (
        <EnvelopeOverlayPrincesa
          titulo={nombreQuince}
          tituloEvento={invitacion.titulo}
          onOpen={handleOpenInvitation}
          tieneMusica={!!invitacion.musica}
          colorAsset={colorAsset}
          colorAccent={colorAccent}
        />
      )}

      {/* Reproductor de música */}
      {invitacion.musica && !showOverlay && (
        <MusicPlayer musica={invitacion.musica} autoPlay={autoPlayMusic} />
      )}

      {/* Frame principal (mobile-first, centrado en desktop) */}
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.06)]">

        {/* 1. Hero: corona + foto + nombre + fecha */}
        <HeroSection
          invitacion={invitacion}
          invitadoParam={invitadoParam}
          colorAsset={colorAsset}
        />

        {/* 2. Cuenta regresiva */}
        {tieneCountdown && (
          <CountdownSection
            fechaEvento={invitacion.fechaEvento}
            horaEvento={invitacion.horaEvento}
          />
        )}

        {/* 3. Información: fecha / hora / lugar / vestimenta */}
        <InfoSection invitacion={invitacion} />

        {/* 4. Mapa de ubicación */}
        <MapSection invitacion={invitacion} />

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
            fechaLimite={fechaLimiteConfirmacion}
          />
        )}

        {/* Footer */}
        <footer
          className="px-7 pb-10 pt-6 text-center text-[10px] text-[#bbb]"
          style={{ fontFamily: "Lato, sans-serif" }}
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
