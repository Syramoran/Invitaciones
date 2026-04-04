import type { InvitacionPublica } from '@/types/invitation'

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

export function InvitationView({ invitacion }: InvitationViewProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50">
      <p className="mb-2 text-sm uppercase tracking-widest text-amber-700">Plantilla</p>
      <h1 className="mb-6 text-3xl font-serif text-amber-900">Boda Clásica</h1>
      <p className="text-xl text-amber-800">{invitacion.titulo}</p>
    </div>
  )
}
