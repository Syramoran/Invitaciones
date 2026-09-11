import { useState } from 'react'

interface Props {
  permitirPlusOne: boolean
  maxIntegrantesDefault: number | null
  onGuardar: (permitirPlusOne: boolean, maxIntegrantesDefault: number | null) => Promise<void>
}

export function SettingsPanel({ permitirPlusOne, maxIntegrantesDefault, onGuardar }: Props) {
  const [plusOne, setPlusOne] = useState(permitirPlusOne)
  const [maxIntegrantes, setMaxIntegrantes] = useState<string>(
    maxIntegrantesDefault !== null ? String(maxIntegrantesDefault) : '',
  )
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  async function handleGuardar() {
    setGuardando(true)
    setGuardado(false)
    const valor = maxIntegrantes.trim() === '' ? null : Number(maxIntegrantes)
    await onGuardar(plusOne, valor)
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#777777]">
        Configuración general
      </h2>

      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-medium text-[#1a1a1a]">Permitir plus-one</p>
          <p className="text-xs text-[#999999]">
            Los invitados individuales pueden sumar un acompañante al confirmar (salvo override puntual)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPlusOne(v => !v)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${plusOne ? 'bg-[#1a1a1a]' : 'bg-[#d1d5db]'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${plusOne ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      <div className="mt-3 border-t border-[#f0f0f0] py-3">
        <p className="mb-1 text-sm font-medium text-[#1a1a1a]">Máximo de integrantes por grupo</p>
        <p className="mb-2 text-xs text-[#999999]">
          Valor por defecto para grupos nuevos que no tengan su propio tope. Vacío = sin límite.
        </p>
        <input
          type="number"
          min={1}
          value={maxIntegrantes}
          onChange={e => setMaxIntegrantes(e.target.value)}
          placeholder="Sin límite"
          className="w-32 rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#555555]"
        />
      </div>

      <button
        type="button"
        onClick={handleGuardar}
        disabled={guardando}
        className="mt-4 rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : 'Guardar configuración'}
      </button>
    </div>
  )
}
