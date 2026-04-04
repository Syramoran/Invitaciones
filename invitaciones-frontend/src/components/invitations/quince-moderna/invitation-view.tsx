import type { InvitacionPublica } from '@/types/invitation'

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

export function InvitationView({ invitacion }: InvitationViewProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-fuchsia-50">
      <p className="mb-2 text-sm uppercase tracking-widest text-fuchsia-500">Plantilla</p>
      <h1 className="mb-6 text-3xl font-bold text-fuchsia-800">Quinceañera Moderna</h1>
      <p className="text-xl text-fuchsia-700">{invitacion.titulo}</p>
    </div>
  )
}
