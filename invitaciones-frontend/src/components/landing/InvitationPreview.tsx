import { MapPin } from 'lucide-react'

export interface InvitationPreviewProps {
  type: 'boda' | 'quince' | 'cumple'
  data?: {
    // Boda
    name1?: string
    name2?: string
    date?: string
    ceremonyLocation?: string
    ceremonyTime?: string
    partyLocation?: string
    partyTime?: string
    dressCode?: string
    // Quince
    name?: string
    subtitle?: string
    valsTime?: string
    // Cumple
    age?: number
    when?: string
    where?: string
  }
}

/**
 * InvitationPreview - Componente placeholder para la vista previa de invitaciones.
 * 
 * Este componente puede ser reemplazado o extendido con diseños reales.
 * Recibe props para hidratar con informacion del evento.
 * 
 * @example
 * <InvitationPreview 
 *   type="boda" 
 *   data={{ 
 *     name1: "Camila", 
 *     name2: "Joaquin",
 *     date: "15 de Marzo, 2026",
 *     ceremonyLocation: "Iglesia Nuestra Senora del Pilar",
 *     ceremonyTime: "16:00 hs",
 *     partyLocation: "Estancia La Primavera",
 *     partyTime: "20:00 hs"
 *   }} 
 * />
 */
export function InvitationPreview({ type, data }: InvitationPreviewProps) {
  if (type === 'boda') {
    return (
      <div className="w-full h-full bg-gradient-to-b from-[#f7ede3] via-[#faf5ef] to-cream rounded-[30px] overflow-hidden flex flex-col items-center px-5 pt-12 pb-6">
        <div className="text-[0.5rem] text-gold tracking-[4px] mb-4">
          NOS CASAMOS
        </div>
        <div className="font-display text-2xl font-semibold text-center leading-tight text-charcoal">
          {data?.name1 || 'Camila'}
        </div>
        <div className="font-display italic text-3xl text-gold my-1">&</div>
        <div className="font-display text-2xl font-semibold text-center leading-tight text-charcoal">
          {data?.name2 || 'Joaquin'}
        </div>
        <div className="text-[0.7rem] text-warm-gray tracking-[2px] uppercase mt-3 mb-5">
          {data?.date || '15 de Marzo, 2026'}
        </div>
        <div className="w-10 h-px bg-gold-light mb-4" />
        <div className="text-[0.65rem] text-charcoal-soft text-center leading-[1.8]">
          <strong className="block text-[0.6rem] tracking-[2px] uppercase text-rose-deep mt-2.5 mb-0.5">
            Ceremonia
          </strong>
          {data?.ceremonyLocation || 'Iglesia Nuestra Senora del Pilar'}
          <br />
          {data?.ceremonyTime || '16:00 hs'}
          <strong className="block text-[0.6rem] tracking-[2px] uppercase text-rose-deep mt-2.5 mb-0.5">
            Fiesta
          </strong>
          {data?.partyLocation || 'Estancia La Primavera'}
          <br />
          {data?.partyTime || '20:00 hs'}
        </div>
        <div className="flex gap-3 my-5">
          <CountdownItem value={3} label="dias" />
          <CountdownItem value={14} label="horas" />
          <CountdownItem value={22} label="min" />
        </div>
        <div className="w-full h-[60px] bg-champagne rounded-lg mt-auto flex items-center justify-center gap-1.5 text-warm-gray-light text-[0.6rem]">
          <MapPin className="w-3 h-3" />
          Ver ubicacion
        </div>
        <div className="mt-3.5 bg-charcoal text-champagne-light text-[0.6rem] px-7 py-2.5 rounded-full font-medium tracking-[1px]">
          Confirmar asistencia
        </div>
      </div>
    )
  }

  if (type === 'quince') {
    return (
      <div className="w-full h-full bg-gradient-to-b from-[#fce4ec] via-[#fef5f7] to-white rounded-[30px] overflow-hidden flex flex-col items-center px-6 pt-12 pb-6">
        <div className="w-8 h-8 mb-3 text-[#d4a0b8]">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z M5 19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1H5v1z" />
          </svg>
        </div>
        <div className="font-display text-base font-medium text-[#b07090] tracking-[2px] uppercase mb-1">
          Mis quince
        </div>
        <div className="font-display text-3xl font-bold text-[#5a3a4a]">
          {data?.name || 'Martina'}
        </div>
        <div className="text-[0.7rem] text-[#b07090] mt-1.5">
          {data?.subtitle || 'Estas invitado a celebrar conmigo!'}
        </div>
        <div className="w-10 h-[1.5px] bg-[#d4a0b8] my-4" />
        <div className="text-[0.68rem] text-[#7a5a6a] text-center leading-[1.9]">
          <strong className="block text-[0.58rem] tracking-[2.5px] uppercase text-[#b07090] mt-3">
            Fecha
          </strong>
          {data?.date || 'Sabado 20 de Septiembre, 2026'}
          <strong className="block text-[0.58rem] tracking-[2.5px] uppercase text-[#b07090] mt-3">
            Lugar
          </strong>
          {data?.partyLocation || 'Salon Dorado, Rosario'}
          <br />
          {data?.partyTime || '21:00 hs'}
          <strong className="block text-[0.58rem] tracking-[2.5px] uppercase text-[#b07090] mt-3">
            Vals
          </strong>
          {data?.valsTime || '23:00 hs'}
        </div>
        <div className="mt-5 bg-[#5a3a4a] text-[#fce4ec] text-[0.6rem] px-7 py-2.5 rounded-full font-medium">
          Confirmar asistencia
        </div>
      </div>
    )
  }

  if (type === 'cumple') {
    return (
      <div className="w-full h-full bg-gradient-to-b from-[#e8f5e9] via-[#f1f8f2] to-white rounded-[30px] overflow-hidden flex flex-col items-center px-6 pt-12 pb-6">
        <div className="w-10 h-10 mb-2.5 text-[#4a7a4a]">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246L12 15.256l-3.611 2.625 1.379-4.246-3.612-2.625h4.465L12 6.76z" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
        <div className="font-display text-3xl font-bold text-[#3a5a3a]">
          {data?.name || 'Franco'}
        </div>
        <div className="text-sm text-[#6a8a6a] font-light">
          te invita a festejar
        </div>
        <div className="font-display text-6xl font-bold text-[#4a7a4a] leading-none my-3">
          {data?.age || 30}
        </div>
        <div className="text-[0.6rem] tracking-[3px] uppercase text-[#6a8a6a]">
          ANOS
        </div>
        <div className="w-10 h-[1.5px] bg-[#a0c8a0] my-4" />
        <div className="text-[0.68rem] text-[#5a7a5a] text-center leading-[1.9]">
          <strong className="block text-[0.58rem] tracking-[2.5px] uppercase text-[#4a7a4a] mt-3">
            Cuando
          </strong>
          {data?.when || 'Viernes 10 de Octubre, 21:00 hs'}
          <strong className="block text-[0.58rem] tracking-[2.5px] uppercase text-[#4a7a4a] mt-3">
            Donde
          </strong>
          {data?.where || 'Roof Bar, Nueva Cordoba'}
          <strong className="block text-[0.58rem] tracking-[2.5px] uppercase text-[#4a7a4a] mt-3">
            Dress code
          </strong>
          {data?.dressCode || 'Casual elegante'}
        </div>
        <div className="mt-5 bg-[#3a5a3a] text-[#e8f5e9] text-[0.6rem] px-7 py-2.5 rounded-full font-medium">
          Confirmar asistencia
        </div>
      </div>
    )
  }

  return null
}

function CountdownItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <span className="font-display text-xl font-semibold text-charcoal block">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[0.5rem] text-warm-gray tracking-[1px] uppercase">
        {label}
      </span>
    </div>
  )
}
