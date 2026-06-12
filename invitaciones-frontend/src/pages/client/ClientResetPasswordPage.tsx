import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { authService } from '@/services/authService'

const PASSWORD_RULES = {
  minLength: { label: 'Mínimo 8 caracteres', regex: /.{8,}/ },
  hasUpperCase: { label: 'Una letra mayúscula', regex: /[A-Z]/ },
  hasNumber: { label: 'Un número', regex: /[0-9]/ },
}

export default function ClientResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  // States
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Token no proporcionado')
      setLoading(false)
      return
    }

    validateToken()
  }, [token])

  async function validateToken() {
    try {
      setLoading(true)
      const result = await authService.verifyResetToken(token)
      setTokenValid(result.isValid)
      if (!result.isValid) {
        setError(result.message || 'Token inválido o expirado')
      }
    } catch (err) {
      setError('Error al validar el token')
      setTokenValid(false)
    } finally {
      setLoading(false)
    }
  }

  // Password validation
  const passwordValid = Object.values(PASSWORD_RULES).every((rule) => rule.regex.test(password))
  const passwordsMatch = password && password === confirmPassword
  const canSubmit = passwordValid && passwordsMatch && !validating

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setValidating(true)
    setError(null)
    try {
      await authService.resetPassword(token, password)
      setSuccess(true)
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al resetear la contraseña'
      setError(message)
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#fcfaf8]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#c5a572]" />
          <p className="text-[#6b7280]">Validando token...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#fcfaf8]">
        <div className="bg-white rounded-2xl px-10 py-12 w-[420px] max-w-[92vw] text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#f3f0ea]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 bg-[#fee2e2]">
            <AlertCircle className="w-7 h-7 text-[#dc2626]" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-3 text-[#2d2926]">
            Token inválido
          </h1>
          <p className="text-[#6b7280] text-[.9rem] leading-relaxed mb-6">
            {error || 'El link para resetear la contraseña no es válido o ha expirado.'}
          </p>
          <button
            onClick={() => navigate('/client/forgot-password')}
            className="w-full py-[13px] bg-[#c5a572] text-white rounded-full font-medium text-[.95rem] transition-all hover:bg-[#b09365]"
          >
            Solicitar nuevo link
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#fcfaf8]">
        <div className="bg-white rounded-2xl px-10 py-12 w-[420px] max-w-[92vw] text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#f3f0ea]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 bg-[#dcfce7]">
            <CheckCircle2 className="w-7 h-7 text-[#16a34a]" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-3 text-[#16a34a]">
            ¡Contraseña reseteada!
          </h1>
          <p className="text-[#6b7280] text-[.9rem] leading-relaxed mb-6">
            Tu contraseña ha sido actualizada exitosamente. Ahora podés iniciar sesión con tu nueva contraseña.
          </p>
          <button
            onClick={() => navigate('/client/login')}
            className="w-full py-[13px] bg-[#c5a572] text-white rounded-full font-medium text-[.95rem] transition-all hover:bg-[#b09365]"
          >
            Ir a login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#fcfaf8]">
      <div className="bg-white rounded-2xl px-10 py-12 w-[420px] max-w-[92vw] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#f3f0ea]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#faf8f5]">
            <Lock className="w-5 h-5 text-[#c5a572]" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#2d2926]">
            Nueva contraseña
          </h1>
        </div>
        <p className="text-[#6b7280] text-[.85rem] mb-6">Ingresá una contraseña segura</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password Input */}
          <div>
            <label className="block text-[.85rem] font-medium text-[#4b5563] mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 border-[2px] border-[#d1d5db] rounded-xl outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Rules */}
          <div className="bg-[#faf8f5] rounded-xl p-4 space-y-2">
            {Object.entries(PASSWORD_RULES).map(([key, rule]) => {
              const isMet = rule.regex.test(password)
              return (
                <div key={key} className="flex items-center gap-2 text-[.85rem]">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isMet ? 'bg-[#16a34a]' : 'bg-[#e5e7eb]'
                    }`}
                  >
                    {isMet && <span className="text-white text-[.65rem] font-bold">✓</span>}
                  </div>
                  <span className={isMet ? 'text-[#16a34a]' : 'text-[#6b7280]'}>{rule.label}</span>
                </div>
              )
            })}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-[.85rem] font-medium text-[#4b5563] mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError(null)
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 border-[2px] border-[#d1d5db] rounded-xl outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-[#dc2626] text-[.75rem] mt-1">Las contraseñas no coinciden</p>
            )}
            {confirmPassword && passwordsMatch && (
              <p className="text-[#16a34a] text-[.75rem] mt-1 flex items-center gap-1">
                ✓ Las contraseñas coinciden
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-[#dc2626] text-[.85rem] flex items-center gap-2">
              ⚠️ {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-[13px] bg-[#c5a572] text-white rounded-full font-medium text-[.95rem] transition-all hover:bg-[#b09365] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {validating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reseteando...
              </>
            ) : (
              'Resetear contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
