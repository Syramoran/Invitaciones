import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/useAuth'

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const [username,  setUsername]  = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [shaking,   setShaking]   = useState(false)

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/admin/dashboard', { replace: true })
  }, [isLoading, isAuthenticated, navigate])

  function triggerShake() {
    setShaking(true)
    setTimeout(() => setShaking(false), 450)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      navigate('/admin/dashboard', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        setError('Usuario o contraseña incorrectos')
      } else if (status === 429) {
        setError('Demasiados intentos. Esperá unos minutos.')
      } else {
        setError('Error al conectarse con el servidor')
      }
      triggerShake()
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1a1f2e,#2e3650)' }}>
      <div
        className={`bg-white rounded-2xl px-10 py-12 w-[380px] max-w-[92vw] text-center ${shaking ? 'animate-shake' : ''}`}
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}
      >
        {/* Logo */}
        <div className="font-display text-3xl font-semibold mb-1">
          festejá<span className="text-[#c5a572] italic">.</span>
        </div>
        <p className="text-[#6b7280] text-[.82rem] mb-8">Panel de administración</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="text-left mb-4">
            <label className="block text-[.8rem] font-medium text-[#2d2926] mb-1">Usuario</label>
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Tu usuario"
              className="w-full px-3.5 py-[11px] border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
            />
          </div>

          {/* Password */}
          <div className="text-left mb-6">
            <label className="block text-[.8rem] font-medium text-[#2d2926] mb-1">Contraseña</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-[11px] border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[#dc2626] text-[.82rem] mb-4 -mt-2">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="w-full py-[13px] bg-[#2d2926] text-[#fefcf9] rounded-full font-medium text-[.95rem] transition-all hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</> : 'Ingresar'}
          </button>
        </form>

        <p className="text-[.72rem] text-[#9ca3af] mt-5">Acceso restringido al equipo de festejá.</p>
      </div>

      {/* Shake keyframe — inyectado inline para no depender de Tailwind */}
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0) }
          20%,60%  { transform: translateX(-8px) }
          40%,80%  { transform: translateX(8px) }
        }
        .animate-shake { animation: shake .4s }
      `}</style>
    </div>
  )
}
