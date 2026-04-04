import type { EstadoPedido } from '@/types/adminPedido'

const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'CONTACTADO', 'COMPLETADO', 'CANCELADO']
const ESTADO_LABEL: Record<EstadoPedido, string> = {
  PENDIENTE:  'Pendiente',
  CONTACTADO: 'Contactado',
  COMPLETADO: 'Completado',
  CANCELADO:  'Cancelado',
}

const TIPOS = ['Boda', 'Quinceañera', 'Cumpleaños']

export interface PedidoFilterValues {
  estado: EstadoPedido | ''
  tipo: string
  cliente: string
}

interface Props {
  values: PedidoFilterValues
  onChange: (values: PedidoFilterValues) => void
}

const labelClass = 'block text-[.7rem] font-medium text-[#6b7280] mb-1'
const inputClass =
  'px-3 py-2 border-[1.5px] border-[#d1d5db] rounded-lg text-[.82rem] bg-white min-w-[160px] focus:outline-none focus:border-[#c5a572] transition-colors'

export function PedidoFilters({ values, onChange }: Props) {
  function set(patch: Partial<PedidoFilterValues>) {
    onChange({ ...values, ...patch })
  }

  return (
    <div className="flex flex-wrap gap-4 items-end mb-5">
      {/* Estado */}
      <div>
        <label className={labelClass}>Estado</label>
        <select
          value={values.estado}
          onChange={e => set({ estado: e.target.value as EstadoPedido | '' })}
          className={inputClass}
        >
          <option value="">Todos</option>
          {ESTADOS.map(e => (
            <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
          ))}
        </select>
      </div>

      {/* Tipo (client-side) */}
      <div>
        <label className={labelClass}>Tipo</label>
        <select
          value={values.tipo}
          onChange={e => set({ tipo: e.target.value })}
          className={inputClass}
        >
          <option value="">Todos</option>
          {TIPOS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Buscar cliente (client-side) */}
      <div>
        <label className={labelClass}>Buscar cliente</label>
        <input
          type="text"
          value={values.cliente}
          onChange={e => set({ cliente: e.target.value })}
          placeholder="Nombre..."
          className={`${inputClass} min-w-[200px]`}
        />
      </div>

      {/* Clear */}
      {(values.estado || values.tipo || values.cliente) && (
        <button
          onClick={() => onChange({ estado: '', tipo: '', cliente: '' })}
          className="text-[.8rem] text-[#6b7280] underline hover:text-[#2d2926] transition-colors self-end pb-2"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
