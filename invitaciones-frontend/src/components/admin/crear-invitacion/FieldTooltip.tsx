import { useState } from 'react'

export function FieldTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)

  return (
    <div
      className="relative inline-flex flex-shrink-0"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={text}
        className="w-4 h-4 rounded-full bg-[#c5a572] text-white text-[.55rem] font-bold flex items-center justify-center cursor-help select-none"
      >
        ?
      </button>
      {show && (
        <div className="absolute z-30 bottom-full left-0 mb-2 px-2.5 py-1.5 bg-[#2d2926] text-white rounded-lg shadow-xl text-[.72rem] leading-snug w-max max-w-[210px] pointer-events-none">
          {text}
          <div className="absolute top-full left-3 border-4 border-transparent border-t-[#2d2926]" />
        </div>
      )}
    </div>
  )
}
