import { useState } from 'react'

export function RestriccionInput({
  valor,
  onGuardar,
  placeholder = 'Nombre - restricción alimentaria (ej: Ana - vegetariana)',
}: {
  valor: string | null
  onGuardar: (valor: string) => Promise<void>
  placeholder?: string
}) {
  const [texto, setTexto] = useState(valor ?? '')
  const [guardando, setGuardando] = useState(false)

  async function guardar() {
    if (texto === (valor ?? '')) return
    setGuardando(true)
    try {
      await onGuardar(texto)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <input
      value={texto}
      onChange={e => setTexto(e.target.value)}
      onBlur={guardar}
      disabled={guardando}
      placeholder={placeholder}
      className="mt-2 w-full rounded-lg border border-[#e0e0e0] px-2.5 py-1.5 text-xs text-[#555555] outline-none focus:border-[#555555] disabled:opacity-50"
    />
  )
}
