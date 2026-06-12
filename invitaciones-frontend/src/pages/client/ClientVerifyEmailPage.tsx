import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/useAuth'

export default function ClientVerifyEmailPage() {
  const { verifyEmail } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSuccess(false)

    if (!code.trim()) {
      setError('Por favor, ingresá el código de verificación.')
      return
    }

    setSubmitting(true)
    try {
      if (!verifyEmail) throw new Error('verifyEmail not available')
      await verifyEmail(code.trim())
      setSuccess(true)
      setTimeout(() => {
        navigate('/client/login', { replace: true })
      }, 2000)
    } catch (err: unknown) {
      setError('Código inválido o expirado. Por favor, intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#fcfaf8]">
      <div className="bg-white rounded-2xl px-10 py-12 w-[380px] max-w-[92vw] text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#f3f0ea]">
        <div className="font-display text-3xl font-semibold mb-1">
          festejá<span className="text-[#c5a572] italic">.</span>
        </div>
        <p className="text-[#6b7280] text-[.85rem] mb-8">Verificá tu correo electrónico</p>

        {success ? (
          <div className="text-[#15803d] bg-[#dcfce7] p-4 rounded-lg mb-6 text-[.9rem]">
            ¡Correo verificado con éxito! Redirigiendo al login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <p className="text-[#6b7280] text-[.85rem] mb-4 text-left">
              Ingresá el código o token de verificación que recibiste por correo electrónico.
            </p>

            <div className="text-left mb-6">
              <label className="block text-[.8rem] font-medium text-[#2d2926] mb-1">Código de verificación</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ej. abc123def456"
                className="w-full px-3.5 py-[11px] border-[1.5px] border-[#d1d5db] rounded-lg text-[.9rem] outline-none transition-all focus:border-[#c5a572] focus:shadow-[0_0_0_3px_rgba(197,165,114,.15)]"
              />
            </div>

            {error && <p className="text-[#dc2626] text-[.82rem] mb-4 -mt-2">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !code}
              className="w-full py-[13px] bg-[#2d2926] text-[#fefcf9] rounded-full font-medium text-[.95rem] transition-all hover:bg-[#4a4441] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</> : 'Verificar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
