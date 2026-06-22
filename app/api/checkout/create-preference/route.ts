import { NextRequest } from 'next/server'
import { mp, Preference } from '@/lib/mercadopago'
import { prisma } from '@/lib/prisma'
import { SITE_URL, SHIPPING_COST } from '@/lib/constants'
import type { CartItem } from '@/store/cart'
import { createClient } from '@/lib/supabase/server'
import { checkoutLimiter } from '@/lib/ratelimit'

type Buyer = {
  email: string
  fullName: string
  phone: string
}

type ShippingData = {
  address: string
  city: string
  province: string
  postalCode: string
}

type RequestBody = {
  items: CartItem[]
  buyer: Buyer
  shipping: ShippingData
}

export async function POST(request: NextRequest) {
  if (checkoutLimiter) {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await checkoutLimiter.limit(ip)
    if (!success) {
      return Response.json({ error: 'Demasiadas solicitudes. Intentá en unos minutos.' }, { status: 429 })
    }
  }

  const body: RequestBody = await request.json()
  const { items, buyer, shipping } = body

  if (!items || items.length === 0) {
    return Response.json({ error: 'El carrito está vacío' }, { status: 400 })
  }

  // Check if user is authenticated — link order to account if so
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let linkedUserId: string | null = null
  if (authUser) {
    await prisma.user.upsert({
      where: { id: authUser.id },
      create: {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name ?? null,
      },
      update: {},
    })
    linkedUserId = authUser.id
  }

  try {
    const productIds = items.map((item) => item.product.id)
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, stock: true, active: true },
    })

    if (dbProducts.length !== productIds.length) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 400 })
    }

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.product.id)!
      if (!dbProduct.active) {
        return Response.json({ error: `El producto "${item.product.name}" no está disponible.` }, { status: 400 })
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return Response.json(
          { error: `Cantidad inválida para "${item.product.name}".` },
          { status: 400 }
        )
      }
      if (dbProduct.stock < item.quantity) {
        return Response.json(
          { error: `Stock insuficiente para "${item.product.name}". Disponible: ${dbProduct.stock}.` },
          { status: 400 }
        )
      }
    }

    const priceMap = new Map(dbProducts.map((p) => [p.id, p.price]))
    const subtotal = items.reduce(
      (sum, item) => sum + (priceMap.get(item.product.id) as number) * item.quantity,
      0
    )

    // Generate order ID upfront — MP preference created first, order persisted only on success
    const orderId = crypto.randomUUID()

    const preference = new Preference(mp)
    const result = await preference.create({
      body: {
        items: [
          ...items.map((item) => ({
            id: item.product.id,
            title: item.product.name,
            quantity: item.quantity,
            unit_price: priceMap.get(item.product.id) as number,
            currency_id: 'ARS',
          })),
          {
            id: 'shipping',
            title: 'Envío',
            quantity: 1,
            unit_price: SHIPPING_COST,
            currency_id: 'ARS',
          },
        ],
        payer: {
          email: buyer.email,
        },
        back_urls: {
          success: `${SITE_URL}/checkout/success`,
          failure: `${SITE_URL}/checkout/failure`,
          pending: `${SITE_URL}/checkout/pending`,
        },
        ...(SITE_URL !== 'http://localhost:3000' && { auto_return: 'approved' as const }),
        notification_url: `${SITE_URL}/api/webhook/mercadopago`,
        external_reference: orderId,
      },
    })

    // MP succeeded — now persist the order
    await prisma.order.create({
      data: {
        id: orderId,
        userId: linkedUserId,
        email: buyer.email,
        status: 'PENDING',
        subtotal,
        shipping: SHIPPING_COST,
        total: subtotal + SHIPPING_COST,
        items: {
          create: items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: priceMap.get(item.product.id) as number,
            quantity: item.quantity,
            size: item.size ?? null,
            color: item.color ?? null,
          })),
        },
        address: {
          create: {
            name: buyer.fullName,
            street: shipping.address,
            city: shipping.city,
            state: shipping.province,
            zipCode: shipping.postalCode,
            country: 'Argentina',
          },
        },
      },
    })

    return Response.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      orderId,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    const detail = (error as Record<string, unknown>)?.cause ?? (error as Record<string, unknown>)?.response ?? ''
    console.error('[create-preference] error:', msg, JSON.stringify(detail))
    return Response.json(
      { error: 'Error al conectar con Mercado Pago', detail: msg },
      { status: 500 }
    )
  }
}
