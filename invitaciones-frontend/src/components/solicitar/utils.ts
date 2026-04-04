import type { AddonState, AddonData, PriceBreakdown } from './types'

export const fmtPrice = (n: number) => '$' + n.toLocaleString('es-AR')

export function calcPrices(
  addons: AddonState,
  secondVersion: boolean,
  addonsData: AddonData[],
  basePrice: number,
): PriceBreakdown {
  const addonsTotal = addonsData
    .filter(a => !a.incluidoEnBase)
    .reduce((sum, a) => sum + (addons[a.id] ? a.price : 0), 0)
  const subtotal = basePrice + addonsTotal
  const secondCost = secondVersion ? Math.round(subtotal * 0.5) : 0
  return { addonsTotal, subtotal, secondCost, total: subtotal + secondCost }
}
