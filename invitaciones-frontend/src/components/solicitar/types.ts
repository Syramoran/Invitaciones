export type EventType = 'boda' | 'quince' | 'cumple'

export type AddonState = Record<string, boolean>

export interface AddonData {
  id: string           // String version of dbId
  dbId: number
  label: string
  desc: string
  price: number
  incluidoEnBase: boolean
}

export interface PriceBreakdown {
  addonsTotal: number
  subtotal: number
  secondCost: number
  total: number
}
