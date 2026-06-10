import { useState, useEffect } from "react"
import type { InvitacionPublica, CamposEspecificosBoda } from "@/types/invitation"
import { EnvelopeOverlayRustica } from "./envelope-overlay-rustica"
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

// Color verde rústico fijo
const COLOR_VERDE = "#465E38"

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
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="mx-auto w-full max-w-[430px] bg-[#f3f3f3] animate-pulse">
        {/* Hero skeleton */}
        <div className="flex flex-col items-center px-7 py-16 gap-5 min-h-[46rem] justify-center">
          <div className="h-4 w-24 rounded bg-[#d9d6cf]" />
          <div className="h-9 w-52 rounded bg-[#d9d6cf]" />
          <div className="h-[17.5rem] w-[13.75rem] rounded bg-[#d9d6cf]" />
          <div className="h-10 w-36 rounded bg-[#d9d6cf]" />
          <div className="h-4 w-32 rounded bg-[#d9d6cf]" />
        </div>

        {/* Countdown skeleton */}
        <div className="flex justify-center gap-3 px-7 pb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[4.875rem] w-[4.375rem] rounded bg-[#d9d6cf]" />
          ))}
        </div>

        {/* Info block skeleton */}
        <div className="px-7 py-8 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-11 w-11 rounded-[10px] bg-[#d9d6cf] shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-3 w-16 rounded bg-[#d9d6cf]" />
                <div className="h-4 w-40 rounded bg-[#d9d6cf]" />
              </div>
            </div>
          ))}
        </div>

        {/* Map skeleton */}
        <div className="px-7 pb-8">
          <div className="h-[12rem] w-full rounded bg-[#d9d6cf]" />
          <div className="mt-3 flex gap-2.5">
            <div className="flex-1 h-10 rounded bg-[#d9d6cf]" />
            <div className="flex-1 h-10 rounded bg-[#d9d6cf]" />
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

  // Color primario: el del pedido si existe, sino el verde rústico fijo
  const colorPrimario = invitacion?.colorPrimario || COLOR_VERDE

  useEffect(() => {
    document.documentElement.style.setProperty("--invitation-primary", colorPrimario)
    document.documentElement.style.setProperty("--invitation-accent", colorPrimario)
    return () => {
      document.documentElement.style.removeProperty("--invitation-primary")
      document.documentElement.style.removeProperty("--invitation-accent")
    }
  }, [colorPrimario])

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
      className="min-h-screen bg-[#e8e8e8]"
      style={{
        "--invitation-primary": colorPrimario,
        "--invitation-accent": colorPrimario,
      } as React.CSSProperties}
    >
      {/* Overlay de bienvenida */}
      {showOverlay && (
        <EnvelopeOverlayRustica
          titulo={getTituloOverlay(invitacion)}
          onOpen={handleOpenInvitation}
          tieneMusica={!!invitacion.musica}
          colorAccent={colorPrimario}
        />
      )}

      {/* Reproductor de música */}
      {invitacion.musica && !showOverlay && (
        <MusicPlayer musica={invitacion.musica} autoPlay={autoPlayMusic} />
      )}

      {/* Frame principal (mobile-first, centrado en desktop) */}
      <div
        className="mx-auto min-h-screen w-full max-w-[430px] bg-[#f3f3f3] overflow-hidden"
        style={{ fontFamily: "Quicksand, sans-serif" }}
      >
        {/* 1. Hero */}
        <HeroSection invitacion={invitacion} invitadoParam={invitadoParam} />

        {/* 2. Cuenta regresiva */}
        {tieneCountdown && (
          <CountdownSection
            fechaEvento={invitacion.fechaEvento}
            horaEvento={invitacion.horaEvento}
          />
        )}

        {/* 3. Tagline + fecha */}
        <TaglineSection invitacion={invitacion} />

        {/* 4. Lugares (verde con iconos) */}
        <LocationsSection invitacion={invitacion} />

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
          className="px-7 pb-10 pt-6 text-center text-base font-semibold text-[#787878]"
          style={{ fontFamily: "Quicksand, sans-serif" }}
        >
          <span>Hecho con ♥ · </span>
          <a
            href="https://festeja.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#555] hover:underline"
          >
            festeja.com.ar
          </a>
        </footer>
      </div>
    </div>
  )
}
