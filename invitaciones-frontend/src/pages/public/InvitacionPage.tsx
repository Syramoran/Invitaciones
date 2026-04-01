import { Suspense, useMemo, useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import type { InvitacionPublica } from '@/types/invitation'
import { getInvitacionPublica } from '@/services/invitacionService'
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

export default function InvitacionPage() {
  const { eventoId } = useParams<{ eventoId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const invitado = searchParams.get('invitado') ?? undefined

  const [invitacion, setInvitacion] = useState<InvitacionPublica | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

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
      .catch(() => {
        setStatus('error')
      })
  }, [eventoId, invitado])

  useEffect(() => {
    if (status === 'error') {
      navigate('/not-found', { replace: true })
    }
  }, [status, navigate])

  // Lazy-load the component that matches the template slug
  const InvitationComponent = useMemo(
    () => (invitacion ? getInvitationComponent(invitacion.template.slug) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invitacion?.template.slug],
  )

  if (status === 'loading') return <LoadingScreen />
  if (!invitacion || !InvitationComponent) return null

  return (
    <Suspense fallback={<LoadingScreen />}>
      <InvitationComponent invitacion={invitacion} invitadoParam={invitado} />
    </Suspense>
  )
}
