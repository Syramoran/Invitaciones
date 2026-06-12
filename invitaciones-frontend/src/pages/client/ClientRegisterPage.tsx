import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/useAuth'

export default function ClientRegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
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
    const emailTrim = email.trim()

    if (userTrim.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(userTrim)) {
      setError('El usuario solo puede contener letras, números y guiones bajos sin espacios.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailTrim)) {
      setError('Por favor, ingresá un correo electrónico válido.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setSubmitting(true)
    try {
      if (!register) throw new Error('Register not available')
      await register(username.trim(), email.trim(), password, nombreCompleto.trim() || undefined)
      navigate('/client/verify-email', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        setError('El nombre de usuario o correo ya está en uso')
      } else {
        setError('Error al registrar la cuenta')
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
        <p className="text-[#6b7280] text-[.85rem] mb-8">Creá tu cuenta gratis</p>

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

          <div className="text-left mb-4">
            <label className="block text-[.8rem] font-medium text-[#2d2926] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-3.5 py-[11px] border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
            />
          </div>

          <div className="text-left mb-4">
            <label className="block text-[.8rem] font-medium text-[#2d2926] mb-1">Nombre Completo (Opcional)</label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={e => setNombreCompleto(e.target.value)}
              placeholder="Ej. Juan Pérez"
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
            disabled={submitting || !username || !email || !password}
            className="w-full py-[13px] bg-[#2d2926] text-[#fefcf9] rounded-full font-medium text-[.95rem] transition-all hover:bg-[#4a4441] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : 'Registrarme'}
          </button>
        </form>

        <p className="text-[.85rem] text-[#6b7280] mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/client/login" className="text-[#c5a572] hover:underline font-medium">
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  )
}
