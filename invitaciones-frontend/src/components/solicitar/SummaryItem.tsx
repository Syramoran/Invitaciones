import type { ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
}

export function SummaryItem({ label, value }: Props) {
  return (
    <div>
      <div className="text-[0.68rem] uppercase tracking-[2px] text-warm-gray mb-0.5">{label}</div>
      <div className="font-medium text-sm">{value}</div>
    </div>
  )
}
