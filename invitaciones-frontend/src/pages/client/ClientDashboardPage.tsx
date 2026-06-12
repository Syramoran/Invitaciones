import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, Settings, Eye, Users, LogOut, CheckCircle2, Link as LinkIcon, X, Copy } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import apiClient from '@/services/apiClient'
import type { GuestEntry } from '@/types/crearInvitacion'

interface InvitacionCliente {
  id: string
  titulo: string
  tipoEventoNombre: string
  templateNombre: string
  activa: boolean
  estadoPago: string
  fechaEvento: string
}

export default function ClientDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [invitaciones, setInvitaciones] = useState<InvitacionCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const paymentStatus = searchParams.get('payment')
  const tabParam = searchParams.get('tab') || 'invitations'
  const activeTab = tabParam === 'create' ? 'create' : 'invitations'

  // URL Generation Modal State
  const [selectedInvitationForUrls, setSelectedInvitationForUrls] = useState<InvitacionCliente | null>(null)
  const [guestJson, setGuestJson] = useState('')
  const [guests, setGuests] = useState<GuestEntry[]>([])
  const [parseError, setParseError] = useState<string | null>(null)

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

  // Handlers for URL generation
  function handleParseJson() {
    try {
      const parsed = JSON.parse(guestJson)
      if (!Array.isArray(parsed)) throw new Error('Debe ser un array JSON')
      const parsedGuests: GuestEntry[] = parsed.map((item: Record<string, string>, i: number) => {
        if (!item.nombre || !item.apellido) {
          throw new Error(`Fila ${i + 1}: faltan campos "nombre" o "apellido"`)
        }
        return { nombre: String(item.nombre), apellido: String(item.apellido) }
      })
      setGuests(parsedGuests)
      setParseError(null)
    } catch (e) {
      setGuests([])
      setParseError((e as Error).message)
    }
  }

  function handleClear() {
    setGuestJson('')
    setGuests([])
    setParseError(null)
  }

  function guestSlug(g: GuestEntry) {
    return `${g.nombre.toLowerCase().replace(/\s+/g, '-')}-${g.apellido.toLowerCase().replace(/\s+/g, '-')}`
  }

  const publicUrl = selectedInvitationForUrls ? `${window.location.origin}/${selectedInvitationForUrls.id}` : ''
  const guestUrls = guests.map(g => ({ ...g, url: `${publicUrl}?invitado=${guestSlug(g)}` }))

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

      <main className="max-w-5xl mx-auto px-8 py-12">
        {paymentStatus === 'success' && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="font-semibold text-[.95rem]">¡Pago completado con éxito!</p>
              <p className="text-[.85rem] opacity-90">Tu invitación ya está activa y lista para compartir.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8 border-b border-[#e5e7eb]">
          <button
            onClick={() => navigate('/client/dashboard?tab=invitations')}
            className={`pb-3 px-4 font-medium text-sm transition-colors ${
              activeTab === 'invitations'
                ? 'text-[#2d2926] border-b-2 border-[#c5a572]'
                : 'text-[#6b7280] hover:text-[#2d2926]'
            }`}
          >
            Mis Invitaciones
          </button>
          <button
            onClick={() => navigate('/client/dashboard?tab=create')}
            className={`pb-3 px-4 font-medium text-sm transition-colors ${
              activeTab === 'create'
                ? 'text-[#2d2926] border-b-2 border-[#c5a572]'
                : 'text-[#6b7280] hover:text-[#2d2926]'
            }`}
          >
            Crear Nueva Invitación
          </button>
        </div>

        {activeTab === 'create' ? (
          /* TAB: CREAR NUEVA INVITACIÓN */
          <div className="text-center py-24 bg-white border border-[#f3f0ea] rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-[#fcfaf8] text-[#c5a572] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Crear una nueva invitación</h2>
            <p className="text-[#6b7280] mb-6 text-[.95rem]">Diseñá tu invitación digital personalizada en minutos.</p>
            <Link
              to="/client/create-invitation"
              className="inline-flex items-center gap-2 bg-[#c5a572] hover:bg-[#b09365] text-white px-8 py-3 rounded-full font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Comenzar
            </Link>
          </div>
        ) : loading ? (
          /* TAB: INVITACIONES - LOADING */
          <div className="text-center py-20 text-[#6b7280]">Cargando tus invitaciones...</div>
        ) : invitaciones.length === 0 ? (
          /* TAB: INVITACIONES - VACÍO */
          <div className="text-center py-24 bg-white border border-[#f3f0ea] rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-[#fcfaf8] text-[#c5a572] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aún no tenés invitaciones</h2>
            <p className="text-[#6b7280] mb-6 text-[.95rem]">Empezá creando la invitación para tu próximo evento.</p>
            <button
              onClick={() => navigate('/client/dashboard?tab=create')}
              className="inline-flex items-center gap-2 bg-[#2d2926] hover:bg-[#4a4441] text-[#fefcf9] px-6 py-3 rounded-full font-medium transition-colors"
            >
              Crear mi primera invitación
            </button>
          </div>
        ) : (
          /* TAB: INVITACIONES - LISTADO */
          <div className="grid md:grid-cols-2 gap-6">
            {invitaciones.filter(inv => inv.estadoPago === 'PAGADO').length === 0 ? (
              <div className="md:col-span-2 bg-white border border-[#f3f0ea] rounded-2xl p-8 text-center text-[#6b7280]">
                Tus invitaciones pagadas aparecerán aquí.
              </div>
            ) : (
              invitaciones.filter(inv => inv.estadoPago === 'PAGADO').map(inv => {
                const eventPassed = new Date(inv.fechaEvento).getTime() < new Date().setHours(0, 0, 0, 0)

                return (
                  <div key={inv.id} className="bg-white border border-[#f3f0ea] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium border border-green-200">
                      Activa
                    </div>

                    <div className="text-[.75rem] font-bold tracking-wider text-[#c5a572] uppercase mb-1">
                      {inv.tipoEventoNombre}
                    </div>
                    <h3 className="text-xl font-semibold mb-1 pr-24">{inv.titulo}</h3>
                    <p className="text-[#6b7280] text-[.9rem] mb-6">
                      {new Date(inv.fechaEvento).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {!eventPassed && (
                        <Link to={`/client/create-invitation?id=${inv.id}`} className="flex items-center gap-1 text-[.8rem] font-medium bg-[#fcfaf8] hover:bg-[#f3f0ea] text-[#2d2926] px-3 py-1.5 rounded-full transition-colors border border-[#e5e7eb]">
                          <Settings className="w-3.5 h-3.5" />
                          Editar
                        </Link>
                      )}
                      <Link to={`/${inv.id}`} target="_blank" className="flex items-center gap-1 text-[.8rem] font-medium bg-[#fcfaf8] hover:bg-[#f3f0ea] text-[#2d2926] px-3 py-1.5 rounded-full transition-colors border border-[#e5e7eb]">
                        <Eye className="w-3.5 h-3.5" />
                        Ver web
                      </Link>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/${inv.id}`)
                          alert('¡Enlace copiado al portapapeles!')
                        }}
                        className="flex items-center gap-1 text-[.8rem] font-medium bg-[#fcfaf8] hover:bg-[#f3f0ea] text-[#c5a572] px-3 py-1.5 rounded-full transition-colors border border-[#e5e7eb]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copiar link
                      </button>
                      <Link to={`/${inv.id}/asistentes`} className="flex items-center gap-1 text-[.8rem] font-medium bg-[#fcfaf8] hover:bg-[#f3f0ea] text-[#2d2926] px-3 py-1.5 rounded-full transition-colors border border-[#e5e7eb]">
                        <Users className="w-3.5 h-3.5" />
                        Asistentes
                      </Link>
                      <button onClick={() => setSelectedInvitationForUrls(inv)} className="flex items-center gap-1 text-[.8rem] font-medium bg-[#fcfaf8] hover:bg-[#f3f0ea] text-[#c5a572] px-3 py-1.5 rounded-full transition-colors border border-[#e5e7eb]">
                        <LinkIcon className="w-3.5 h-3.5" />
                        Generar URLs
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>

      {/* URL Generation Modal */}
      {selectedInvitationForUrls && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
              <h3 className="text-lg font-semibold text-[#2d2926]">
                Generar URLs - {selectedInvitationForUrls.titulo}
              </h3>
              <button
                type="button"
                onClick={() => { setSelectedInvitationForUrls(null); handleClear() }}
                className="text-[#9ca3af] hover:text-[#2d2926] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <label className="block text-[.85rem] font-medium mb-1 text-[#2d2926]">
                Lista de invitados (JSON)
              </label>
              <p className="text-[.76rem] text-[#6b7280] mb-3">
                Cargá la lista de invitados para generar URLs personalizadas con saludo individual.
              </p>
              <textarea
                rows={5}
                value={guestJson}
                onChange={e => {
                  setGuestJson(e.target.value)
                  setGuests([])
                  setParseError(null)
                }}
                placeholder={`[\n  { "nombre": "Juan", "apellido": "Pérez" },\n  { "nombre": "María", "apellido": "García" }\n]`}
                className="w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.82rem] font-mono focus:border-[#c5a572] focus:outline-none resize-none transition-colors"
              />
              <p className="text-[.72rem] text-[#6b7280] mt-1 mb-3">
                Formato: <code className="bg-[#f4f5f7] px-1 rounded">{`[{"nombre":"...","apellido":"..."}]`}</code>
              </p>

              {parseError && (
                <div className="px-3 py-2 mb-3 bg-[#fee2e2] text-[#dc2626] rounded-lg text-[.8rem]">
                  ⚠ {parseError}
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={handleParseJson}
                  disabled={!guestJson.trim()}
                  className="px-4 py-2 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.82rem] font-medium hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Generar URLs
                </button>
                {(guests.length > 0 || guestJson) && (
                  <button type="button" onClick={handleClear}
                    className="px-4 py-2 border border-[#d1d5db] rounded-lg text-[.82rem] hover:border-[#dc2626] hover:text-[#dc2626] transition-colors">
                    Limpiar
                  </button>
                )}
              </div>

              {/* Guest URL summary */}
              {guestUrls.length > 0 && (
                <div className="bg-[#dcfce7] text-[#166534] rounded-xl px-4 py-3 text-[.82rem]">
                  <p className="font-semibold mb-0.5">
                    ✓ {guestUrls.length} URL{guestUrls.length !== 1 ? 's' : ''} personalizadas generadas
                  </p>
                  <p className="text-[#166534]/80">
                    Cada invitado tiene su link con el parámetro <code className="bg-[#bbf7d0] px-1 rounded">?invitado=</code>.
                  </p>

                  <div className="mt-3 max-h-40 overflow-y-auto bg-white/50 rounded p-2 text-[.75rem] font-mono border border-green-200">
                    {guestUrls.map((g, i) => (
                      <div key={i} className="truncate mb-1 last:mb-0">
                        {g.url}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#f0f0f0] bg-[#fcfaf8] flex justify-end">
              <button
                type="button"
                onClick={() => { setSelectedInvitationForUrls(null); handleClear() }}
                className="px-5 py-2.5 bg-[#2d2926] text-white rounded-lg text-[.88rem] font-medium hover:bg-[#4a4441] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
