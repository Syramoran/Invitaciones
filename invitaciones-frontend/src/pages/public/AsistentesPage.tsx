import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, Lock, Users } from 'lucide-react'
import { getAsistentes } from '@/services/invitacionService'
import type { AsistenteItem } from '@/services/invitacionService'

type Estado = 'form' | 'loading' | 'success' | 'error'

export default function AsistentesPage() {
  const { eventoId } = useParams<{ eventoId: string }>()

  const [password, setPassword] = useState('')
  const [estado, setEstado] = useState<Estado>('form')
  const [errorMsg, setErrorMsg] = useState('')
  const [totalConfirmados, setTotalConfirmados] = useState(0)
  const [invitados, setInvitados] = useState<AsistenteItem[]>([])

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!eventoId || !password.trim()) return

    setEstado('loading')
    setErrorMsg('')

    try {
      const data = await getAsistentes(eventoId, password.trim())
      setTotalConfirmados(data.totalConfirmados)
      setInvitados(data.invitados)
      setEstado('success')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) {
        setErrorMsg('Contraseña incorrecta.')
      } else {
        setErrorMsg('No se pudo cargar la lista. Intentá de nuevo.')
      }
      setEstado('error')
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-[#e8e8e8] px-4 py-12">
      <div className="w-full max-w-[430px]">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <Users className="h-6 w-6 text-[#555555]" />
          </div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Lista de asistentes</h1>
          <p className="mt-1 text-sm text-[#777777]">Ingresá la contraseña del evento para ver quién confirmó.</p>
        </div>

        {/* Formulario */}
        {(estado === 'form' || estado === 'loading' || estado === 'error') && (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#777777]">
              Contraseña
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aaaaaa]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña del evento"
                className="w-full rounded-lg border border-[#e0e0e0] py-3 pl-9 pr-4 text-sm text-[#1a1a1a] outline-none focus:border-[#555555] focus:ring-0"
                autoComplete="off"
              />
            </div>

            {estado === 'error' && (
              <p className="mt-3 text-center text-sm text-red-500">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={estado === 'loading' || !password.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {estado === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Ver lista'
              )}
            </button>
          </form>
        )}

        {/* Lista de asistentes */}
        {estado === 'success' && (
          <div className="rounded-2xl bg-white shadow-sm">
            {/* Contador */}
            <div className="border-b border-[#f0f0f0] px-6 py-4 text-center">
              <span className="text-3xl font-bold text-[#1a1a1a]">{totalConfirmados}</span>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-[#777777]">
                {totalConfirmados === 1 ? 'confirmado' : 'confirmados'}
              </p>
            </div>

            {/* Lista */}
            {invitados.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-[#aaaaaa]">
                Nadie confirmó todavía.
              </p>
            ) : (
              <ul className="divide-y divide-[#f0f0f0]">
                {invitados.map((inv, i) => (
                  <li key={i} className="flex items-center justify-between px-6 py-4">
                    <span className="text-sm font-medium capitalize text-[#1a1a1a]">
                      {inv.nombre} {inv.apellido}
                    </span>
                    {inv.fechaConfirmacion && (
                      <span className="text-xs text-[#aaaaaa]">
                        {new Date(inv.fechaConfirmacion).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
