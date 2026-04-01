import type { ReactNode } from 'react'

interface PhoneMockupProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function PhoneMockup({ children, size = 'md' }: PhoneMockupProps) {
  const sizes = {
    sm: 'w-[240px] h-[480px]',
    md: 'w-[280px] h-[560px]',
    lg: 'w-[300px] h-[600px]',
  }

  return (
    <div
      className={`${sizes[size]} bg-charcoal rounded-[40px] p-3 shadow-xl relative`}
      style={{
        boxShadow:
          '0 24px 64px rgba(45,41,38,0.16), inset 0 0 0 2px rgba(255,255,255,0.08)',
      }}
    >
      {/* Notch */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-charcoal rounded-[20px] z-10" />
      
      {/* Screen */}
      <div className="w-full h-full rounded-[30px] overflow-hidden">
        {children}
      </div>
    </div>
  )
}
