import type { WizardFormState } from '@/types/crearInvitacion'
import { CheckCircle2, Loader2, CreditCard } from 'lucide-react'

interface Props {
  formState: WizardFormState
  loading: boolean
  error: string | null
  onGenerateAndPay: () => void
  onPrev: () => void
  onSimulateDevPayment?: () => void
}

export function Step6Pago({ formState, loading, error, onGenerateAndPay, onPrev, onSimulateDevPayment }: Props) {
  const serviciosOpcionales = formState.step3.servicios.filter(s => !s.incluidoEnBase && s.enabled)
  const costoExtra = serviciosOpcionales.reduce((sum, s) => sum + Number(s.precio), 0)

  // Asumiendo un precio base de $30.000 ARS
  const precioBase = 30000
  const total = precioBase + costoExtra

  return (
    <div className="py-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#c5a572]/10 text-[#c5a572] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-display font-semibold mb-3">¡Todo listo!</h2>
        <p className="text-[#6b7280] max-w-md mx-auto">
          Tu invitación está configurada con todos los detalles. Para activarla y comenzar a compartirla con tus invitados, procedé con el pago único.
        </p>
      </div>

      <div className="bg-[#fcfaf8] border border-[#f3f0ea] rounded-2xl p-8 max-w-md mx-auto mb-8 shadow-sm">
        <h3 className="font-semibold text-lg border-b border-[#e5e7eb] pb-3 mb-4">Resumen de tu pedido</h3>

        <div className="space-y-3 mb-6 text-[.9rem]">
          <div className="flex justify-between">
            <span className="text-[#6b7280]">Invitación Digital Base</span>
            <span className="font-medium">${precioBase.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
          </div>

          {serviciosOpcionales.map(svc => (
            <div key={svc.id} className="flex justify-between">
              <span className="text-[#6b7280] flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#c5a572]"></div> {svc.nombre}
              </span>
              <span className="font-medium text-[#2d2926]">+ ${Number(svc.precio).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
            </div>
          ))}

          <div className="flex justify-between pt-3 border-t border-[#e5e7eb] mt-4 font-bold text-lg">
            <span>Total a pagar</span>
            <span>${total.toLocaleString('es-AR', { maximumFractionDigits: 0 })} <span className="text-sm font-normal text-gray-500">ARS</span></span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm max-w-md mx-auto text-center border border-red-100">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 mt-8">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="px-6 py-3 border-[1.5px] border-[#d1d5db] rounded-full text-[.95rem] font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Revisar detalles
        </button>
        <button
          type="button"
          onClick={onGenerateAndPay}
          disabled={loading}
          className="px-8 py-3 bg-[#009ee3] text-white rounded-full text-[.95rem] font-medium hover:bg-[#0089c7] shadow-lg shadow-[#009ee3]/20 disabled:opacity-60 transition-all flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CreditCard className="w-5 h-5" />
          )}
          <span>Pagar con Mercado Pago</span>
        </button>
        {import.meta.env.DEV && onSimulateDevPayment && (
          <button
            type="button"
            onClick={onSimulateDevPayment}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-full text-[.95rem] font-medium hover:bg-green-700 shadow-lg shadow-green-600/20 disabled:opacity-60 transition-all ml-4"
            title="Botón exclusivo para pruebas de desarrollo (simula un pago exitoso)"
          >
            Simular Pago (Dev)
          </button>
        )}
      </div>
    </div>
  )
}
