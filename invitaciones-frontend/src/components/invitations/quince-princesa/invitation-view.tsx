import type { InvitacionPublica } from '@/types/invitation'

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

export function InvitationView({ invitacion }: InvitationViewProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-purple-50">
      <p className="mb-2 text-sm uppercase tracking-widest text-purple-400">Plantilla</p>
      <h1 className="mb-6 text-3xl font-serif text-purple-800">Quinceañera Princesa</h1>
      <p className="text-xl text-purple-700">{invitacion.titulo}</p>
    </div>
  )
}
