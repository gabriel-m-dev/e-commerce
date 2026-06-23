/**
 * Pure shipping cost computation.
 * All cost computation is server-side only — this module must not be
 * imported by Client Components.
 */

export type ShippingFormula = {
  baseWeightKg: number
  baseCostUsd: number
  additionalCostPerKgUsd: number
  additionalUnitKg: number
}

/**
 * Computes the shipping cost in ARS integer.
 *
 * @param formula  - Formula fields from the ShippingMethod DB row
 * @param totalWeightKg - Total cart weight in kg (null-weight items treated as 0)
 * @returns ARS amount as an integer (same denomination as existing Order.shipping)
 */
export function computeShippingCost(
  formula: ShippingFormula,
  totalWeightKg: number
): number {
  const USD_TO_ARS = Number(process.env.USD_TO_ARS ?? 1000)

  let costUsd: number
  if (totalWeightKg <= formula.baseWeightKg) {
    costUsd = formula.baseCostUsd
  } else {
    const extraKg = totalWeightKg - formula.baseWeightKg
    const extraUnits = Math.ceil(extraKg / formula.additionalUnitKg)
    costUsd = formula.baseCostUsd + extraUnits * formula.additionalCostPerKgUsd
  }

  return Math.round(costUsd * USD_TO_ARS)
}
