export function InvitacionEnviadaToggle({
  enviada,
  onChange,
}: {
  enviada: boolean
  onChange: (enviada: boolean) => void
}) {
  return (
    <button
      type="button"
      aria-pressed={enviada}
      onClick={() => onChange(!enviada)}
      className={
        'rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1 ' +
        (enviada
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          : 'bg-[#f3f0ea] text-warm-gray hover:bg-champagne-dark/60')
      }
    >
      {enviada ? '✓ Invitación enviada' : 'Marcar como enviada'}
    </button>
  )
}
