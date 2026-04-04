import type { EventType } from './types'

export const BASE_PRICE = 30_000

export const TEMPLATES_BY_EVENT: Record<EventType, { id: string; name: string }[]> = {
  boda:   [{ id: 'clasico-dorado',  name: 'Clásico Dorado'   }, { id: 'jardin-eterno',   name: 'Jardín Eterno'   }, { id: 'minimal-love',    name: 'Minimal Love'    }],
  quince: [{ id: 'rosa-imperial',   name: 'Rosa Imperial'    }, { id: 'noche-encantada', name: 'Noche Encantada' }, { id: 'primavera',       name: 'Primavera'       }],
  cumple: [{ id: 'fiesta-neon',     name: 'Fiesta Neon'      }, { id: 'elegante-30',     name: 'Elegante 30'     }, { id: 'party-time',      name: 'Party Time'      }],
}

export const TIPO_EVENTO_IDS: Record<EventType, number> = { boda: 1, quince: 2, cumple: 3 }
export const TEMPLATE_DB_IDS: Record<string, number> = {
  'clasico-dorado': 1, 'jardin-eterno': 2, 'minimal-love': 3,
  'rosa-imperial': 4, 'noche-encantada': 5, 'primavera': 6,
  'fiesta-neon': 7, 'elegante-30': 8, 'party-time': 9,
}

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

export const STEP_LABELS = ['Evento', 'Diseño', 'Servicios', 'Preview', 'Pedido', 'Listo']

export const btnBack = 'inline-flex items-center gap-2 text-sm font-medium text-charcoal border border-champagne-dark px-7 py-3.5 rounded-full hover:border-charcoal transition-colors'
export const btnNext = 'inline-flex items-center gap-2 text-sm font-medium bg-charcoal text-champagne-light px-8 py-3.5 rounded-full hover:bg-charcoal-soft hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0'
