import { useState, useEffect, useId } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react'
import { useAuth } from '@/context/useAuth'

// ─── Validación de fortaleza de contraseña ───────────────

interface PasswordRule {
  label: string
  test: (p: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Al menos 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Un número', test: (p) => /\d/.test(p) },
]

export default function ClientRegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const formId = useId()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/client/dashboard', { replace: true })
  }, [isLoading, isAuthenticated, navigate])

  // ── Validación ────────────────────────────────────────────

  const passwordRulesPassed = PASSWORD_RULES.map((r) => r.test(password))
  const allRulesPassed = passwordRulesPassed.every(Boolean)

  function validate(): string | null {
    const userTrim = username.trim()
    const emailTrim = email.trim()

    if (userTrim.length < 3) return 'El usuario debe tener al menos 3 caracteres.'
    if (!/^[a-zA-Z0-9_]+$/.test(userTrim))
      return 'El usuario solo puede contener letras, números y guiones bajos.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim))
      return 'Ingresá un correo electrónico válido.'
    if (!allRulesPassed)
      return 'La contraseña no cumple los requisitos mínimos.'
    if (password !== confirmPassword)
      return 'Las contraseñas no coinciden.'
    return null
  }

  // ── Submit ────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    try {
      const { userId, email: userEmail } = await register(
        username.trim(),
        email.trim(),
        password,
      )
      navigate(`/client/verify-email?userId=${userId}&email=${encodeURIComponent(userEmail)}`)
    } catch (err: unknown) {
      const data = (err as any)?.response?.data
      if (data?.code === 'USERNAME_TAKEN') {
        setError('El nombre de usuario ya está en uso.')
      } else if (data?.code === 'EMAIL_TAKEN') {
        setError('El correo electrónico ya está en uso.')
      } else {
        setError('Ocurrió un error al crear la cuenta. Intentá de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return null

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#fcfaf8] overflow-y-auto py-8">
      <div className="bg-white rounded-2xl px-10 py-12 w-[420px] max-w-[92vw] text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#f3f0ea] my-auto">
        {/* Logo */}
        <div className="font-display text-3xl font-semibold mb-1">
          festejá<span className="text-[#c5a572] italic">.</span>
        </div>
        <p className="text-[#6b7280] text-[.85rem] mb-8">Creá tu cuenta gratis</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Usuario */}
          <div className="text-left mb-4">
            <label
              htmlFor={`${formId}-username`}
              className="block text-[.8rem] font-medium text-[#2d2926] mb-1"
            >
              Usuario
            </label>
            <input
              id={`${formId}-username`}
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu usuario"
              className="w-full px-3.5 py-[11px] border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
            />
            <p className="text-[.73rem] text-[#9ca3af] mt-1">
              Letras, números y guiones bajos. Sin espacios.
            </p>
          </div>

          {/* Email */}
          <div className="text-left mb-4">
            <label
              htmlFor={`${formId}-email`}
              className="block text-[.8rem] font-medium text-[#2d2926] mb-1"
            >
              Email
            </label>
            <input
              id={`${formId}-email`}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-3.5 py-[11px] border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
            />
          </div>

          {/* Contraseña */}
          <div className="text-left mb-4">
            <label
              htmlFor={`${formId}-password`}
              className="block text-[.8rem] font-medium text-[#2d2926] mb-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id={`${formId}-password`}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                className="w-full px-3.5 py-[11px] pr-10 border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Indicador de reglas */}
            {(passwordFocused || password.length > 0) && (
              <ul className="mt-2 space-y-1">
                {PASSWORD_RULES.map((rule, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    {passwordRulesPassed[i] ? (
                      <Check size={12} className="text-[#16a34a] flex-shrink-0" />
                    ) : (
                      <X size={12} className="text-[#9ca3af] flex-shrink-0" />
                    )}
                    <span
                      className={`text-[.72rem] transition-colors ${
                        passwordRulesPassed[i] ? 'text-[#16a34a]' : 'text-[#9ca3af]'
                      }`}
                    >
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="text-left mb-6">
            <label
              htmlFor={`${formId}-confirm`}
              className="block text-[.8rem] font-medium text-[#2d2926] mb-1"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id={`${formId}-confirm`}
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3.5 py-[11px] pr-10 border-[1.5px] rounded-lg text-[.9rem] outline-none transition-all focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)] ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-[#dc2626] focus:border-[#dc2626]'
                    : 'border-[#d1d5db] focus:border-[#c5a572]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-[.72rem] text-[#dc2626] mt-1">Las contraseñas no coinciden.</p>
            )}
          </div>

          {/* Error global */}
          {error && (
            <p className="text-[#dc2626] text-[.82rem] mb-4 -mt-2 text-left">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !username || !email || !password || !confirmPassword}
            className="w-full py-[13px] bg-[#2d2926] text-[#fefcf9] rounded-full font-medium text-[.95rem] transition-all hover:bg-[#4a4441] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
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
