import type { ReactNode } from 'react'

interface PhoneMockupProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function PhoneMockup({ children, size = 'md' }: PhoneMockupProps) {
  const sizeMap = {
    sm: 'w-[240px] h-[480px]',
    md: 'w-[280px] h-[560px]',
    lg: 'w-[300px] h-[600px]',
  }

  return (
    <div className={`${sizeMap[size]} relative`}>
      {/* Phone chassis */}
      <div
        className="w-full h-full rounded-[44px] relative"
        style={{
          background: 'linear-gradient(170deg, #2d2d2d 0%, #1a1a1a 100%)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.28), inset 0 0 0 1.5px rgba(255,255,255,0.13), 0 0 0 2px #111',
        }}
      >
        {/* Mute switch (left top) */}
        <div className="absolute -left-[4px] top-[88px] w-[4px] h-6 bg-[#2a2a2a] rounded-l-full" style={{ boxShadow: '-1px 0 0 rgba(255,255,255,0.05)' }} />
        {/* Volume up (left) */}
        <div className="absolute -left-[4px] top-[128px] w-[4px] h-10 bg-[#2a2a2a] rounded-l-full" style={{ boxShadow: '-1px 0 0 rgba(255,255,255,0.05)' }} />
        {/* Volume down (left) */}
        <div className="absolute -left-[4px] top-[178px] w-[4px] h-10 bg-[#2a2a2a] rounded-l-full" style={{ boxShadow: '-1px 0 0 rgba(255,255,255,0.05)' }} />
        {/* Power button (right) */}
        <div className="absolute -right-[4px] top-[130px] w-[4px] h-16 bg-[#2a2a2a] rounded-r-full" style={{ boxShadow: '1px 0 0 rgba(255,255,255,0.05)' }} />

        {/* Screen */}
        {/* translateZ(0) forces a GPU compositing layer so overflow-hidden+border-radius clips correctly in Edge */}
        <div className="absolute inset-[7px] rounded-[37px] overflow-hidden bg-black" style={{ transform: 'translateZ(0)' }}>
          {children}
          {/* Punch-hole camera */}
          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#0a0a0a] z-20"
            style={{ boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.12), 0 0 0 1px rgba(0,0,0,0.6)' }}
          />
        </div>
      </div>
    </div>
  )
}
