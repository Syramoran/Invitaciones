import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Mail, RefreshCw, CheckCircle2 } from 'lucide-react'
import { authService } from '@/services/authService'
import { useAuth } from '@/context/useAuth'

const CODE_LENGTH = 6
const RESEND_COOLDOWN = 0 // sin cooldown por ahora (para facilitar testeos)

export default function ClientVerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()

  // Parámetros de la URL
  const userId = Number(searchParams.get('userId'))
  const email = searchParams.get('email') ?? ''
  // 'from=login' indica que el usuario llegó desde el login (no desde el registro)
  const fromLogin = searchParams.get('from') === 'login'
  // 'redirect' indica dónde ir después de verificar (ej: 'create')
  const redirectParam = searchParams.get('redirect')

  // Estado de los dígitos del OTP
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Estados de UI
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/client/dashboard', { replace: true })
  }, [isLoading, isAuthenticated, navigate])

  // Redirigir si no hay userId válido
  useEffect(() => {
    if (!isLoading && !userId) navigate('/client/register', { replace: true })
  }, [isLoading, userId, navigate])

  // Si viene del login: intentar reenviar código al montar
  // Usamos un ref para evitar doble llamada por React StrictMode en desarrollo
  const autoResendCalled = useRef(false)
  useEffect(() => {
    if (!userId || isLoading || !fromLogin) return
    if (autoResendCalled.current) return
    autoResendCalled.current = true
    authService.resendVerification(userId)
      .then(() => {
        // setCountdown(RESEND_COOLDOWN) // cooldown deshabilitado para testeos
      })
      .catch((err: any) => {
        // const data = err?.response?.data
        // if (data?.code === 'COOLDOWN' && data?.secondsRemaining) {
        //   setCountdown(data.secondsRemaining)
        // }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isLoading])

  // ── Countdown para reenvío ────────────────────────────────

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // ── Manejo de inputs OTP ─────────────────────────────────

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus()
  }, [])

  function handleDigitChange(index: number, value: string) {
    // Permitir pegar el código completo
    if (value.length > 1) {
      const cleaned = value.replace(/\D/g, '').slice(0, CODE_LENGTH)
      const newDigits = Array(CODE_LENGTH).fill('')
      cleaned.split('').forEach((ch, i) => {
        if (i < CODE_LENGTH) newDigits[i] = ch
      })
      setDigits(newDigits)
      setError(null)
      // Foco al último dígito pegado o al final
      const nextIndex = Math.min(cleaned.length, CODE_LENGTH - 1)
      focusInput(nextIndex)
      return
    }

    const digit = value.replace(/\D/g, '')
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)
    setError(null)

    // Avanzar al siguiente input automáticamente
    if (digit && index < CODE_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
      } else if (index > 0) {
        focusInput(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  // ── Verificar código ─────────────────────────────────────

  const code = digits.join('')

  async function handleVerify() {
    if (code.length < CODE_LENGTH || verifying) return
    setError(null)
    setVerifying(true)
    try {
      const data = await authService.verifyEmail(userId, code)
      setSuccess(true)
      // Pequeña pausa para mostrar el estado de éxito antes de redirigir
      setTimeout(() => {
        // Actualizar el contexto de auth con el usuario retornado
        // El token ya fue guardado por authService.verifyEmail()
        // Recargamos la sesión navegando al dashboard (AuthProvider lo detectará)
        const dashboardUrl = redirectParam ? `/client/dashboard?tab=${redirectParam}` : '/client/dashboard'
        navigate(dashboardUrl, { replace: true })
      }, 1200)
    } catch (err: unknown) {
      const data = (err as any)?.response?.data
      if (data?.code === 'INVALID_CODE') {
        setError('El código es incorrecto o ya expiró. Revisá el email o solicitá uno nuevo.')
      } else {
        setError('Ocurrió un error. Intentá de nuevo.')
      }
      // Limpiar el código para que el usuario lo reingrese
      setDigits(Array(CODE_LENGTH).fill(''))
      focusInput(0)
    } finally {
      setVerifying(false)
    }
  }

  // Auto-verificar cuando se completan los 6 dígitos
  useEffect(() => {
    if (code.length === CODE_LENGTH && !verifying && !success) {
      handleVerify()
    }
  }, [code])

  // ── Reenviar código ──────────────────────────────────────

  async function handleResend() {
    if (resending) return
    setError(null)
    setResending(true)
    try {
      await authService.resendVerification(userId)
      // setCountdown(RESEND_COOLDOWN) // cooldown deshabilitado para testeos
      setDigits(Array(CODE_LENGTH).fill(''))
      focusInput(0)
    } catch (err: unknown) {
      const data = (err as any)?.response?.data
      if (data?.code === 'COOLDOWN' && data?.secondsRemaining) {
        setCountdown(data.secondsRemaining)
        setError(`Esperá ${data.secondsRemaining} segundos antes de pedir otro código.`)
      } else {
        setError('No se pudo reenviar el código. Intentá de nuevo.')
      }
    } finally {
      setResending(false)
    }
  }

  if (isLoading || !userId) return null

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#fcfaf8]">
      <div className="bg-white rounded-2xl px-10 py-12 w-[420px] max-w-[92vw] text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#f3f0ea]">
        {/* Icono */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 transition-all duration-500 ${
            success
              ? 'bg-[#dcfce7]'
              : 'bg-[#faf8f5]'
          }`}
        >
          {success ? (
            <CheckCircle2 className="w-7 h-7 text-[#16a34a]" />
          ) : (
            <Mail className="w-7 h-7 text-[#c5a572]" />
          )}
        </div>

        {/* Título */}
        {success ? (
          <>
            <h1 className="font-display text-2xl font-semibold mb-2 text-[#16a34a]">
              ¡Cuenta verificada!
            </h1>
            <p className="text-[#6b7280] text-[.9rem]">Redirigiendo a tu dashboard...</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold mb-2">
              Verificá tu email
            </h1>
            <p className="text-[#6b7280] text-[.85rem] leading-relaxed mb-1">
              {fromLogin
                ? 'Te enviamos un código de verificación a'
                : 'Enviamos un código de 6 dígitos a'}
            </p>
            <p className="text-[#2d2926] text-[.9rem] font-medium mb-7">
              {email || 'tu correo electrónico'}
            </p>

            {/* Inputs OTP */}
            <div className="flex gap-2 justify-center mb-6">
              {Array(CODE_LENGTH)
                .fill(null)
                .map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digits[i]}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    disabled={verifying || success}
                    className={`w-11 h-14 text-center text-xl font-bold border-[2px] rounded-xl outline-none transition-all
                      ${digits[i] ? 'border-[#c5a572] bg-[#fdfaf5]' : 'border-[#d1d5db]'}
                      focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]
                      disabled:opacity-60`}
                    aria-label={`Dígito ${i + 1} del código`}
                  />
                ))}
            </div>

            {/* Estado de verificación */}
            {verifying && (
              <p className="flex items-center justify-center gap-2 text-[.85rem] text-[#6b7280] mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando...
              </p>
            )}

            {/* Error */}
            {error && (
              <p className="text-[#dc2626] text-[.82rem] mb-4">{error}</p>
            )}

            {/* Botón verificar (visible si no auto-verifica) */}
            {!verifying && code.length === CODE_LENGTH && (
              <button
                onClick={handleVerify}
                className="w-full py-[13px] bg-[#c5a572] text-white rounded-full font-medium text-[.95rem] transition-all hover:bg-[#b09365] mb-4"
              >
                Verificar código
              </button>
            )}

            {/* Reenviar */}
            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="flex items-center justify-center gap-1.5 mx-auto text-[.83rem] text-[#6b7280] hover:text-[#c5a572] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {countdown > 0
                ? `Reenviar código en ${countdown}s`
                : 'Reenviar código'}
            </button>

            <p className="text-[.75rem] text-[#9ca3af] mt-5">
              El código expira en 15 minutos.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
