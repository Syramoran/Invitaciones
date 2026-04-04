import type { InvitacionPublica } from '@/types/invitation'

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

export function InvitationView({ invitacion }: InvitationViewProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pink-50">
      <p className="mb-2 text-sm uppercase tracking-widest text-pink-400">Plantilla</p>
      <h1 className="mb-6 text-3xl font-serif text-pink-800">Quinceañera Elegante</h1>
      <p className="text-xl text-pink-700">{invitacion.titulo}</p>
    </div>
  )
}
