import type { ReactNode } from 'react'

const SERIF = "'Cormorant Garamond', Georgia, serif"

interface ThumbnailConfig {
  bg: string
  node: ReactNode
}

const THUMBNAILS: Record<string, ThumbnailConfig> = {
  'clasico-dorado': {
    bg: 'linear-gradient(180deg,#f7ede3,#efe0cc)',
    node: (
      <div style={{ border: '1.5px solid #ddc9a0', padding: '20px 22px', textAlign: 'center', width: 156 }}>
        <div style={{ fontSize: '0.42rem', letterSpacing: 4, color: '#c5a572', marginBottom: 8 }}>· BODA ·</div>
        <div style={{ fontFamily: SERIF, fontSize: '1rem', fontWeight: 600, color: '#2d2926' }}>Camila</div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '1.5rem', color: '#c5a572', lineHeight: 1.2 }}>&</div>
        <div style={{ fontFamily: SERIF, fontSize: '1rem', fontWeight: 600, color: '#2d2926' }}>Joaquín</div>
        <div style={{ fontSize: '0.42rem', letterSpacing: 2, color: '#8a7e76', marginTop: 8 }}>15 DE MARZO, 2026</div>
      </div>
    ),
  },
  'jardin-eterno': {
    bg: 'linear-gradient(180deg,#e8f0e6,#d4ddd0)',
    node: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>🌿</div>
        <div style={{ fontFamily: SERIF, fontSize: '1rem', fontWeight: 600, color: '#3a5a3a' }}>Camila</div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '1.5rem', color: '#a8b5a0', lineHeight: 1.2 }}>&</div>
        <div style={{ fontFamily: SERIF, fontSize: '1rem', fontWeight: 600, color: '#3a5a3a' }}>Joaquín</div>
        <div style={{ fontSize: '0.44rem', letterSpacing: 2, color: '#6a8a6a', marginTop: 6 }}>15 DE MARZO, 2026</div>
        <div style={{ marginTop: 8, fontSize: '0.7rem', letterSpacing: 6, color: '#a8b5a0' }}>🍃 🍃</div>
      </div>
    ),
  },
  'minimal-love': {
    bg: '#ffffff',
    node: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 2, background: '#2d2926', margin: '0 auto 12px' }} />
        <div style={{ fontFamily: SERIF, fontSize: '0.82rem', fontWeight: 700, color: '#2d2926', letterSpacing: 3, textTransform: 'uppercase' }}>CAMILA</div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '2rem', color: '#2d2926', lineHeight: 1.1 }}>&</div>
        <div style={{ fontFamily: SERIF, fontSize: '0.82rem', fontWeight: 700, color: '#2d2926', letterSpacing: 3, textTransform: 'uppercase' }}>JOAQUÍN</div>
        <div style={{ fontSize: '0.42rem', letterSpacing: 3, color: '#8a7e76', marginTop: 10 }}>15 · 03 · 2026</div>
        <div style={{ width: 36, height: 2, background: '#2d2926', margin: '10px auto 0' }} />
      </div>
    ),
  },
  'rosa-imperial': {
    bg: 'linear-gradient(180deg,#fce4ec,#f8d0dc)',
    node: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>👑</div>
        <div style={{ fontSize: '0.42rem', letterSpacing: 4, color: '#b07090' }}>MIS QUINCE</div>
        <div style={{ fontFamily: SERIF, fontSize: '1.5rem', fontWeight: 700, color: '#5a3a4a', margin: '4px 0' }}>Martina</div>
        <div style={{ width: 28, height: 1.5, background: '#d4a0b8', margin: '6px auto' }} />
        <div style={{ fontSize: '0.5rem', color: '#b07090' }}>20 de Septiembre, 2026</div>
      </div>
    ),
  },
  'noche-encantada': {
    bg: 'linear-gradient(180deg,#1a1a3a,#2a2a5a)',
    node: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.6rem', letterSpacing: 6, color: '#8080c0', marginBottom: 8 }}>✦ ✦ ✦</div>
        <div style={{ fontSize: '0.42rem', letterSpacing: 4, color: '#a0a0d0' }}>MIS QUINCE</div>
        <div style={{ fontFamily: SERIF, fontSize: '1.5rem', fontWeight: 600, color: '#e0d0ff', margin: '4px 0' }}>Martina</div>
        <div style={{ width: 24, height: 1, background: '#6060a0', margin: '6px auto' }} />
        <div style={{ fontSize: '0.5rem', color: '#a0a0d0' }}>20 de Septiembre, 2026</div>
      </div>
    ),
  },
  'primavera': {
    bg: 'linear-gradient(180deg,#fef9f0,#fdf0f5)',
    node: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', letterSpacing: 4, marginBottom: 4 }}>🌸 🌷</div>
        <div style={{ fontSize: '0.42rem', letterSpacing: 4, color: '#c08090' }}>MIS QUINCE</div>
        <div style={{ fontFamily: SERIF, fontSize: '1.5rem', fontWeight: 600, color: '#6a4a5a', margin: '4px 0' }}>Martina</div>
        <div style={{ width: 28, height: 1.5, background: '#e0b0c0', margin: '6px auto' }} />
        <div style={{ fontSize: '0.5rem', color: '#c08090' }}>20 de Septiembre, 2026</div>
      </div>
    ),
  },
  'fiesta-neon': {
    bg: 'linear-gradient(135deg,#1a1a2e,#16213e)',
    node: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>🎉</div>
        <div style={{ fontFamily: SERIF, fontSize: '1.1rem', fontWeight: 700, color: '#ff6fd8', textShadow: '0 0 12px rgba(255,111,216,0.6)' }}>Franco</div>
        <div style={{ fontSize: '2.6rem', fontWeight: 700, background: 'linear-gradient(90deg,#fc5c7d,#6a82fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>30</div>
        <div style={{ fontSize: '0.42rem', letterSpacing: 3, color: '#a0a0c0' }}>AÑOS PARTY</div>
      </div>
    ),
  },
  'elegante-30': {
    bg: 'linear-gradient(180deg,#f5f0ea,#ebe5dd)',
    node: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: SERIF, fontSize: '1rem', fontWeight: 600, color: '#2d2926' }}>Franco</div>
        <div style={{ width: 32, height: 2, background: '#c5a572', margin: '8px auto' }} />
        <div style={{ fontFamily: SERIF, fontSize: '3rem', fontWeight: 700, color: '#2d2926', lineHeight: 1 }}>30</div>
        <div style={{ fontSize: '0.42rem', letterSpacing: 4, color: '#8a7e76', marginTop: 8 }}>CELEBREMOS JUNTOS</div>
      </div>
    ),
  },
  'party-time': {
    bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)',
    node: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.4rem', letterSpacing: 4, marginBottom: 4 }}>🎊 🎈</div>
        <div style={{ fontSize: '0.5rem', letterSpacing: 2, color: '#f57c00', fontWeight: 500 }}>¡Cumple!</div>
        <div style={{ fontFamily: SERIF, fontSize: '1.1rem', fontWeight: 700, color: '#e65100' }}>Franco</div>
        <div style={{ fontSize: '2.6rem', fontWeight: 700, color: '#e65100', lineHeight: 1.1 }}>30</div>
        <div style={{ fontSize: '0.42rem', letterSpacing: 2, color: '#bf360c' }}>TE ESPERAMOS</div>
      </div>
    ),
  },
}

interface Props {
  id: string
}

export function TemplateThumbnail({ id }: Props) {
  const cfg = THUMBNAILS[id]

  if (!cfg) {
    return (
      <div className="h-[220px] flex items-center justify-center bg-ivory">
        <span className="text-warm-gray-light text-sm">Preview próximamente</span>
      </div>
    )
  }

  return (
    <div className="h-[220px] flex items-center justify-center" style={{ background: cfg.bg }}>
      {cfg.node}
    </div>
  )
}
