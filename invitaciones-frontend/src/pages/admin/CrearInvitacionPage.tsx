import { CrearInvitacionWizard } from '@/components/admin/crear-invitacion/CrearInvitacionWizard'

export default function CrearInvitacionPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl font-semibold">Crear Invitación</h1>
      </div>

      <CrearInvitacionWizard />
    </div>
  )
}
