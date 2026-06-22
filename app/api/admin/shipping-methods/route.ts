import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllShippingMethods, createShippingMethod } from '@/lib/queries/shipping-methods'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
  if (user.app_metadata?.role !== 'admin') return { error: 'Forbidden', status: 403 }
  return { user }
}

/** GET /api/admin/shipping-methods — all methods (active + inactive) */
export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const methods = await getAllShippingMethods()
    return NextResponse.json(methods)
  } catch (err) {
    console.error('[GET /api/admin/shipping-methods]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/** POST /api/admin/shipping-methods — create a new shipping method */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { name, price } = body as Record<string, unknown>

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'El campo name es requerido' }, { status: 400 })
  }

  const parsedPrice = Number(price)
  if (!Number.isInteger(parsedPrice) || parsedPrice <= 0) {
    return NextResponse.json(
      { error: 'El precio debe ser un número entero mayor a 0' },
      { status: 400 }
    )
  }

  // 409 on duplicate name
  const existing = await prisma.shippingMethod.findFirst({
    where: { name: name.trim() },
  })
  if (existing) {
    return NextResponse.json(
      { error: `Ya existe un método de envío con el nombre "${name.trim()}"` },
      { status: 409 }
    )
  }

  try {
    const method = await createShippingMethod({ name: name.trim(), price: parsedPrice })
    return NextResponse.json(method, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/shipping-methods]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
