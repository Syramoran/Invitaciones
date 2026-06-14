import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, LogOut, CheckCircle2, BarChart3, Clock, FileEdit, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import apiClient from '@/services/apiClient'
import ClientInvitationCard from '@/components/client/ClientInvitationCard'
import NoEditionsModal from '@/components/client/NoEditionsModal'
import DeleteInvitacionModal from '@/components/client/DeleteInvitacionModal'

interface InvitacionCliente {
  id: string
  titulo: string
  tipoEventoNombre: string
  templateNombre: string
  activa: boolean
  estadoPago: string
  fechaEvento: string
  editCount: number
  servicios?: { servicioId: number; nombre: string; habilitado: boolean }[]
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: number
  bgColor: string
  iconColor: string
}

function MetricCard({ icon, label, value, bgColor, iconColor }: MetricCardProps) {
  return (
    <div className="bg-white border border-[#f3f0ea] rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#6b7280] text-[.85rem] font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-[#2d2926]">{value}</p>
        </div>
        <div className={`${bgColor} ${iconColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function ClientDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [invitaciones, setInvitaciones] = useState<InvitacionCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const paymentStatus = searchParams.get('payment')

  // Modal States
  const [noEditionsModal, setNoEditionsModal] = useState<{ show: boolean; titulo: string }>({ show: false, titulo: '' })
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null)

  useEffect(() => {
    async function loadInvitaciones() {
      try {
        const { data } = await apiClient.get('/client/invitaciones')
        setInvitaciones(data)
      } catch (err) {
        console.error('Error cargando invitaciones', err)
      } finally {
        setLoading(false)
      }
    }
    loadInvitaciones()
  }, [])

  const handleDeleteConfirmed = async (invId: string) => {
    await apiClient.delete(`/client/invitaciones/${invId}`)
    setInvitaciones(prev => prev.filter(i => i.id !== invId))
    setDeleteModalOpen(null)
  }

  // Split invitations: paid vs. drafts (unpaid)
  const paidInvitaciones = invitaciones.filter(inv => inv.estadoPago === 'PAGADO')
  const draftInvitaciones = invitaciones.filter(inv => inv.estadoPago === 'PENDIENTE')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const activeInvitations = paidInvitaciones.filter(inv => {
    const eventDate = new Date(inv.fechaEvento)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate.getTime() >= today.getTime()
  })

  const upcomingInvitations = activeInvitations.filter(inv => {
    const eventDate = new Date(inv.fechaEvento)
    const sevenDaysFromNow = new Date(today)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    return eventDate.getTime() <= sevenDaysFromNow.getTime()
  })

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#2d2926]">
      {/* Header */}
      <header className="bg-white border-b border-[#f3f0ea] px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="font-display text-2xl font-semibold">
          festejá<span className="text-[#c5a572] italic">.</span>
        </div>
        <div className="flex items-center gap-6 text-[.9rem] font-medium">
          <span className="text-[#6b7280]">Hola, {user?.username}</span>
          <button onClick={logout} className="flex items-center gap-2 text-[#dc2626] hover:text-[#b91c1c] transition-colors">
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        {paymentStatus === 'success' && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="font-semibold text-[.95rem]">¡Pago completado con éxito!</p>
              <p className="text-[.85rem] opacity-90">Tu invitación ya está activa y lista para compartir.</p>
            </div>
          </div>
        )}

        {/* Title + prominent create button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Mis Invitaciones</h1>
            <p className="text-[#6b7280] text-[.9rem] mt-1">Gestioná tus invitaciones digitales</p>
          </div>
          <Link
            to="/client/create-invitation"
            className="inline-flex items-center gap-2 bg-[#c5a572] hover:bg-[#b09365] text-white px-6 py-3 rounded-full font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Crear invitación
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#6b7280]">Cargando tus invitaciones...</div>
        ) : invitaciones.length === 0 ? (
          /* VACÍO */
          <div className="text-center py-24 bg-white border border-[#f3f0ea] rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-[#fcfaf8] text-[#c5a572] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aún no tenés invitaciones</h2>
            <p className="text-[#6b7280] mb-6 text-[.95rem]">Empezá creando la invitación para tu próximo evento.</p>
            <Link
              to="/client/create-invitation"
              className="inline-flex items-center gap-2 bg-[#2d2926] hover:bg-[#4a4441] text-[#fefcf9] px-6 py-3 rounded-full font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear mi primera invitación
            </Link>
          </div>
        ) : (
          <>
            {/* Borradores (sin pagar) */}
            {draftInvitaciones.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <FileEdit className="w-5 h-5 text-[#c5a572]" />
                  <h2 className="text-lg font-semibold">Borradores sin pagar</h2>
                  <span className="text-[.72rem] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                    {draftInvitaciones.length}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {draftInvitaciones.map(inv => (
                    <div
                      key={inv.id}
                      className="bg-white border border-dashed border-yellow-300 rounded-2xl p-5 shadow-sm flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-[.72rem] font-bold tracking-wider text-[#c5a572] uppercase">
                          {inv.tipoEventoNombre}
                        </span>
                        <span className="text-[.7rem] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                          Pendiente de pago
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{inv.titulo}</h3>
                      <p className="text-[#6b7280] text-[.85rem] mb-4">
                        {new Date(inv.fechaEvento).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-2 mt-auto">
                        <button
                          onClick={() => navigate(`/client/create-invitation?id=${inv.id}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-[.85rem] font-medium bg-[#c5a572] hover:bg-[#b09365] text-white px-4 py-2 rounded-full transition-colors"
                        >
                          Continuar y pagar
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModalOpen(inv.id)}
                          title="Eliminar borrador"
                          className="flex items-center justify-center w-9 h-9 rounded-full border border-[#e5e7eb] text-[#dc2626] hover:bg-red-50 hover:border-red-300 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Métricas + listado de pagadas */}
            {paidInvitaciones.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  <MetricCard
                    icon={<BarChart3 className="w-6 h-6" />}
                    label="Total de invitaciones"
                    value={paidInvitaciones.length}
                    bgColor="bg-blue-50"
                    iconColor="text-blue-600"
                  />
                  <MetricCard
                    icon={<CheckCircle2 className="w-6 h-6" />}
                    label="Activas"
                    value={activeInvitations.length}
                    bgColor="bg-green-50"
                    iconColor="text-green-600"
                  />
                  <MetricCard
                    icon={<Clock className="w-6 h-6" />}
                    label="Próximas (7 días)"
                    value={upcomingInvitations.length}
                    bgColor="bg-yellow-50"
                    iconColor="text-yellow-600"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {paidInvitaciones.map(inv => (
                    <ClientInvitationCard
                      key={inv.id}
                      invitacion={inv}
                      onNoEditionsModal={() => setNoEditionsModal({ show: true, titulo: inv.titulo })}
                      onDeleted={() => setInvitaciones(prev => prev.filter(i => i.id !== inv.id))}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* No Editions Modal */}
      {noEditionsModal.show && (
        <NoEditionsModal
          invitacionTitulo={noEditionsModal.titulo}
          onClose={() => setNoEditionsModal({ show: false, titulo: '' })}
        />
      )}

      {/* Delete Modal for Drafts */}
      {deleteModalOpen && (
        <DeleteInvitacionModal
          invitacionTitulo={invitaciones.find(i => i.id === deleteModalOpen)?.titulo || ''}
          onConfirm={() => handleDeleteConfirmed(deleteModalOpen)}
          onCancel={() => setDeleteModalOpen(null)}
        />
      )}
    </div>
  )
}
