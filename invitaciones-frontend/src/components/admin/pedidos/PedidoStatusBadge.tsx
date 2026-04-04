import type { EstadoPedido } from '@/types/adminPedido'

const CONFIG: Record<EstadoPedido, { label: string; classes: string }> = {
  PENDIENTE:  { label: 'Pendiente',  classes: 'bg-[#fef9c3] text-[#ca8a04]'  },
  CONTACTADO: { label: 'Contactado', classes: 'bg-[#dbeafe] text-[#2563eb]'  },
  COMPLETADO: { label: 'Completado', classes: 'bg-[#dcfce7] text-[#16a34a]'  },
  CANCELADO:  { label: 'Cancelado',  classes: 'bg-[#fee2e2] text-[#dc2626]'  },
}

interface Props {
  estado: EstadoPedido
}

export function PedidoStatusBadge({ estado }: Props) {
  const { label, classes } = CONFIG[estado] ?? CONFIG['PENDIENTE']
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[.7rem] font-medium uppercase tracking-[.3px] ${classes}`}
    >
      {label}
    </span>
  )
}
