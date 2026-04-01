import { BASE_PRICE, ADDONS_DATA } from './data'
import type { AddonState, PriceBreakdown } from './types'

export const fmtPrice = (n: number) => '$' + n.toLocaleString('es-AR')

export function calcPrices(addons: AddonState, secondVersion: boolean): PriceBreakdown {
  const addonsTotal = ADDONS_DATA.reduce(
    (sum, a) => sum + (addons[a.id as keyof AddonState] ? a.price : 0),
    0,
  )
  const subtotal = BASE_PRICE + addonsTotal
  const secondCost = secondVersion ? Math.round(subtotal * 0.5) : 0
  return { addonsTotal, subtotal, secondCost, total: subtotal + secondCost }
}
