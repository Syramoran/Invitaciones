import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/useAuth'

export default function ClientLoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/client/panel', { replace: true })
  }, [isLoading, isAuthenticated, navigate])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setError(null)

    const userTrim = username.trim()
    if (userTrim.length === 0) {
      setError('Por favor, ingresá tu usuario.')
      return
    }

    setSubmitting(true)
    try {
      await login(username.trim(), password)
      navigate('/client/panel', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        setError('Usuario o contraseña incorrectos')
      } else {
        setError('Error al conectarse con el servidor')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#fcfaf8]">
      <div className="bg-white rounded-2xl px-10 py-12 w-[380px] max-w-[92vw] text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#f3f0ea]">
        <div className="font-display text-3xl font-semibold mb-1">
          festejá<span className="text-[#c5a572] italic">.</span>
        </div>
        <p className="text-[#6b7280] text-[.85rem] mb-8">Ingresá a tu cuenta</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="text-left mb-4">
            <label className="block text-[.8rem] font-medium text-[#2d2926] mb-1">Usuario</label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Tu usuario"
              className="w-full px-3.5 py-[11px] border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
            />
          </div>

          <div className="text-left mb-6">
            <label className="block text-[.8rem] font-medium text-[#2d2926] mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-[11px] border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
            />
          </div>

          {error && <p className="text-[#dc2626] text-[.82rem] mb-4 -mt-2">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="w-full py-[13px] bg-[#c5a572] text-white rounded-full font-medium text-[.95rem] transition-all hover:bg-[#b09365] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</> : 'Ingresar'}
          </button>
        </form>

        <p className="text-[.85rem] text-[#6b7280] mt-6">
          ¿No tenés cuenta?{' '}
          <Link to="/client/register" className="text-[#c5a572] hover:underline font-medium">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
