import { NextResponse } from 'next/server'
import { getActiveShippingMethods } from '@/lib/queries/shipping-methods'

/** Public GET — returns active shipping methods ordered by price ASC. No auth required. */
export async function GET() {
  try {
    const methods = await getActiveShippingMethods()
    return NextResponse.json(methods)
  } catch (err) {
    console.error('[GET /api/shipping-methods]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
