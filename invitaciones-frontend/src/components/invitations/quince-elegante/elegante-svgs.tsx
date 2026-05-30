/**
 * Inline SVG decorative components for quince-elegante template.
 */

interface SvgProps {
  className?: string
  style?: React.CSSProperties
}

/** Separador elegante — two horizontal lines with a diamond center */
export function SeparadorElegante({ className, style }: SvgProps) {
  return (
    <svg
      viewBox="0 0 240 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <line x1="0" y1="8" x2="104" y2="8" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <rect x="112" y="2" width="16" height="12" rx="2" transform="rotate(45 120 8)" fill="currentColor" fillOpacity="0.7" />
      <line x1="136" y1="8" x2="240" y2="8" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
  )
}

/** Destello / estrella de 4 puntas */
export function DestelloSvg({ className, style }: SvgProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M10 0 L11.8 8.2 L20 10 L11.8 11.8 L10 20 L8.2 11.8 L0 10 L8.2 8.2 Z" />
    </svg>
  )
}

/** Dresscode / vestimenta icon */
export function DresscodeEleganteSvg({ className, style }: SvgProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
    </svg>
  )
}
