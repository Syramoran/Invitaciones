export type EventType = 'boda' | 'quince' | 'cumple'

export interface AddonState {
  rsvp: boolean
  countdown: boolean
  music: boolean
  history: boolean
  gallery: boolean
}

export interface PriceBreakdown {
  addonsTotal: number
  subtotal: number
  secondCost: number
  total: number
}
