import type { InvitacionPublica } from '@/types/invitation'

interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
}

export function InvitationView({ invitacion }: InvitationViewProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-100">
      <p className="mb-2 text-sm uppercase tracking-widest text-stone-500">Plantilla</p>
      <h1 className="mb-6 text-3xl font-serif text-stone-800">Boda Rústica</h1>
      <p className="text-xl text-stone-700">{invitacion.titulo}</p>
    </div>
  )
}
