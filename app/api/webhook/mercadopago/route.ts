import { NextRequest } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { Payment } from 'mercadopago'
import { mp } from '@/lib/mercadopago'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmedEmail, sendOrderCancelledEmail } from '@/lib/email'

type MPWebhookBody = {
  type: string
  data?: { id: string | number }
}

function verifySignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook/mercadopago] MERCADOPAGO_WEBHOOK_SECRET no está configurada — request rechazada')
    return false
  }

  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')
  const dataId = new URL(request.url).searchParams.get('data.id')

  if (!xSignature) return false

  const parts = Object.fromEntries(xSignature.split(',').map((p) => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const template = `id:${dataId ?? ''};request-id:${xRequestId ?? ''};ts:${ts};`
  const hmac = createHmac('sha256', secret).update(template).digest('hex')
  return timingSafeEqual(Buffer.from(hmac), Buffer.from(v1))
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    if (!verifySignature(request, rawBody)) {
      console.warn('[webhook/mercadopago] Firma inválida — request rechazada')
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body: MPWebhookBody = JSON.parse(rawBody)

    if (body.type !== 'payment') {
      return Response.json({ received: true }, { status: 200 })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return Response.json({ received: true }, { status: 200 })
    }

    const paymentClient = new Payment(mp)
    const paymentData = await paymentClient.get({ id: String(paymentId) })

    const externalReference = paymentData.external_reference
    const mpStatus = paymentData.status

    if (!externalReference || !mpStatus) {
      return Response.json({ received: true }, { status: 200 })
    }

    if (mpStatus === 'approved') {
      // Fetch order with items to check current status (idempotency) and get productIds
      const order = await prisma.order.findUnique({
        where: { id: externalReference },
        include: { items: { select: { productId: true, quantity: true, name: true, price: true, size: true } } },
      })

      if (!order) {
        console.warn(`[webhook/mercadopago] Orden ${externalReference} no encontrada`)
        return Response.json({ received: true }, { status: 200 })
      }

      // Only process once — skip if already past PENDING
      if (order.status === 'PENDING') {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: externalReference },
            data: { status: 'PROCESSING' },
          }),
          ...order.items.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          ),
        ])
        console.log(`[webhook/mercadopago] Orden ${externalReference} aprobada, stock decrementado`)

        await sendOrderConfirmedEmail({
          orderId: order.id,
          email: order.email,
          items: order.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: Number(i.price),
            size: i.size,
          })),
          total: Number(order.total),
        })
      } else {
        console.log(`[webhook/mercadopago] Orden ${externalReference} ya procesada (${order.status}), ignorado`)
      }
    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      const order = await prisma.order.findUnique({
        where: { id: externalReference },
        include: { items: { select: { productId: true, quantity: true, name: true, price: true, size: true } } },
      })

      if (!order) return Response.json({ received: true }, { status: 200 })

      // Only cancel if still PENDING (payment rejected before approval — stock was never decremented)
      if (order.status === 'PENDING') {
        await prisma.order.update({
          where: { id: externalReference },
          data: { status: 'CANCELLED' },
        })
        console.log(`[webhook/mercadopago] Orden ${externalReference} cancelada por MP (${mpStatus})`)

        await sendOrderCancelledEmail({
          orderId: order.id,
          email: order.email,
          items: order.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: Number(i.price),
            size: i.size,
          })),
          total: Number(order.total),
        })
      } else {
        console.log(`[webhook/mercadopago] Orden ${externalReference} en estado ${order.status}, no se cancela automáticamente`)
      }
    } else {
      console.log(`[webhook/mercadopago] Status MP '${mpStatus}' ignorado para orden ${externalReference}`)
    }
  } catch (error) {
    console.error('[webhook/mercadopago] Error procesando notificación:', error)
  }

  return Response.json({ received: true }, { status: 200 })
}
