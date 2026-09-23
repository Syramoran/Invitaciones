import type { CSSProperties, ReactNode } from 'react'
import { useRevealOnScroll } from './use-reveal-on-scroll'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: string
}

export function Reveal({ children, className = '', delay }: RevealProps) {
  const { ref, inView } = useRevealOnScroll<HTMLDivElement>()
  const style: CSSProperties | undefined = delay ? { animationDelay: delay } : undefined

  return (
    <div
      ref={ref}
      data-inview={inView}
      style={style}
      className={`opacity-0 data-[inview=true]:animate-fade-in-up ${className}`}
    >
      {children}
    </div>
  )
}
