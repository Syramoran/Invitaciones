import type { InvitacionPublica } from '@/types/invitation'

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

export function InvitationView({ invitacion }: InvitationViewProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900">
      <p className="mb-2 text-sm uppercase tracking-widest text-neutral-400">Plantilla</p>
      <h1 className="mb-6 text-3xl font-light text-white">Cumpleaños Elegante</h1>
      <p className="text-xl text-neutral-300">{invitacion.titulo}</p>
    </div>
  )
}
