import type { InvitacionStatus } from '@/types/adminInvitacion'

const CONFIG: Record<InvitacionStatus, { label: string; classes: string }> = {
  active:   { label: 'Activa',        classes: 'bg-[#dcfce7] text-[#16a34a]' },
  expiring: { label: 'Expira pronto', classes: 'bg-[#ffedd5] text-[#ea580c]' },
  expired:  { label: 'Expirada',      classes: 'bg-[#fee2e2] text-[#dc2626]' },
}

interface Props {
  status: InvitacionStatus
}

export function InvitacionStatusBadge({ status }: Props) {
  const { label, classes } = CONFIG[status]
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[.7rem] font-medium uppercase tracking-[.3px] ${classes}`}
    >
      {label}
    </span>
  )
}
