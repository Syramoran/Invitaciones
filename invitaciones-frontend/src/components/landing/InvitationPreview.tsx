import { useRef, useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import type { InvitacionPublica } from '@/types/invitation'

// ─── Boda Clásica sections ────────────────────────────────────────────────────
import { HeroSection as BodaClasicaHero } from '@/components/invitations/boda-clasica/hero-section'
import { CountdownSection as BodaClasicaCountdown } from '@/components/invitations/boda-clasica/countdown-section'
import { TaglineSection as BodaClasicaTagline } from '@/components/invitations/boda-clasica/tagline-section'
import { LocationsSection as BodaClasicaLocations } from '@/components/invitations/boda-clasica/locations-section'
import { InfoSection as BodaClasicaInfo } from '@/components/invitations/boda-clasica/info-section'
import { StorySection as BodaClasicaStory } from '@/components/invitations/boda-clasica/story-section'
import { GiftSection as BodaClasicaGift } from '@/components/invitations/boda-clasica/gift-section'
import { RsvpSection as BodaClasicaRsvp } from '@/components/invitations/boda-clasica/rsvp-section'

// ─── Boda Moderna sections ────────────────────────────────────────────────────
import { HeroSection as BodaModernaHero } from '@/components/invitations/boda-moderna/hero-section'
import { CountdownSection as BodaModernaCountdown } from '@/components/invitations/boda-moderna/countdown-section'
import { LocationsSection as BodaModernaLocations } from '@/components/invitations/boda-moderna/locations-section'
import { InfoSection as BodaModernaInfo } from '@/components/invitations/boda-moderna/info-section'
import { StorySection as BodaModernaStory } from '@/components/invitations/boda-moderna/story-section'
import { RegaloSection as BodaModernaRegalo } from '@/components/invitations/boda-moderna/regalo-section'
import { RsvpSection as BodaModernaRsvp } from '@/components/invitations/boda-moderna/rsvp-section'

// ─── Boda Rústica sections ────────────────────────────────────────────────────
import { HeroSection as BodaRusticaHero } from '@/components/invitations/boda-rustica/hero-section'
import { CountdownSection as BodaRusticaCountdown } from '@/components/invitations/boda-rustica/countdown-section'
import { TaglineSection as BodaRusticaTagline } from '@/components/invitations/boda-rustica/tagline-section'
import { LocationsSection as BodaRusticaLocations } from '@/components/invitations/boda-rustica/locations-section'
import { InfoSection as BodaRusticaInfo } from '@/components/invitations/boda-rustica/info-section'
import { StorySection as BodaRusticaStory } from '@/components/invitations/boda-rustica/story-section'
import { GiftSection as BodaRusticaGift } from '@/components/invitations/boda-rustica/gift-section'
import { RsvpSection as BodaRusticaRsvp } from '@/components/invitations/boda-rustica/rsvp-section'

// ─── Quince Princesa sections ─────────────────────────────────────────────────
import { HeroSection as QuincePrincesaHero } from '@/components/invitations/quince-princesa/hero-section'
import { CountdownSection as QuincePrincesaCountdown } from '@/components/invitations/quince-princesa/countdown-section'
import { InfoSection as QuincePrincesaInfo } from '@/components/invitations/quince-princesa/info-section'
import { StorySection as QuincePrincesaStory } from '@/components/invitations/quince-princesa/story-section'
import { RsvpSection as QuincePrincesaRsvp } from '@/components/invitations/quince-princesa/rsvp-section'

// ─── Quince Elegante sections ────────────────────────────────────────────────
import { HeroSection as QuinceEleganteHero } from '@/components/invitations/quince-elegante/hero-section'
import { CountdownSection as QuinceEleganteCountdown } from '@/components/invitations/quince-elegante/countdown-section'
import { InfoSection as QuinceEleganteInfo } from '@/components/invitations/quince-elegante/info-section'
import { MapSection as QuinceEleganteMap } from '@/components/invitations/quince-elegante/map-section'
import { StorySection as QuinceEleganteStory } from '@/components/invitations/quince-elegante/story-section'
import { RsvpSection as QuinceEleganteRsvp } from '@/components/invitations/quince-elegante/rsvp-section'

// ─── Quince Moderna sections ──────────────────────────────────────────────────
import { HeroSection as QuinceModernaHero } from '@/components/invitations/quince-moderna/hero-section'
import { CountdownSection as QuinceModernaCountdown } from '@/components/invitations/quince-moderna/countdown-section'
import { InfoSection as QuinceModernaInfo } from '@/components/invitations/quince-moderna/info-section'
import { MapSection as QuinceModernaMap } from '@/components/invitations/quince-moderna/map-section'
import { StorySection as QuinceModernaStory } from '@/components/invitations/quince-moderna/story-section'
import { RsvpSection as QuinceModernaRsvp } from '@/components/invitations/quince-moderna/rsvp-section'

// ─── Cumple Festivo sections ──────────────────────────────────────────────────
import { HeroSection as CumpleFestivoHero } from '@/components/invitations/cumple-festivo/hero-section'
import { CountdownSection as CumpleFestivoCountdown } from '@/components/invitations/cumple-festivo/countdown-section'
import { InfoSection as CumpleFestivoInfo } from '@/components/invitations/cumple-festivo/info-section'
import { MapSection as CumpleFestivoMap } from '@/components/invitations/cumple-festivo/map-section'
import { StorySection as CumpleFestivoStory } from '@/components/invitations/cumple-festivo/story-section'
import { RsvpSection as CumpleFestivoRsvp } from '@/components/invitations/cumple-festivo/rsvp-section'

// ─── Constants ───────────────────────────────────────────────────────────────
// Invitation content design width (px)
const CONTENT_W = 430

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ─── Reusable scroll wrapper ──────────────────────────────────────────────────
interface ScrollingPreviewWrapperProps {
  children: ReactNode
  bgColor?: string
  cssVars?: React.CSSProperties
}

function ScrollingPreviewWrapper({
  children,
  bgColor = '#faf7f2',
  cssVars = {},
}: ScrollingPreviewWrapperProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({ y: 0, resumeAutoAt: 0, lastTouchY: 0 })
  const scaleRef = useRef(256 / CONTENT_W)
  const [, forceUpdate] = useState(0)

  // Measure container and recompute scale whenever it resizes
  useLayoutEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    const measure = () => {
      const w = outer.clientWidth
      if (w > 0) {
        scaleRef.current = w / CONTENT_W
        forceUpdate(n => n + 1)
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(outer)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let animId: number
    let lastTime: number | null = null
    const SPEED = 0.04
    const PAUSE_MS = 3000

    const s = stateRef.current

    const getScale = () => scaleRef.current
    const getPhoneH = () => outerRef.current?.clientHeight ?? 536

    const getMaxY = () => {
      const el = innerRef.current
      if (!el || el.offsetHeight === 0) return 0
      return Math.max(0, el.offsetHeight * getScale() - getPhoneH())
    }

    const applyTransform = (yOverride?: number) => {
      const el = innerRef.current
      if (!el) return
      const scale = getScale()
      const maxY = getMaxY()
      const clamped = Math.max(0, Math.min(yOverride ?? s.y, maxY))
      el.style.transform = `translateY(${-clamped}px) scale(${scale})`
    }

    const loop = (now: number) => {
      if (lastTime === null) lastTime = now
      const dt = Math.min(now - lastTime, 50)
      lastTime = now
      if (now >= s.resumeAutoAt) {
        const maxY = getMaxY()
        s.y += SPEED * dt
        if (s.y > maxY + 200) s.y = 0
        applyTransform()
      }
      animId = requestAnimationFrame(loop)
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      s.y = Math.max(0, Math.min(s.y + e.deltaY / getScale(), getMaxY()))
      s.resumeAutoAt = performance.now() + PAUSE_MS
      applyTransform()
    }

    const onTouchStart = (e: TouchEvent) => {
      s.lastTouchY = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const dy = s.lastTouchY - e.touches[0].clientY
      s.lastTouchY = e.touches[0].clientY
      s.y = Math.max(0, Math.min(s.y + dy / getScale(), getMaxY()))
      s.resumeAutoAt = performance.now() + PAUSE_MS
      applyTransform()
    }

    const outer = outerRef.current
    if (outer) {
      outer.addEventListener('wheel', onWheel, { passive: false })
      outer.addEventListener('touchstart', onTouchStart, { passive: true })
      outer.addEventListener('touchmove', onTouchMove, { passive: false })
    }

    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      if (outer) {
        outer.removeEventListener('wheel', onWheel)
        outer.removeEventListener('touchstart', onTouchStart)
        outer.removeEventListener('touchmove', onTouchMove)
      }
    }
  }, [])

  const scale = scaleRef.current

  return (
    <div
      ref={outerRef}
      className="w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing"
      style={{ background: bgColor, transform: 'translateZ(0)', ...cssVars }}
    >
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${CONTENT_W}px`,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          background: bgColor,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Mock data ────────────────────────────────────────────────────────────────

// Boda Clásica
const COLOR_CLASICA_DORADO = '#BD9848'
const COLOR_CLASICA_ACCENT = '#7a5c3a'
const MOCK_BODA_CLASICA: InvitacionPublica = {
  id: 'preview',
  titulo: 'Camila & Mateo',
  fechaEvento: '2026-10-17T00:00:00.000Z',
  horaEvento: '19:00',
  ubicacion: 'multiple',
  direccion: 'Buenos Aires',
  latitud: -34.6037,
  longitud: -58.3816,
  colorPrimario: COLOR_CLASICA_ACCENT,
  camposEspecificos: {
    novio1: 'Camila',
    novio2: 'Mateo',
    tipoCeremonia: 'Iglesia',
    dressCode: 'Formal',
    mostrarMesaRegalos: true,
    mostrarLluviaSobres: true,
    alias: 'camila.mateo.2026',
    ubicaciones: [
      {
        tipo: 'Iglesia',
        nombre: 'Iglesia Nuestra Señora del Pilar',
        direccion: 'Junín 1904, Recoleta, Buenos Aires',
        latitud: -34.5855,
        longitud: -58.3923,
        hora: '17:00',
      },
      {
        tipo: 'Fiesta',
        nombre: 'Salón Los Jardines',
        direccion: 'Av. del Libertador 3020, Buenos Aires',
        latitud: -34.5728,
        longitud: -58.4137,
        hora: '21:00',
      },
    ],
  },
  template: { id: 1, nombre: 'Boda Clásica', slug: 'boda-clasica', thumbnailUrl: null },
  servicios: [{ id: 1, nombre: 'Cuenta regresiva' }],
  fotosAnfitrion: [{ id: 1, url: 'https://picsum.photos/seed/wedding-portrait/430/680', orden: 1 }],
  musica: null,
  historias: [
    {
      id: 1,
      texto: 'Nos conocimos en el verano de 2020, en una tarde de lluvia inesperada que cambió nuestras vidas para siempre.',
      imagenUrl: 'https://picsum.photos/seed/wedding-story1/430/220',
      orden: 1,
    },
    {
      id: 2,
      texto: 'Después de tres años juntos, Mateo le pidió a Camila que se casara con él frente al mar, al atardecer.',
      imagenUrl: 'https://picsum.photos/seed/wedding-story2/430/220',
      orden: 2,
    },
  ],
  saludoPersonalizado: null,
  tieneConfirmacion: true,
  mostrarBotonConfirmar: false,
}

// ─── Boda Moderna mock data ───────────────────────────────────────────────────
const COLOR_MODERNA = '#4E1319'
const MOCK_BODA_MODERNA: InvitacionPublica = {
  id: 'preview-moderna',
  titulo: 'Valentina & Lucas',
  fechaEvento: '2026-11-21T00:00:00.000Z',
  horaEvento: '20:00',
  ubicacion: 'multiple',
  direccion: 'Buenos Aires',
  latitud: -34.6037,
  longitud: -58.3816,
  colorPrimario: COLOR_MODERNA,
  camposEspecificos: {
    novio1: 'Valentina',
    novio2: 'Lucas',
    tipoCeremonia: 'Civil',
    dressCode: 'Cocktail',
    mostrarMesaRegalos: true,
    mostrarLluviaSobres: true,
    alias: 'vale.lucas.2026',
    ubicaciones: [
      {
        tipo: 'Civil',
        nombre: 'Registro Civil Centro',
        direccion: 'Av. Corrientes 1540, Buenos Aires',
        latitud: -34.6045,
        longitud: -58.3849,
        hora: '18:00',
      },
      {
        tipo: 'Recepción',
        nombre: 'Palacio Paz',
        direccion: 'Av. Santa Fe 750, Buenos Aires',
        latitud: -34.5936,
        longitud: -58.3763,
        hora: '21:00',
      },
    ],
  },
  template: { id: 2, nombre: 'Boda Moderna', slug: 'boda-moderna', thumbnailUrl: null },
  servicios: [{ id: 1, nombre: 'Cuenta regresiva' }],
  fotosAnfitrion: [{ id: 1, url: 'https://picsum.photos/seed/moderna-portrait/430/680', orden: 1 }],
  musica: null,
  historias: [
    {
      id: 1,
      texto: 'Todo comenzó en una noche de jazz en San Telmo. Una mirada, una sonrisa, y el resto es historia.',
      imagenUrl: 'https://picsum.photos/seed/moderna-story1/430/220',
      orden: 1,
    },
    {
      id: 2,
      texto: 'Dos años de aventuras compartidas nos llevaron a este momento. Ahora queremos celebrarlo con todos ustedes.',
      imagenUrl: 'https://picsum.photos/seed/moderna-story2/430/220',
      orden: 2,
    },
  ],
  saludoPersonalizado: null,
  tieneConfirmacion: true,
  mostrarBotonConfirmar: false,
}

// ─── Boda Rústica mock data ───────────────────────────────────────────────────
const COLOR_RUSTICA = '#465E38'
const MOCK_BODA_RUSTICA: InvitacionPublica = {
  id: 'preview-rustica',
  titulo: 'Florencia & Ignacio',
  fechaEvento: '2026-05-09T00:00:00.000Z',
  horaEvento: '18:30',
  ubicacion: 'multiple',
  direccion: 'Mendoza',
  latitud: -32.8908,
  longitud: -68.8272,
  colorPrimario: COLOR_RUSTICA,
  camposEspecificos: {
    novio1: 'Florencia',
    novio2: 'Ignacio',
    tipoCeremonia: 'Iglesia',
    dressCode: 'Garden Party',
    mostrarMesaRegalos: true,
    mostrarLluviaSobres: true,
    alias: 'flor.nacho.2026',
    ubicaciones: [
      {
        tipo: 'Iglesia',
        nombre: 'Capilla San Francisco',
        direccion: 'Godoy Cruz, Mendoza',
        latitud: -32.9241,
        longitud: -68.8458,
        hora: '17:00',
      },
      {
        tipo: 'Fiesta',
        nombre: 'Estancia El Olivo',
        direccion: 'Ruta Provincial 15, Mendoza',
        latitud: -32.8908,
        longitud: -68.8272,
        hora: '20:00',
      },
    ],
  },
  template: { id: 3, nombre: 'Boda Rústica', slug: 'boda-rustica', thumbnailUrl: null },
  servicios: [{ id: 1, nombre: 'Cuenta regresiva' }],
  fotosAnfitrion: [{ id: 1, url: 'https://picsum.photos/seed/rustica-portrait/430/680', orden: 1 }],
  musica: null,
  historias: [
    {
      id: 1,
      texto: 'Nos conocimos entre viñedos y paisajes de montaña. La naturaleza siempre fue testigo de nuestra historia.',
      imagenUrl: 'https://picsum.photos/seed/rustica-story1/430/220',
      orden: 1,
    },
    {
      id: 2,
      texto: 'Un atardecer entre los cerros y una propuesta que nunca olvidaremos. Hoy queremos compartirlo con quienes amamos.',
      imagenUrl: 'https://picsum.photos/seed/rustica-story2/430/220',
      orden: 2,
    },
  ],
  saludoPersonalizado: null,
  tieneConfirmacion: true,
  mostrarBotonConfirmar: false,
}

// ─── Quince Elegante mock data ───────────────────────────────────────────────
const COLOR_QUINCE_ELEGANTE = '#2A63A8'
const MOCK_QUINCE_ELEGANTE: InvitacionPublica = {
  id: 'preview-quince-elegante',
  titulo: 'Mis XV Años',
  fechaEvento: '2026-08-15T00:00:00.000Z',
  horaEvento: '21:00',
  ubicacion: 'Salón Imperial · Recoleta',
  direccion: 'Av. Quintana 188, Recoleta, Buenos Aires',
  latitud: -34.5882,
  longitud: -58.3928,
  colorPrimario: COLOR_QUINCE_ELEGANTE,
  camposEspecificos: {
    nombre: 'Isabella',
    colorTematico: COLOR_QUINCE_ELEGANTE,
    horaPresentacion: '22:30',
    valsPareja: 'Mateo',
    valsCancion: 'A Thousand Years – Christina Perri',
    padrinos: 'Familia Rossi & Fernández',
    dressCode: 'Formal',
    tematica: 'Elegante',
  },
  template: { id: 6, nombre: 'Quince Elegante', slug: 'quince-elegante', thumbnailUrl: null },
  servicios: [{ id: 1, nombre: 'Cuenta regresiva' }],
  fotosAnfitrion: [{ id: 1, url: 'https://picsum.photos/seed/quince-elegante-portrait/430/560', orden: 1 }],
  musica: null,
  historias: [
    {
      id: 1,
      texto: 'Soñé con esta noche desde pequeña. Gracias a mis padres y a todos los que hicieron posible este sueño tan especial.',
      imagenUrl: 'https://picsum.photos/seed/quince-elegante-story1/430/220',
      orden: 1,
    },
    {
      id: 2,
      texto: 'Esta noche marca el comienzo de una nueva etapa. Quiero vivirla con las personas que más amo.',
      imagenUrl: 'https://picsum.photos/seed/quince-elegante-story2/430/220',
      orden: 2,
    },
  ],
  saludoPersonalizado: null,
  tieneConfirmacion: true,
  mostrarBotonConfirmar: false,
}

// ─── Quince Moderna mock data ───────────────────────────────────────────────
const COLOR_QUINCE_MODERNA = '#BD9848'
const MOCK_QUINCE_MODERNA: InvitacionPublica = {
  id: 'preview-quince-moderna',
  titulo: 'Mis Quince',
  fechaEvento: '2026-10-10T00:00:00.000Z',
  horaEvento: '22:00',
  ubicacion: 'Club 720 · Palermo',
  direccion: 'Av. Córdoba 4756, Palermo, Buenos Aires',
  latitud: -34.5989,
  longitud: -58.4330,
  colorPrimario: COLOR_QUINCE_MODERNA,
  camposEspecificos: {
    nombre: 'Sofía',
    colorTematico: COLOR_QUINCE_MODERNA,
    horaPresentacion: '23:30',
    valsPareja: 'Agustín',
    valsCancion: 'Unstoppable – Sia',
    padrinos: 'Familia Martínez & García',
    dressCode: 'Cocktail',
    tematica: 'Moderna',
  },
  template: { id: 5, nombre: 'Quince Moderna', slug: 'quince-moderna', thumbnailUrl: null },
  servicios: [{ id: 1, nombre: 'Cuenta regresiva' }],
  fotosAnfitrion: [{ id: 1, url: 'https://picsum.photos/seed/quince-moderna-portrait/430/560', orden: 1 }],
  musica: null,
  historias: [
    {
      id: 1,
      texto: 'Soñé con esta noche desde que era chica. Gracias a mis papás y a todos los que hicieron este sueño posible.',
      imagenUrl: 'https://picsum.photos/seed/quince-moderna-story1/430/220',
      orden: 1,
    },
    {
      id: 2,
      texto: 'Esta noche quiero bailar, reír y celebrar con las personas que más amo. ¡Los espero!',
      imagenUrl: 'https://picsum.photos/seed/quince-moderna-story2/430/220',
      orden: 2,
    },
  ],
  saludoPersonalizado: null,
  tieneConfirmacion: true,
  mostrarBotonConfirmar: false,
}

// ─── Quince Princesa mock data ────────────────────────────────────────────────
const COLOR_PRINCESA = '#B14B8F'
const MOCK_QUINCE_PRINCESA: InvitacionPublica = {
  id: 'preview-princesa',
  titulo: 'Los XV de Isabelita',
  fechaEvento: '2026-08-29T00:00:00.000Z',
  horaEvento: '21:00',
  ubicacion: 'Salón Crystal, Palermo',
  direccion: 'Thames 1844, Palermo, Buenos Aires',
  latitud: -34.5929,
  longitud: -58.4227,
  colorPrimario: COLOR_PRINCESA,
  camposEspecificos: {
    nombre: 'Isabella',
    colorTematico: COLOR_PRINCESA,
    horaPresentacion: '22:30',
    valsPareja: 'Sebastián',
    valsCancion: 'Perfect – Ed Sheeran',
    padrinos: 'Familia Martínez & Rodríguez',
    dressCode: 'Formal',
    tematica: 'Princesa',
  },
  template: { id: 4, nombre: 'Quince Princesa', slug: 'quince-princesa', thumbnailUrl: null },
  servicios: [{ id: 1, nombre: 'Cuenta regresiva' }],
  fotosAnfitrion: [{ id: 1, url: 'https://picsum.photos/seed/quince-portrait/430/560', orden: 1 }],
  musica: null,
  historias: [
    {
      id: 1,
      texto: 'Desde pequeña soñé con esta noche. Gracias a mis padres y a todos los que hicieron posible este sueño.',
      imagenUrl: 'https://picsum.photos/seed/quince-story1/430/220',
      orden: 1,
    },
  ],
  saludoPersonalizado: null,
  tieneConfirmacion: true,
  mostrarBotonConfirmar: false,
}

// ─── Cumple Festivo mock data ───────────────────────────────────────────────
const COLOR_CUMPLE_FESTIVO = '#FF4081'
const MOCK_CUMPLE_FESTIVO: InvitacionPublica = {
  id: 'preview-cumple-festivo',
  titulo: '¡Los 25 de Lucía!',
  fechaEvento: '2026-09-05T00:00:00.000Z',
  horaEvento: '22:00',
  ubicacion: 'La Terraza · Villa Crespo',
  direccion: 'Av. Corrientes 5201, Villa Crespo, Buenos Aires',
  latitud: -34.5977,
  longitud: -58.4401,
  colorPrimario: COLOR_CUMPLE_FESTIVO,
  camposEspecificos: {
    nombre: 'Lucía',
    edad: '25',
    dressCode: 'Colorful vibes',
    actividades: 'DJ en vivo · Photobooth · Barra libre',
    notas: '¡No faltes que la noche promete!',
  },
  template: { id: 7, nombre: 'Cumple Festivo', slug: 'cumple-festivo', thumbnailUrl: null },
  servicios: [{ id: 1, nombre: 'Cuenta regresiva' }],
  fotosAnfitrion: [{ id: 1, url: 'https://picsum.photos/seed/cumple-festivo-portrait/430/560', orden: 1 }],
  musica: null,
  historias: [
    {
      id: 1,
      texto: 'Hace 25 años llegué al mundo dispuesta a disfrutar cada momento. Esta noche quiero celebrarlo a lo grande con todos ustedes.',
      imagenUrl: 'https://picsum.photos/seed/cumple-festivo-story1/430/220',
      orden: 1,
    },
    {
      id: 2,
      texto: '¡Gracias por ser parte de mi historia! Esta noche bailamos hasta el amanecer.',
      imagenUrl: 'https://picsum.photos/seed/cumple-festivo-story2/430/220',
      orden: 2,
    },
  ],
  saludoPersonalizado: null,
  tieneConfirmacion: true,
  mostrarBotonConfirmar: false,
}

// ─── Template preview components ─────────────────────────────────────────────

function BodaClasicaPreview() {
  const colorBgLocaciones = hexToRgba(COLOR_CLASICA_ACCENT, 0.2)
  return (
    <ScrollingPreviewWrapper
      bgColor="#faf7f2"
      cssVars={{
        '--invitation-primary': COLOR_CLASICA_DORADO,
        '--invitation-accent': COLOR_CLASICA_ACCENT,
      } as React.CSSProperties}
    >
      <BodaClasicaHero invitacion={MOCK_BODA_CLASICA} />
      <BodaClasicaCountdown
        fechaEvento={MOCK_BODA_CLASICA.fechaEvento}
        horaEvento={MOCK_BODA_CLASICA.horaEvento}
      />
      <BodaClasicaTagline invitacion={MOCK_BODA_CLASICA} />
      <BodaClasicaLocations invitacion={MOCK_BODA_CLASICA} colorBg={colorBgLocaciones} />
      <BodaClasicaInfo invitacion={MOCK_BODA_CLASICA} />
      <BodaClasicaStory historias={MOCK_BODA_CLASICA.historias} />
      <BodaClasicaGift invitacion={MOCK_BODA_CLASICA} />
      <BodaClasicaRsvp
        invitacionId="preview"
        invitadoParam={null}
        mostrarBoton={false}
        fechaLimite={null}
      />
    </ScrollingPreviewWrapper>
  )
}

function BodaModernaPreview() {
  return (
    <ScrollingPreviewWrapper
      bgColor="#fff"
      cssVars={{
        '--invitation-primary': COLOR_MODERNA,
        '--invitation-accent': COLOR_MODERNA,
      } as React.CSSProperties}
    >
      <BodaModernaHero invitacion={MOCK_BODA_MODERNA} />
      <BodaModernaCountdown
        fechaEvento={MOCK_BODA_MODERNA.fechaEvento}
        horaEvento={MOCK_BODA_MODERNA.horaEvento}
      />
      <BodaModernaLocations invitacion={MOCK_BODA_MODERNA} />
      <BodaModernaInfo invitacion={MOCK_BODA_MODERNA} />
      <BodaModernaStory historias={MOCK_BODA_MODERNA.historias} />
      <BodaModernaRegalo invitacion={MOCK_BODA_MODERNA} />
      <BodaModernaRsvp
        invitacionId="preview"
        invitadoParam={null}
        mostrarBoton={false}
        fechaLimite={null}
      />
    </ScrollingPreviewWrapper>
  )
}

function BodaRusticaPreview() {
  return (
    <ScrollingPreviewWrapper
      bgColor="#f3f3f3"
      cssVars={{
        '--invitation-primary': COLOR_RUSTICA,
        '--invitation-accent': COLOR_RUSTICA,
      } as React.CSSProperties}
    >
      <BodaRusticaHero invitacion={MOCK_BODA_RUSTICA} />
      <BodaRusticaCountdown
        fechaEvento={MOCK_BODA_RUSTICA.fechaEvento}
        horaEvento={MOCK_BODA_RUSTICA.horaEvento}
      />
      <BodaRusticaTagline invitacion={MOCK_BODA_RUSTICA} />
      <BodaRusticaLocations invitacion={MOCK_BODA_RUSTICA} />
      <BodaRusticaInfo invitacion={MOCK_BODA_RUSTICA} />
      <BodaRusticaStory historias={MOCK_BODA_RUSTICA.historias} />
      <BodaRusticaGift invitacion={MOCK_BODA_RUSTICA} />
      <BodaRusticaRsvp
        invitacionId="preview"
        invitadoParam={null}
        mostrarBoton={false}
        fechaLimite={null}
      />
    </ScrollingPreviewWrapper>
  )
}

function QuincePrincesaPreview() {
  return (
    <ScrollingPreviewWrapper
      bgColor="#fff"
      cssVars={{
        '--invitation-primary': COLOR_PRINCESA,
        '--invitation-accent': COLOR_PRINCESA,
        '--invitation-bg-soft': hexToRgba(COLOR_PRINCESA, 0.08),
        '--invitation-border': hexToRgba(COLOR_PRINCESA, 0.25),
        '--invitation-bg': '#9B4B6D',
      } as React.CSSProperties}
    >
      <QuincePrincesaHero invitacion={MOCK_QUINCE_PRINCESA} colorAsset="rosa" />
      <QuincePrincesaCountdown
        fechaEvento={MOCK_QUINCE_PRINCESA.fechaEvento}
        horaEvento={MOCK_QUINCE_PRINCESA.horaEvento}
      />
      <QuincePrincesaInfo invitacion={MOCK_QUINCE_PRINCESA} />
      <QuincePrincesaStory historias={MOCK_QUINCE_PRINCESA.historias} />
      <QuincePrincesaRsvp
        invitacionId="preview"
        invitadoParam={null}
        mostrarBoton={false}
        fechaLimite={null}
      />
    </ScrollingPreviewWrapper>
  )
}

// ─── Styled placeholder previews (stub templates) ─────────────────────────────

function QuinceElegantePreview() {
  return (
    <ScrollingPreviewWrapper
      bgColor="#e8f0fb"
      cssVars={{
        '--invitation-primary': COLOR_QUINCE_ELEGANTE,
        '--invitation-bg-soft': hexToRgba(COLOR_QUINCE_ELEGANTE, 0.07),
        '--invitation-border': hexToRgba(COLOR_QUINCE_ELEGANTE, 0.2),
      } as React.CSSProperties}
    >
      <QuinceEleganteHero invitacion={MOCK_QUINCE_ELEGANTE} colorAccent={COLOR_QUINCE_ELEGANTE} />
      <QuinceEleganteCountdown
        fechaEvento={MOCK_QUINCE_ELEGANTE.fechaEvento}
        horaEvento={MOCK_QUINCE_ELEGANTE.horaEvento}
        colorAccent={COLOR_QUINCE_ELEGANTE}
      />
      <QuinceEleganteInfo invitacion={MOCK_QUINCE_ELEGANTE} colorAccent={COLOR_QUINCE_ELEGANTE} />
      <QuinceEleganteMap invitacion={MOCK_QUINCE_ELEGANTE} colorAccent={COLOR_QUINCE_ELEGANTE} />
      <QuinceEleganteStory historias={MOCK_QUINCE_ELEGANTE.historias} colorAccent={COLOR_QUINCE_ELEGANTE} />
      <QuinceEleganteRsvp
        invitacionId="preview"
        invitadoParam={null}
        mostrarBoton={false}
        fechaLimite={null}
        colorAccent={COLOR_QUINCE_ELEGANTE}
      />
    </ScrollingPreviewWrapper>
  )
}

function QuinceModernaPreview() {
  return (
    <ScrollingPreviewWrapper
      bgColor="#090819"
      cssVars={{
        '--invitation-primary': COLOR_QUINCE_MODERNA,
        '--invitation-accent': COLOR_QUINCE_MODERNA,
        '--invitation-border': hexToRgba(COLOR_QUINCE_MODERNA, 0.22),
      } as React.CSSProperties}
    >
      <QuinceModernaHero invitacion={MOCK_QUINCE_MODERNA} colorAccent={COLOR_QUINCE_MODERNA} />
      <QuinceModernaCountdown
        fechaEvento={MOCK_QUINCE_MODERNA.fechaEvento}
        horaEvento={MOCK_QUINCE_MODERNA.horaEvento}
      />
      <QuinceModernaInfo invitacion={MOCK_QUINCE_MODERNA} />
      <QuinceModernaMap invitacion={MOCK_QUINCE_MODERNA} />
      <QuinceModernaStory historias={MOCK_QUINCE_MODERNA.historias} />
      <QuinceModernaRsvp
        invitacionId="preview"
        invitadoParam={null}
        mostrarBoton={false}
        fechaLimite={null}
      />
    </ScrollingPreviewWrapper>
  )
}

function CumpleElegantePreview() {
  return (
    <ScrollingPreviewWrapper bgColor="#080808">
      <div
        className="w-full flex flex-col items-center px-10 py-20"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", minHeight: '100vh' }}
      >
        <p className="text-[0.55rem] tracking-[5px] uppercase text-white/30 mb-10">
          Una velada especial
        </p>

        {/* Nombre */}
        <h1
          className="text-[2.8rem] font-light text-white leading-none mb-1"
          style={{ letterSpacing: '6px' }}
        >
          Alejandro
        </h1>
        <div className="h-px w-24 bg-white/20 my-8" />

        {/* Número grande */}
        <p
          className="text-[9rem] font-extralight text-white/90 leading-none"
          style={{ letterSpacing: '-8px' }}
        >
          30
        </p>

        <p className="text-[0.6rem] tracking-[6px] uppercase text-white/40 mb-12">AÑOS</p>

        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <p className="text-[0.55rem] tracking-[3px] uppercase text-white/30 mb-1">Cuándo</p>
            <p className="text-[0.9rem] font-light text-white/80">Viernes 20 de Marzo, 2026</p>
            <p className="text-[0.75rem] text-white/40">21:30 hs</p>
          </div>
          <div className="h-px w-10 bg-white/15" />
          <div>
            <p className="text-[0.55rem] tracking-[3px] uppercase text-white/30 mb-1">Dónde</p>
            <p className="text-[0.9rem] font-light text-white/80">Le Bar · Recoleta</p>
          </div>
          <div className="h-px w-10 bg-white/15" />
          <div>
            <p className="text-[0.55rem] tracking-[3px] uppercase text-white/30 mb-1">Dress Code</p>
            <p className="text-[0.9rem] font-light text-white/80">All Black</p>
          </div>
        </div>

        <button className="mt-14 border border-white/20 text-white/70 text-[0.6rem] tracking-[3px] uppercase px-12 py-3 hover:border-white/50 transition-colors">
          Confirmar asistencia
        </button>
      </div>
    </ScrollingPreviewWrapper>
  )
}

function CumpleFestivoPreview() {
  return (
    <ScrollingPreviewWrapper
      bgColor="#1a1a1a"
      cssVars={{
        '--invitation-primary': COLOR_CUMPLE_FESTIVO,
      } as React.CSSProperties}
    >
      <CumpleFestivoHero invitacion={MOCK_CUMPLE_FESTIVO} colorAccent={COLOR_CUMPLE_FESTIVO} />
      <CumpleFestivoCountdown
        fechaEvento={MOCK_CUMPLE_FESTIVO.fechaEvento}
        horaEvento={MOCK_CUMPLE_FESTIVO.horaEvento}
      />
      <CumpleFestivoInfo invitacion={MOCK_CUMPLE_FESTIVO} colorAccent={COLOR_CUMPLE_FESTIVO} />
      <CumpleFestivoMap
        ubicacion={MOCK_CUMPLE_FESTIVO.ubicacion}
        direccion={MOCK_CUMPLE_FESTIVO.direccion}
        latitud={MOCK_CUMPLE_FESTIVO.latitud}
        longitud={MOCK_CUMPLE_FESTIVO.longitud}
        camposEspecificos={MOCK_CUMPLE_FESTIVO.camposEspecificos}
      />
      <CumpleFestivoStory historias={MOCK_CUMPLE_FESTIVO.historias} />
      <CumpleFestivoRsvp
        invitacionId="preview"
        invitadoParam={null}
        mostrarBoton={false}
      />
    </ScrollingPreviewWrapper>
  )
}

function CumpleInfantilPreview() {
  return (
    <ScrollingPreviewWrapper bgColor="#e0f4ff">
      <div
        className="w-full flex flex-col items-center px-8 py-14"
        style={{ fontFamily: "'Outfit', sans-serif", minHeight: '100vh' }}
      >
        {/* Nubes decorativas */}
        <div className="flex gap-4 mb-6 opacity-60">
          {[40, 55, 40].map((w, i) => (
            <div
              key={i}
              className="rounded-full bg-white"
              style={{ width: w, height: w * 0.6, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
          ))}
        </div>

        <p className="text-[0.65rem] font-bold tracking-[3px] uppercase text-[#0288d1] mb-3">
          ¡Gran Fiesta!
        </p>
        <h1
          className="text-[3.2rem] font-black text-[#01579b] leading-none mb-1"
        >
          Emilio
        </h1>

        {/* Número con globos */}
        <div className="flex items-end gap-1 my-6">
          <span className="text-3xl">🎈</span>
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: '#0288d1' }}
          >
            <span className="text-[3rem] font-black text-white leading-none">6</span>
          </div>
          <span className="text-3xl">🎈</span>
        </div>

        <p className="text-[0.8rem] font-medium text-[#0277bd] mb-8">¡Cumple 6 añitos!</p>

        {/* Datos */}
        <div
          className="w-full rounded-3xl px-6 py-6 flex flex-col gap-4 mb-8"
          style={{ background: 'rgba(255,255,255,0.7)', border: '2px solid rgba(2,136,209,0.2)' }}
        >
          {[
            { emoji: '🗓️', label: 'Cuándo', value: 'Domingo 12 de Abril, 2026', sub: '16:00 hs' },
            { emoji: '📍', label: 'Dónde', value: 'Club Infantil Alegría, Palermo' },
          ].map(({ emoji, label, value, sub }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="text-xl">{emoji}</span>
              <div>
                <p className="text-[0.55rem] font-bold tracking-wider uppercase text-[#0288d1] mb-0.5">{label}</p>
                <p className="text-[0.85rem] font-semibold text-[#01579b]">{value}</p>
                {sub && <p className="text-[0.7rem] text-[#0288d1]/70">{sub}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 text-2xl mb-8">
          <span>⭐</span><span>🎂</span><span>🎁</span><span>🌟</span>
        </div>

        <button
          className="font-bold text-[0.7rem] tracking-wider px-12 py-3.5 rounded-full text-white"
          style={{ background: '#0288d1' }}
        >
          ¡Voy a la fiesta! 🎉
        </button>
      </div>
    </ScrollingPreviewWrapper>
  )
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const PREVIEW_REGISTRY: Record<string, () => React.JSX.Element> = {
  'boda-clasica':    BodaClasicaPreview,
  'boda-moderna':    BodaModernaPreview,
  'boda-rustica':    BodaRusticaPreview,
  'quince-princesa': QuincePrincesaPreview,
  'quince-elegante': QuinceElegantePreview,
  'quince-moderna':  QuinceModernaPreview,
  'cumple-elegante': CumpleElegantePreview,
  'cumple-festivo':  CumpleFestivoPreview,
  'cumple-infantil': CumpleInfantilPreview,
}

/** Default preview slug per event type. Useful when only the event type is known. */
export const SLUG_BY_EVENT_TYPE: Record<'boda' | 'quince' | 'cumple', string> = {
  boda:   'boda-clasica',
  quince: 'quince-princesa',
  cumple: 'cumple-festivo',
}

export interface InvitationPreviewProps {
  /** Template slug, e.g. 'boda-clasica', 'quince-princesa', 'cumple-festivo'. */
  slug: string
}

/**
 * Renders a scrollable preview of an invitation template with placeholder data.
 * Reusable across landing, showcase, and solicitar wizard.
 *
 * @example
 * <InvitationPreview slug="boda-clasica" />
 * <InvitationPreview slug={SLUG_BY_EVENT_TYPE[eventType]} />
 */
export function InvitationPreview({ slug }: InvitationPreviewProps) {
  const Preview = PREVIEW_REGISTRY[slug] ?? null
  if (!Preview) return null
  return <Preview />
}

