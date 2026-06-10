import { useState } from "react"
import type { InvitacionPublica } from "@/types/invitation"
import { MusicPlayer } from "../invitation-basic/music-player"
import { HeroSection } from "./hero-section"
import { CountdownSection } from "./countdown-section"
import { InfoSection } from "./info-section"
import { MapSection } from "./map-section"
import { StorySection } from "./story-section"
import { RsvpSection } from "./rsvp-section"

const DEFAULT_ACCENT = "#BD9848"
const ACCENT_MAP: Record<string, string> = {
  "#f1f1f1": "#404040",
  "#ede2d4": "#BD9848",
  "#dae4f1": "#5378AC",
  "#e2daf1": "#8C64B4",
  "#f4e1e1": "#A3292B",
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
  const [autoPlayMusic] = useState(false)

  if (!invitacion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e4e4e4]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
      </div>
    )
  }

  const accentColor = resolveAccent(invitacion.colorPrimario)

  return (
    <div className="min-h-screen bg-[#e4e4e4]">
      {invitacion.musica && (
        <MusicPlayer musica={invitacion.musica} autoPlay={autoPlayMusic} />
      )}
      <div className="mx-auto w-full max-w-[430px] bg-white">
        <HeroSection invitacion={invitacion} invitadoParam={invitadoParam} />
        <CountdownSection
          fechaEvento={invitacion.fechaEvento}
          horaEvento={invitacion.horaEvento}
          accentColor={accentColor}
        />
        <InfoSection invitacion={invitacion} accentColor={accentColor} />
        <MapSection invitacion={invitacion} accentColor={accentColor} />
        <StorySection historias={invitacion.historias} />
        {invitacion.tieneConfirmacion && (
          <RsvpSection
            invitacionId={invitacion.id}
            invitadoParam={invitadoParam ?? null}
            mostrarBoton={invitacion.mostrarBotonConfirmar}
            accentColor={accentColor}
          />
        )}
      </div>
    </div>
  )
}
