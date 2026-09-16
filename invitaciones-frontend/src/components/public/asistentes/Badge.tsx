export function Badge({ children, tono }: { children: React.ReactNode; tono: 'ok' | 'pendiente' }) {
  const clases = tono === 'ok' ? 'bg-green-100 text-green-700' : 'bg-[#f3f0ea] text-warm-gray'
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${clases}`}>{children}</span>
}
