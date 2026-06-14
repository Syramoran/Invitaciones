import { useState } from 'react'
import type { GuestEntry } from '@/types/crearInvitacion'

interface Props {
  guests: GuestEntry[]
  onChange: (guests: GuestEntry[]) => void
  variant?: 'admin' | 'client'
}

interface BulkParseResult {
  guests: GuestEntry[]
  invalid: string[]
}

function parseBulk(text: string): BulkParseResult {
  const entries = text
    .split(/[,\n]/)
    .map(s => s.trim())
    .filter(Boolean)
  const guests: GuestEntry[] = []
  const invalid: string[] = []
  for (const entry of entries) {
    const parts = entry.split(/\s+/)
    if (parts.length !== 2) {
      invalid.push(entry)
    } else {
      guests.push({ nombre: parts[0], apellido: parts[1] })
    }
  }
  return { guests, invalid }
}

export function GuestListEditor({ guests, onChange, variant = 'client' }: Props) {
  const [showBulk, setShowBulk] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [bulkError, setBulkError] = useState<string | null>(null)

  const isAdmin = variant === 'admin'
  const inputBase = isAdmin
    ? 'px-3 py-2 border-[1.5px] border-[#d1d5db] rounded-lg text-[.85rem] focus:border-[#c5a572] focus:outline-none transition-colors'
    : 'px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-xl text-[.9rem] focus:border-[#c5a572] focus:outline-none transition-colors'

  function updateGuest(index: number, field: keyof GuestEntry, value: string) {
    const next = guests.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    onChange(next)
  }

  function removeGuest(index: number) {
    onChange(guests.filter((_, i) => i !== index))
  }

  function addGuest() {
    onChange([...guests, { nombre: '', apellido: '' }])
  }

  function applyBulk() {
    const { guests: parsed, invalid } = parseBulk(bulkText)
    if (invalid.length > 0) {
      setBulkError(
        `Cada invitado debe tener 1 nombre y 1 apellido. Revisá: ${invalid.slice(0, 3).join(' / ')}${invalid.length > 3 ? '…' : ''}`
      )
      return
    }
    if (parsed.length === 0) {
      setBulkError('Ingresá al menos un invitado.')
      return
    }
    const existing = guests.filter(g => g.nombre.trim() || g.apellido.trim())
    onChange([...existing, ...parsed])
    setBulkText('')
    setBulkError(null)
    setShowBulk(false)
  }

  function cancelBulk() {
    setBulkText('')
    setBulkError(null)
    setShowBulk(false)
  }

  const validCount = guests.filter(g => g.nombre.trim() && g.apellido.trim()).length

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <label className={isAdmin
          ? 'text-[.75rem] font-semibold uppercase tracking-wide text-[#6b7280]'
          : 'text-[.8rem] font-medium text-[#2d2926]'}>
          Lista de invitados
        </label>
        <button
          type="button"
          onClick={() => { setShowBulk(s => !s); setBulkError(null) }}
          className="text-[.78rem] font-medium text-[#c5a572] hover:text-[#a88a5d] transition-colors"
        >
          {showBulk ? 'Cerrar carga masiva' : '📋 Carga masiva'}
        </button>
      </div>

      {showBulk && (
        <div className="mb-4 p-3 bg-[#fdf8f0] border border-[#e8d9b5] rounded-lg">
          <p className="text-[.78rem] text-[#6b7280] mb-2">
            Pegá los invitados separados por <strong>coma</strong> o salto de línea. Formato:
            <code className="ml-1 px-1.5 py-0.5 bg-white border border-[#e5e7eb] rounded text-[.75rem]">Nombre Apellido</code>
            <span className="ml-1">(exactamente 1 nombre y 1 apellido por invitado).</span>
          </p>
          <textarea
            rows={4}
            value={bulkText}
            onChange={e => { setBulkText(e.target.value); setBulkError(null) }}
            placeholder="Juan Pérez, María García, Carlos López"
            className="w-full px-3 py-2 border-[1.5px] border-[#d1d5db] rounded-lg text-[.85rem] focus:border-[#c5a572] focus:outline-none resize-none transition-colors bg-white"
          />
          {bulkError && (
            <p className="mt-2 text-[.78rem] text-[#dc2626] font-medium">⚠ {bulkError}</p>
          )}
          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={cancelBulk}
              className="px-3 py-1.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.8rem] font-medium hover:border-[#2d2926] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={applyBulk}
              className="px-3 py-1.5 bg-[#2d2926] text-white rounded-lg text-[.8rem] font-medium hover:bg-[#4a4441] transition-colors"
            >
              Agregar a la lista
            </button>
          </div>
        </div>
      )}

      {guests.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-[#d1d5db] rounded-lg px-4 py-6 text-center text-[.82rem] text-[#6b7280]">
          Todavía no agregaste invitados. Hacé clic en <strong>+ Agregar invitado</strong> o usá la <strong>carga masiva</strong>.
        </div>
      ) : (
        <div className="space-y-2">
          {guests.map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[.75rem] text-[#9ca3af] w-6 text-right tabular-nums">{i + 1}.</span>
              <input
                type="text"
                value={g.nombre}
                onChange={e => updateGuest(i, 'nombre', e.target.value)}
                placeholder="Nombre"
                className={`${inputBase} flex-1`}
              />
              <input
                type="text"
                value={g.apellido}
                onChange={e => updateGuest(i, 'apellido', e.target.value)}
                placeholder="Apellido"
                className={`${inputBase} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeGuest(i)}
                aria-label={`Eliminar invitado ${i + 1}`}
                className="w-9 h-9 flex items-center justify-center rounded-lg border-[1.5px] border-[#e5e7eb] text-[#6b7280] hover:border-[#dc2626] hover:text-[#dc2626] transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addGuest}
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 border-[1.5px] border-dashed border-[#c5a572] text-[#a88a5d] rounded-lg text-[.85rem] font-medium hover:bg-[#fdf8f0] transition-colors"
      >
        <span className="text-base leading-none">+</span> Agregar invitado
      </button>

      {validCount > 0 && (
        <p className="mt-3 text-[.8rem] text-[#16a34a] font-medium">
          ✓ {validCount} invitado{validCount !== 1 ? 's' : ''} listo{validCount !== 1 ? 's' : ''} para recibir URL personalizada
        </p>
      )}
    </div>
  )
}
