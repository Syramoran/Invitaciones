export type InvitacionTab = 'all' | 'active' | 'expiring' | 'expired'

const TABS: { id: InvitacionTab; label: string }[] = [
  { id: 'all',      label: 'Todas' },
  { id: 'active',   label: 'Activas' },
  { id: 'expiring', label: 'Próximas a Expirar' },
  { id: 'expired',  label: 'Expiradas' },
]

interface Props {
  activeTab: InvitacionTab
  counts: Record<InvitacionTab, number>
  onChange: (tab: InvitacionTab) => void
}

export function InvitacionesTabs({ activeTab, counts, onChange }: Props) {
  return (
    <div className="flex gap-1 border-b-2 border-[#e5e7eb] mb-5">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 px-5 py-2.5 text-[.85rem] font-medium border-b-2 -mb-0.5 transition-colors whitespace-nowrap ${
            activeTab === tab.id
              ? 'text-[#2d2926] border-[#c5a572]'
              : 'text-[#6b7280] border-transparent hover:text-[#2d2926]'
          }`}
        >
          {tab.label}
          <span
            className={`text-[.7rem] px-1.5 py-0.5 rounded-full font-semibold ${
              activeTab === tab.id
                ? 'bg-[#c5a572] text-white'
                : 'bg-[#e5e7eb] text-[#6b7280]'
            }`}
          >
            {counts[tab.id]}
          </span>
        </button>
      ))}
    </div>
  )
}
