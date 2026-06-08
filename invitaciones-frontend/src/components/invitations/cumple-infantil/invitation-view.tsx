import { useState } from 'react'
import type { InvitacionPublica } from '@/types/invitation'
import { MusicPlayer } from '../invitation-basic/music-player'

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

export function InvitationView({ invitacion }: InvitationViewProps) {
  const [autoPlayMusic] = useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sky-50">
      {invitacion.musica && (
        <MusicPlayer musica={invitacion.musica} autoPlay={autoPlayMusic} />
      )}
      <p className="mb-2 text-sm uppercase tracking-widest text-sky-500">Plantilla</p>
      <h1 className="mb-6 text-3xl font-bold text-sky-700">Cumpleaños Infantil</h1>
      <p className="text-xl text-sky-600">{invitacion.titulo}</p>
    </div>
  )
}
