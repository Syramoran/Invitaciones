import { Suspense, useMemo, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { FileQuestion } from 'lucide-react'
import type { InvitacionPublica } from '@/types/invitation'
import { getInvitacionPublica, getCachedInvitacion } from '@/services/invitacionService'
import { getInvitationComponent } from '@/components/invitations/registry'
import { COLOR as BODA_ANGELA_COLOR } from '@/components/invitations/boda-angela/theme'

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

/** Pantalla de carga de `boda-angela`: liso color crema, sin texto, solo un pulso sutil hasta que se muestra el sobre. */
function BodaAngelaLoadingScreen() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: BODA_ANGELA_COLOR.crema }}
    >
      <style>{`
        @keyframes boda-angela-loading-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.2); }
        }
      `}</style>
      <div
        className="h-3 w-3 rounded-full"
        style={{
          backgroundColor: BODA_ANGELA_COLOR.brown,
          animation: 'boda-angela-loading-pulse 1.6s ease-in-out infinite',
        }}
      />
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
          No pudimos cargar la invitación
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Es un problema externo a la invitación — disculpá las molestias, ya se debería resolver solo. Probá de nuevo en unos minutos.
          <br />
          <br />
          Si el problema persiste, avisale al anfitrión o escribinos a{' '}
          <a href="mailto:festeja.plataforma@gmail.com" className="underline">
            festeja.plataforma@gmail.com
          </a>
          .
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

/**
 * Pantalla para un link que no resuelve a ninguna invitación. `personalizado`
 * distingue los dos casos, porque la acción que le toca al invitado es
 * distinta: si el link traía ?invitado=/?grupo= y falló, la invitación existe
 * pero ese nombre no está en la lista, así que lo que corresponde es pedir el
 * link de nuevo.
 */
function InvitacionNoEncontradaScreen({ personalizado }: { personalizado: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-5">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#efece7]">
          <FileQuestion className="h-8 w-8 text-[#8a8178]" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-800">
          {personalizado ? 'No encontramos tu invitación' : 'Invitación no encontrada'}
        </h2>
        <p className="text-sm leading-relaxed text-gray-500">
          {personalizado ? (
            <>
              El enlace puede haber quedado incompleto al compartirlo.
              Pedile al anfitrión que te reenvíe tu link personal.
            </>
          ) : (
            <>
              Esta invitación no existe o ya no está disponible.
              Revisá que el enlace esté completo.
            </>
          )}
        </p>
      </div>
    </div>
  )
}

/**
 * Determina si el error de axios corresponde a un problema del servidor
 * (no del invitado): sin respuesta HTTP (servidor caído, sin internet) o con
 * respuesta pero de error 5xx (el gateway/proxy sí respondió, pero el
 * backend en sí no — ej. un 502 mientras el backend reinicia). Distinto de
 * un 4xx real (404, 403), que sí es "esta invitación/link no existe".
 */
function isNetworkError(err: unknown): boolean {
  if (!isAxiosError(err)) return false
  if (!err.response) return true
  return err.response.status >= 500
}

export default function InvitacionPage() {
  const { eventoId } = useParams<{ eventoId: string }>()
  const [searchParams] = useSearchParams()

  const invitado = searchParams.get('invitado') ?? undefined
  const grupo = searchParams.get('grupo') ?? undefined

  const [invitacion, setInvitacion] = useState<InvitacionPublica | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'cached' | 'server-down' | 'error'>('loading')
  // Última visita cacheada de este mismo link, solo para saber qué pantalla de
  // carga mostrar antes de que responda el fetch (si ya se visitó antes).
  const [cachedSlug] = useState(() => (eventoId ? getCachedInvitacion(eventoId)?.template.slug ?? null : null))

  useEffect(() => {
    if (!eventoId) {
      setStatus('error')
      return
    }

    setStatus('loading')

    getInvitacionPublica(eventoId, invitado, grupo)
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
  }, [eventoId, invitado, grupo])

  const InvitationComponent = useMemo(
    () => (invitacion ? getInvitationComponent(invitacion.template.slug) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invitacion?.template.slug],
  )

  const loadingSlug = invitacion?.template.slug ?? cachedSlug
  const LoadingFallback = loadingSlug === 'boda-angela' ? BodaAngelaLoadingScreen : LoadingScreen

  if (status === 'loading') return <LoadingFallback />
  if (status === 'server-down') return <ServerDownScreen />
  // Cualquier salida sin invitación montable muestra pantalla, nunca un blanco:
  // link inexistente, invitado que no está en la lista, o una template sin
  // componente registrado en el frontend.
  if (status === 'error' || !invitacion || !InvitationComponent) {
    return <InvitacionNoEncontradaScreen personalizado={Boolean(invitado || grupo)} />
  }

  return (
    <>
      {status === 'cached' && <CachedVersionBanner />}
      <Suspense fallback={<LoadingFallback />}>
        <InvitationComponent invitacion={invitacion} invitadoParam={invitado} />
      </Suspense>
    </>
  )
}
