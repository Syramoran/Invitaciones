import { useState } from 'react'
import type { WizardFormState } from '@/types/crearInvitacion'
import { CheckCircle2, Loader2, CreditCard, Tag, X, Gift } from 'lucide-react'

interface ValidarCodigoResult {
  valido: boolean
  porcentaje: number
  mensaje: string
}

interface Props {
  formState: WizardFormState
  loading: boolean
  error: string | null
  onGenerateAndPay: (codigoDescuento?: string) => void
  onActivarGratis: (codigoDescuento: string) => void
  onValidarCodigo: (codigo: string) => Promise<ValidarCodigoResult>
  onPrev: () => void
}

export function Step6Pago({
  formState,
  loading,
  error,
  onGenerateAndPay,
  onActivarGratis,
  onValidarCodigo,
  onPrev,
}: Props) {
  const serviciosBase = formState.step3.servicios.filter(s => s.incluidoEnBase)
  const serviciosOpcionales = formState.step3.servicios.filter(s => !s.incluidoEnBase && s.enabled)
  const precioBase = serviciosBase.reduce((sum, s) => sum + Number(s.precio), 0)
  const costoExtra = serviciosOpcionales.reduce((sum, s) => sum + Number(s.precio), 0)
  const totalSinDescuento = precioBase + costoExtra

  const [codigoInput, setCodigoInput] = useState('')
  const [codigoAplicado, setCodigoAplicado] = useState<string | null>(null)
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0)
  const [codigoError, setCodigoError] = useState<string | null>(null)
  const [codigoLoading, setCodigoLoading] = useState(false)

  const descuentoMonto = Math.round(totalSinDescuento * descuentoPorcentaje / 100)
  const totalFinal = totalSinDescuento - descuentoMonto
  const esGratis = descuentoPorcentaje === 100

  async function handleAplicarCodigo() {
    const codigo = codigoInput.trim().toUpperCase()
    if (!codigo) return
    setCodigoLoading(true)
    setCodigoError(null)
    try {
      const result = await onValidarCodigo(codigo)
      if (result.valido) {
        setCodigoAplicado(codigo)
        setDescuentoPorcentaje(result.porcentaje)
        setCodigoInput('')
      } else {
        setCodigoError(result.mensaje)
      }
    } catch {
      setCodigoError('Error al validar el código. Intentá de nuevo.')
    } finally {
      setCodigoLoading(false)
    }
  }

  function handleQuitarCodigo() {
    setCodigoAplicado(null)
    setDescuentoPorcentaje(0)
    setCodigoError(null)
  }

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

      <div className="bg-[#fcfaf8] border border-[#f3f0ea] rounded-2xl p-8 max-w-md mx-auto mb-6 shadow-sm">
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

          {codigoAplicado && descuentoMonto > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Descuento ({descuentoPorcentaje}%) — {codigoAplicado}
              </span>
              <span className="font-medium">- ${descuentoMonto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
            </div>
          )}

          <div className="flex justify-between pt-3 border-t border-[#e5e7eb] mt-4 font-bold text-lg">
            <span>Total a pagar</span>
            {esGratis ? (
              <span className="text-green-600">¡Gratis!</span>
            ) : (
              <span>
                ${totalFinal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}{' '}
                <span className="text-sm font-normal text-gray-500">ARS</span>
              </span>
            )}
          </div>
        </div>

        {/* Código de descuento */}
        {!codigoAplicado ? (
          <div className="border-t border-[#e5e7eb] pt-4">
            <p className="text-xs text-[#9ca3af] mb-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> ¿Tenés un código de descuento?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: BODA100"
                value={codigoInput}
                onChange={e => setCodigoInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleAplicarCodigo()}
                disabled={codigoLoading || loading}
                className="flex-1 px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5a572]/40 focus:border-[#c5a572] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAplicarCodigo}
                disabled={codigoLoading || loading || !codigoInput.trim()}
                className="px-4 py-2 bg-[#2d2926] text-white text-sm rounded-lg hover:bg-[#1a1714] disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                {codigoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
              </button>
            </div>
            {codigoError && (
              <p className="text-red-500 text-xs mt-1.5">{codigoError}</p>
            )}
          </div>
        ) : (
          <div className="border-t border-[#e5e7eb] pt-4">
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <span className="text-green-700 text-sm flex items-center gap-1.5 font-medium">
                <Tag className="w-4 h-4" />
                {codigoAplicado} — {descuentoPorcentaje}% de descuento aplicado
              </span>
              <button
                type="button"
                onClick={handleQuitarCodigo}
                disabled={loading}
                className="text-green-600 hover:text-green-800 ml-2 disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
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

        {esGratis ? (
          <button
            type="button"
            onClick={() => onActivarGratis(codigoAplicado!)}
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-full text-[.95rem] font-medium hover:bg-green-700 shadow-lg shadow-green-600/20 disabled:opacity-60 transition-all flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Gift className="w-5 h-5" />
            )}
            <span>Activar invitación gratis</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onGenerateAndPay(codigoAplicado ?? undefined)}
            disabled={loading}
            className="px-8 py-3 bg-[#009ee3] text-white rounded-full text-[.95rem] font-medium hover:bg-[#0089c7] shadow-lg shadow-[#009ee3]/20 disabled:opacity-60 transition-all flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
            <span>
              Pagar con Mercado Pago
              {codigoAplicado && descuentoPorcentaje > 0 && ` — $${totalFinal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
