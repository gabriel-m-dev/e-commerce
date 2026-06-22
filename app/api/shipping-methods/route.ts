import { NextRequest, NextResponse } from 'next/server'
import {
  getActiveShippingMethods,
  getShippingMethodsByProductIds,
} from '@/lib/queries/shipping-methods'

/**
 * Public GET — returns active shipping methods ordered by price ASC. No auth required.
 * Optional query param: ?productIds=id1,id2,...
 * When provided, applies fallback-aware filter: if any product has no assigned method,
 * returns ALL active methods. Otherwise returns only the methods assigned to those products.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get('productIds')?.split(',').filter(Boolean) ?? []
    const methods = productIds.length
      ? await getShippingMethodsByProductIds(productIds)
      : await getActiveShippingMethods()
    return NextResponse.json(methods)
  } catch (err) {
    console.error('[GET /api/shipping-methods]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
