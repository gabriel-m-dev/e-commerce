import { NextRequest, NextResponse } from 'next/server'
import {
  getActiveShippingMethods,
  getShippingMethodsByProductIds,
} from '@/lib/queries/shipping-methods'
import { prisma } from '@/lib/prisma'
import { computeShippingCost, resolveFormula } from '@/lib/utils/shipping'

/**
 * Public GET — returns active shipping methods with computed cost. No auth required.
 * Optional query params:
 *   ?productIds=id1,id2,...  — filter methods by product assignment
 *   &quantities=2,1,...      — quantities parallel to productIds (defaults to 1 each)
 *
 * Response always strips raw formula fields — only id, name, description, active,
 * createdAt, and computedCost are returned.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get('productIds')?.split(',').filter(Boolean) ?? []
    const quantitiesParam = searchParams.get('quantities')?.split(',').map(Number) ?? []

    // Build quantities array — default to 1 per product when omitted or shorter
    const quantities = productIds.map((_, i) => quantitiesParam[i] ?? 1)

    const methods = productIds.length
      ? await getShippingMethodsByProductIds(productIds)
      : await getActiveShippingMethods()

    if (productIds.length) {
      // Fetch product weights + supplier and compute total cart weight
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, weightKg: true, supplier: true },
      })
      const weightMap = new Map(products.map((p) => [p.id, p.weightKg ?? 0]))
      const totalWeightKg = productIds.reduce(
        (sum, id, i) => sum + (weightMap.get(id) ?? 0) * quantities[i],
        0
      )

      // Use supplier-specific formula when all products share the same supplier
      const uniqueSuppliers = [...new Set(products.map((p) => p.supplier).filter(Boolean))]
      const effectiveSupplier = uniqueSuppliers.length === 1 ? uniqueSuppliers[0] : null

      // Compute cost per method and strip formula fields from response
      const response = methods.map(
        ({ baseWeightKg, baseCostUsd, additionalCostPerKgUsd, additionalUnitKg, ...pub }) => ({
          ...pub,
          computedCost: computeShippingCost(
            resolveFormula(
              { id: pub.id, baseWeightKg, baseCostUsd, additionalCostPerKgUsd, additionalUnitKg },
              effectiveSupplier
            ),
            totalWeightKg
          ),
        })
      )
      return NextResponse.json(response)
    }

    // No productIds — compute cost at totalWeight=0 and strip formula fields
    const response = methods.map(
      ({ baseWeightKg, baseCostUsd, additionalCostPerKgUsd, additionalUnitKg, ...pub }) => ({
        ...pub,
        computedCost: computeShippingCost(
          { baseWeightKg, baseCostUsd, additionalCostPerKgUsd, additionalUnitKg },
          0
        ),
      })
    )
    return NextResponse.json(response)
  } catch (err) {
    console.error('[GET /api/shipping-methods]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
