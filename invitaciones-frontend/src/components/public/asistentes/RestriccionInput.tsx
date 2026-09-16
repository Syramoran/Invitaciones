import { useState, useEffect } from 'react'

export function RestriccionInput({
  valor,
  onGuardar,
  placeholder = 'Nombre - restricción alimentaria (ej: Ana - vegetariana)',
  type = 'text',
  className = '',
  id,
}: {
  valor: string | null
  onGuardar: (valor: string) => Promise<void>
  placeholder?: string
  type?: 'text' | 'number'
  className?: string
  id?: string
}) {
  const [texto, setTexto] = useState(valor ?? '')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    setTexto(valor ?? '')
  }, [valor])

  async function guardar() {
    if (texto === (valor ?? '')) return
    setGuardando(true)
    try {
      await onGuardar(texto)
    } catch {
      setTexto(valor ?? '')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <input
      id={id}
      type={type}
      value={texto}
      onChange={e => setTexto(e.target.value)}
      onBlur={guardar}
      disabled={guardando}
      placeholder={placeholder}
      className={`mt-2 w-full rounded-lg border border-champagne-dark px-2.5 py-1.5 text-xs text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 focus-visible:ring-2 focus-visible:ring-gold/50 disabled:opacity-50 ${className}`}
    />
  )
}
