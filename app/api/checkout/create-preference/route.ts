import { NextRequest } from 'next/server'
import { mp, Preference } from '@/lib/mercadopago'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/constants'
import type { CartItem } from '@/store/cart'

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
  const body: RequestBody = await request.json()
  const { items, buyer, shipping } = body

  if (!items || items.length === 0) {
    return Response.json({ error: 'El carrito está vacío' }, { status: 400 })
  }

  try {
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    const order = await prisma.order.create({
      data: {
        userId: null,
        email: buyer.email,
        status: 'PENDING',
        subtotal,
        shipping: 0,
        total: subtotal,
        items: {
          create: items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            size: item.size ?? null,
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

    const preference = new Preference(mp)

    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          id: item.product.id,
          title: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          currency_id: 'ARS',
        })),
        payer: {
          email: buyer.email,
        },
        back_urls: {
          success: `${SITE_URL}/checkout/success`,
          failure: `${SITE_URL}/checkout/failure`,
          pending: `${SITE_URL}/checkout/pending`,
        },
        // auto_return solo funciona con URLs públicas (no localhost)
        ...(SITE_URL !== 'http://localhost:3000' && { auto_return: 'approved' as const }),
        notification_url: `${SITE_URL}/api/webhook/mercadopago`,
        external_reference: order.id,
      },
    })

    return Response.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      orderId: order.id,
    })
  } catch (error) {
    console.error('[create-preference] Error al crear preferencia MP:', error)
    return Response.json(
      { error: 'Error al conectar con Mercado Pago' },
      { status: 500 }
    )
  }
}
