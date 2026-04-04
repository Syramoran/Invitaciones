import { Suspense, useMemo, useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import type { InvitacionPublica } from '@/types/invitation'
import { getInvitacionPublica, getCachedInvitacion } from '@/services/invitacionService'
import { getInvitationComponent } from '@/components/invitations/registry'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e8e8e8]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
        <p className="text-sm text-gray-500">Cargando invitación...</p>
      </div>
    </div>
  )
}

/** Banner discreto que aparece cuando se sirve desde caché (servidor no disponible) */
function CachedVersionBanner() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'rgba(40,35,30,0.88)',
        color: '#fff',
        borderRadius: '8px',
        padding: '.55rem 1rem .55rem 1.1rem',
        fontSize: '.8125rem',
        display: 'flex',
        alignItems: 'center',
        gap: '.75rem',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 4px 16px rgba(0,0,0,.25)',
        maxWidth: 'calc(100vw - 2rem)',
        whiteSpace: 'nowrap',
      }}
    >
      <span>Mostrando la última versión guardada</span>
      <button
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso"
        style={{
          background: 'none',
          border: 'none',
          color: '#ccc',
          cursor: 'pointer',
          lineHeight: 1,
          padding: '2px',
          fontSize: '1rem',
        }}
      >
        ✕
      </button>
    </div>
  )
}

/** Pantalla de servidor caído (sin caché disponible) */
function ServerDownScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-5">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">🔧</p>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Servidor en mantenimiento
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          No pudimos cargar esta invitación en este momento.
          <br />
          Intentalo de nuevo en unos minutos.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}

/** Determina si el error de axios es de red/servidor (sin respuesta HTTP) */
function isNetworkError(err: unknown): boolean {
  if (!isAxiosError(err)) return false
  // Sin respuesta → servidor caído o sin internet
  return !err.response
}

export default function InvitacionPage() {
  const { eventoId } = useParams<{ eventoId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const invitado = searchParams.get('invitado') ?? undefined

  const [invitacion, setInvitacion] = useState<InvitacionPublica | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'cached' | 'server-down' | 'error'>('loading')

  useEffect(() => {
    if (!eventoId) {
      setStatus('error')
      return
    }

    setStatus('loading')

    getInvitacionPublica(eventoId, invitado)
      .then((data) => {
        setInvitacion(data)
        document.title = `${data.titulo} | Invitación Digital`
        setStatus('success')
      })
      .catch((err) => {
        if (isNetworkError(err)) {
          // Servidor caído o sin internet → intentar caché local
          const cached = getCachedInvitacion(eventoId)
          if (cached) {
            setInvitacion(cached)
            document.title = `${cached.titulo} | Invitación Digital`
            setStatus('cached')
          } else {
            setStatus('server-down')
          }
        } else {
          // Error HTTP (404, 403, etc.) → ruta no encontrada
          setStatus('error')
        }
      })
  }, [eventoId, invitado])

  useEffect(() => {
    if (status === 'error') {
      navigate('/not-found', { replace: true })
    }
  }, [status, navigate])

  const InvitationComponent = useMemo(
    () => (invitacion ? getInvitationComponent(invitacion.template.slug) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invitacion?.template.slug],
  )

  if (status === 'loading') return <LoadingScreen />
  if (status === 'server-down') return <ServerDownScreen />
  if (!invitacion || !InvitationComponent) return null

  return (
    <>
      {status === 'cached' && <CachedVersionBanner />}
      <Suspense fallback={<LoadingScreen />}>
        <InvitationComponent invitacion={invitacion} invitadoParam={invitado} />
      </Suspense>
    </>
  )
}
