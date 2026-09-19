import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, Lock, Users } from 'lucide-react'
import { asistentesService } from '@/services/asistentesService'
import type { AsistentesResponse } from '@/types/asistentes'
import { GestionAsistentesPanel } from '@/components/public/asistentes/GestionAsistentesPanel'

type Estado = 'form' | 'loading' | 'success' | 'error'

export default function AsistentesPage() {
  const { eventoId } = useParams<{ eventoId: string }>()

  const [password, setPassword] = useState('')
  const [estado, setEstado] = useState<Estado>('form')
  const [errorMsg, setErrorMsg] = useState('')
  const [data, setData] = useState<AsistentesResponse | null>(null)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!eventoId || !password.trim()) return

    setEstado('loading')
    setErrorMsg('')

    try {
      const result = await asistentesService.obtener(eventoId, password.trim())
      setData(result)
      setEstado('success')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) {
        setErrorMsg('Contraseña incorrecta.')
      } else {
        setErrorMsg('No se pudo cargar el panel. Intentá de nuevo.')
      }
      setEstado('error')
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-ivory px-4 py-12">
      <div className={estado === 'success' ? 'w-full flex justify-center' : 'w-full max-w-[430px]'}>

        {estado !== 'success' && (
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <Users className="h-6 w-6 text-warm-gray" />
            </div>
            <h1 className="text-xl font-semibold text-charcoal">Panel de invitados</h1>
            <p className="mt-1 text-sm text-warm-gray">Ingresá la contraseña del evento para gestionar tus invitados.</p>
          </div>
        )}

        {/* Formulario */}
        {(estado === 'form' || estado === 'loading' || estado === 'error') && (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
            <label htmlFor="password-evento" className="mb-1 block text-xs font-semibold uppercase tracking-widest text-warm-gray">
              Contraseña
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray-light" />
              <input
                id="password-evento"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña del evento"
                className="w-full rounded-lg border border-champagne-dark py-3 pl-9 pr-4 text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                autoComplete="off"
              />
            </div>

            {estado === 'error' && (
              <p className="mt-3 text-center text-sm text-red-500">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={estado === 'loading' || !password.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-80 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1"
            >
              {estado === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        )}

        {/* Panel de gestión */}
        {estado === 'success' && data && eventoId && (
          <GestionAsistentesPanel
            invitacionId={eventoId}
            password={password.trim()}
            data={data}
            onRefetch={setData}
          />
        )}

      </div>
    </div>
  )
}
