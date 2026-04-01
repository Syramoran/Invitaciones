import type { EventType } from './types'

// TODO: Reemplazar con llamada a pedidoService.fetchPreciosYServicios() una vez
//       que el endpoint /servicios/publicos esté disponible en el backend.
//       Ver src/services/pedidoService.ts para la interfaz comentada.
export const BASE_PRICE = 30_000

export const ADDONS_DATA = [
  { id: 'rsvp',      label: 'Confirmación de Asistencia', desc: 'Tus invitados confirman con un clic. Vos ves quién viene.',    price: 10_000 },
  { id: 'countdown', label: 'Cuenta Regresiva',           desc: 'Contador dinámico hasta el día del evento.',                   price: 10_000 },
  { id: 'music',     label: 'Música',                     desc: 'Reproducí una canción al abrir la invitación.',                price: 10_000 },
  { id: 'history',   label: 'Historia',                   desc: 'Sección con tu historia y fotos (hasta 3 bloques).',           price: 10_000 },
  { id: 'gallery',   label: 'Galería de Fotos con QR',    desc: 'QR para que los invitados suban fotos. Hasta 1000 fotos.',     price: 50_000 },
] as const

export const TEMPLATES_BY_EVENT: Record<EventType, { id: string; name: string }[]> = {
  boda:   [{ id: 'clasico-dorado',  name: 'Clásico Dorado'   }, { id: 'jardin-eterno',   name: 'Jardín Eterno'   }, { id: 'minimal-love',    name: 'Minimal Love'    }],
  quince: [{ id: 'rosa-imperial',   name: 'Rosa Imperial'    }, { id: 'noche-encantada', name: 'Noche Encantada' }, { id: 'primavera',       name: 'Primavera'       }],
  cumple: [{ id: 'fiesta-neon',     name: 'Fiesta Neon'      }, { id: 'elegante-30',     name: 'Elegante 30'     }, { id: 'party-time',      name: 'Party Time'      }],
}

// TODO: Reemplazar con IDs reales devueltos por fetchPreciosYServicios()
export const TIPO_EVENTO_IDS: Record<EventType, number> = { boda: 1, quince: 2, cumple: 3 }
export const TEMPLATE_DB_IDS: Record<string, number> = {
  'clasico-dorado': 1, 'jardin-eterno': 2, 'minimal-love': 3,
  'rosa-imperial': 4, 'noche-encantada': 5, 'primavera': 6,
  'fiesta-neon': 7, 'elegante-30': 8, 'party-time': 9,
}
export const SERVICIO_DB_IDS: Record<string, number> = { rsvp: 1, countdown: 2, music: 3, history: 4, gallery: 5 }

export const COLORS = [
  { hex: '#c5a572', label: 'Dorado' },
  { hex: '#e8a0a8', label: 'Rosa'   },
  { hex: '#8b2635', label: 'Bordo'  },
  { hex: '#6b9fc8', label: 'Azul'   },
  { hex: '#5a9070', label: 'Verde'  },
  { hex: '#9b7fc8', label: 'Lila'   },
  { hex: '#2d2926', label: 'Negro'  },
]

export const EVENT_LABELS: Record<EventType, string> = { boda: 'Boda', quince: 'Quinceañera', cumple: 'Cumpleaños' }

export const ADDON_LABELS: Record<string, string> = {
  rsvp: 'Confirmación de Asistencia', countdown: 'Cuenta Regresiva',
  music: 'Música', history: 'Historia', gallery: 'Galería de Fotos con QR',
}

export const STEP_LABELS = ['Evento', 'Diseño', 'Servicios', 'Preview', 'Pedido', 'Listo']

export const btnBack = 'inline-flex items-center gap-2 text-sm font-medium text-charcoal border border-champagne-dark px-7 py-3.5 rounded-full hover:border-charcoal transition-colors'
export const btnNext = 'inline-flex items-center gap-2 text-sm font-medium bg-charcoal text-champagne-light px-8 py-3.5 rounded-full hover:bg-charcoal-soft hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0'
