import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { authService } from '@/services/authService'

export default function ClientForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Ingresá tu email')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSuccess(true)
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al procesar la solicitud'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#fcfaf8]">
        <div className="bg-white rounded-2xl px-10 py-12 w-[420px] max-w-[92vw] text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#f3f0ea]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 bg-[#dcfce7]">
            <Mail className="w-7 h-7 text-[#16a34a]" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-3 text-[#2d2926]">
            Revisa tu email
          </h1>
          <p className="text-[#6b7280] text-[.9rem] leading-relaxed mb-6">
            Si la cuenta existe, recibirás un email con instrucciones para resetear tu contraseña.
            El link es válido por 30 minutos.
          </p>
          <button
            onClick={() => navigate('/client/login')}
            className="w-full py-[13px] bg-[#c5a572] text-white rounded-full font-medium text-[.95rem] transition-all hover:bg-[#b09365]"
          >
            Volver a login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#fcfaf8]">
      <div className="bg-white rounded-2xl px-10 py-12 w-[420px] max-w-[92vw] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#f3f0ea]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/client/login')}
            className="p-1.5 hover:bg-[#f3f0ea] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <h1 className="font-display text-2xl font-semibold text-[#2d2926]">
            Olvidé mi contraseña
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-[.85rem] font-medium text-[#4b5563] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 border-[2px] border-[#d1d5db] rounded-xl outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
            />
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
            disabled={loading}
            className="w-full py-[13px] bg-[#c5a572] text-white rounded-full font-medium text-[.95rem] transition-all hover:bg-[#b09365] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar instrucciones'
            )}
          </button>
        </form>

        {/* Help text */}
        <p className="text-[.75rem] text-[#9ca3af] text-center mt-6">
          Te enviaremos un link para resetear tu contraseña si la cuenta existe.
        </p>
      </div>
    </div>
  )
}
