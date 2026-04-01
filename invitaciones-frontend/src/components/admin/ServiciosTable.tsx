import { useRef, useEffect } from 'react'
import type { Servicio } from '@/services/servicioService'

const fmtPrice = (n: number | undefined) =>
  n !== undefined ? `$${n.toLocaleString('es-AR')}` : '—'

export interface EditState {
  id: number | null
  value: string
}

interface Props {
  services: Servicio[]
  toggling: Set<number>
  editState: EditState
  onToggle: (id: number) => void
  onStartEdit: (s: Servicio) => void
  onEditChange: (value: string) => void
  onCommitEdit: () => void
  onCancelEdit: () => void
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left px-3 py-2.5 text-[.75rem] font-semibold uppercase tracking-[.5px] text-[#6b7280] bg-[#f4f5f7] border-b border-[#d1d5db] whitespace-nowrap">
    {children}
  </th>
)

export function ServiciosTable({
  services, toggling, editState,
  onToggle, onStartEdit, onEditChange, onCommitEdit, onCancelEdit,
}: Props) {
  const inputRef    = useRef<HTMLInputElement>(null)
  const cancelledRef = useRef(false)

  // Foco automático al entrar en modo edición
  useEffect(() => {
    if (editState.id !== null) inputRef.current?.focus()
  }, [editState.id])

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <TH>Nombre</TH>
            <TH>Descripción</TH>
            <TH>Precio</TH>
            <TH>Incluido Base</TH>
            <TH>Activo</TH>
          </tr>
        </thead>
        <tbody>
          {services.map((s, i) => (
            <tr
              key={s.id}
              className={`border-b border-[#f0f0f0] hover:bg-[#fafbfc] transition-colors ${i % 2 === 1 ? 'bg-[#fafbfd] hover:bg-[#f5f6f8]' : ''}`}
            >
              {/* Nombre */}
              <td className="px-3 py-2.5 text-[.85rem] font-medium">{s.nombre}</td>

              {/* Descripción */}
              <td className="px-3 py-2.5 text-[.85rem] text-[#6b7280]">
                {s.descripcion ?? <span className="text-[#9ca3af]">—</span>}
              </td>

              {/* Precio — editable con doble click si no está incluido en base */}
              <td
                className={`px-3 py-2.5 text-[.85rem] relative min-w-[110px] ${!s.incluidoEnBase ? 'cursor-pointer hover:bg-[rgba(197,165,114,.06)]' : ''}`}
                onDoubleClick={() => !s.incluidoEnBase && onStartEdit(s)}
                title={!s.incluidoEnBase ? 'Doble click para editar' : ''}
              >
                {editState.id === s.id ? (
                  <input
                    ref={inputRef}
                    type="number"
                    min={0}
                    step={1}
                    value={editState.value}
                    onChange={e => onEditChange(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter')  e.currentTarget.blur()
                      if (e.key === 'Escape') { cancelledRef.current = true; onCancelEdit() }
                    }}
                    onBlur={() => {
                      if (!cancelledRef.current) onCommitEdit()
                      cancelledRef.current = false
                    }}
                    className="w-28 px-2 py-1 border-2 border-[#c5a572] rounded text-[.85rem] outline-none bg-white"
                  />
                ) : s.incluidoEnBase ? (
                  <span className="text-[#9ca3af]">—</span>
                ) : (
                  <span className="font-medium">{fmtPrice(s.precio)}</span>
                )}
              </td>

              {/* Incluido en base */}
              <td className="px-3 py-2.5">
                {s.incluidoEnBase
                  ? <span className="inline-block px-2.5 py-0.5 rounded-full text-[.7rem] font-medium uppercase tracking-[.3px] bg-[#dcfce7] text-[#16a34a]">Sí</span>
                  : <span className="inline-block px-2.5 py-0.5 rounded-full text-[.7rem] font-medium uppercase tracking-[.3px] bg-[#e5e7eb] text-[#6b7280]">No</span>
                }
              </td>

              {/* Toggle activo */}
              <td className="px-3 py-2.5">
                <label className={`relative inline-block w-11 h-6 ${toggling.has(s.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={s.activo}
                    disabled={toggling.has(s.id)}
                    onChange={() => onToggle(s.id)}
                    className="sr-only peer"
                  />
                  <span className="absolute inset-0 bg-[#d1d5db] rounded-full transition-all peer-checked:bg-[#c5a572] after:content-[''] after:absolute after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:top-[3px] after:left-[3px] after:transition-all peer-checked:after:translate-x-5 after:shadow-sm" />
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-[.72rem] text-[#9ca3af] mt-3">
        Doble click en el precio para editar inline · Enter para guardar · Escape para cancelar
      </p>
    </div>
  )
}
