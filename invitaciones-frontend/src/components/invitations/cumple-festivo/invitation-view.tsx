import type { InvitacionPublica } from '@/types/invitation'

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

export function InvitationView({ invitacion }: InvitationViewProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-yellow-50">
      <p className="mb-2 text-sm uppercase tracking-widest text-yellow-600">Plantilla</p>
      <h1 className="mb-6 text-3xl font-bold text-yellow-800">Cumpleaños Festivo</h1>
      <p className="text-xl text-yellow-700">{invitacion.titulo}</p>
    </div>
  )
}
