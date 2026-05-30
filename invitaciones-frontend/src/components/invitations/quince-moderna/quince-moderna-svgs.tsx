/**
 * Inline SVG ornaments for the quince-moderna template.
 * All strokes use `currentColor` — set `color` via CSS/Tailwind to tint them.
 */

interface SvgProps {
  className?: string
  style?: React.CSSProperties
}

/** Two diagonal lines emanating from the top-left corner of a section.
 *  Place with `position: absolute; top: 0; left: 0;` inside a `relative overflow-hidden` parent. */
export function CornerTopLeft({ className, style }: SvgProps) {
  return (
    <svg
      width="150"
      height="90"
      viewBox="0 0 150 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <line x1="0.5" y1="36" x2="147" y2="0.5" stroke="currentColor" strokeLinecap="round" />
      <line x1="0.5" y1="88" x2="52.5" y2="0.5" stroke="currentColor" strokeLinecap="round" />
    </svg>
  )
}

/** Mirror of CornerTopLeft — place with `position: absolute; bottom: 0; right: 0;`. */
export function CornerBottomRight({ className, style }: SvgProps) {
  return (
    <svg
      width="150"
      height="90"
      viewBox="0 0 150 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: "rotate(180deg)", ...style }}
      aria-hidden="true"
    >
      <line x1="0.5" y1="36" x2="147" y2="0.5" stroke="currentColor" strokeLinecap="round" />
      <line x1="0.5" y1="88" x2="52.5" y2="0.5" stroke="currentColor" strokeLinecap="round" />
    </svg>
  )
}

/** Horizontal rule with a centered diamond — used as section divider. */
export function DiamondDivider({ className, style }: SvgProps) {
  return (
    <svg
      width="160"
      height="20"
      viewBox="0 0 160 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <line x1="0" y1="10" x2="62" y2="10" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.8" />
      <path d="M80 2 L90 10 L80 18 L70 10 Z" stroke="currentColor" strokeWidth="0.9" fill="none" />
      <line x1="98" y1="10" x2="160" y2="10" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.8" />
    </svg>
  )
}
