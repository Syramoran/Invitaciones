interface Props {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  value: string | number
  label: string
}

export function MetricCard({ icon, iconBg, iconColor, value, label }: Props) {
  return (
    <div className="bg-white rounded-[10px] p-[22px] shadow-[0_1px_3px_rgba(0,0,0,.08)] flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
      <div>
        <div className="text-[1.8rem] font-bold leading-tight">{value}</div>
        <div className="text-[.78rem] text-[#6b7280] font-normal mt-0.5">{label}</div>
      </div>
    </div>
  )
}
