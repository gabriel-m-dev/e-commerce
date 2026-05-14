import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { sendOrderCancelledEmail, sendOrderShippedEmail } from '@/lib/email'

const VALID_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
type OrderStatus = typeof VALID_STATUSES[number]

// Statuses where payment was confirmed and stock was decremented
const POST_PAYMENT: OrderStatus[] = ['PROCESSING', 'SHIPPED', 'DELIVERED']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status, trackingNumber } = body as Record<string, unknown>

  const data: Record<string, unknown> = {}

  if (status !== undefined) {
    if (typeof status !== 'string' || !VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }
    data.status = status
  }

  if (trackingNumber !== undefined) {
    if (typeof trackingNumber !== 'string' && trackingNumber !== null) {
      return NextResponse.json({ error: 'trackingNumber inválido' }, { status: 400 })
    }
    data.trackingNumber = trackingNumber === '' ? null : trackingNumber
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  // Fetch current order to determine side effects
  const current = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { select: { productId: true, quantity: true, name: true, price: true, size: true } },
    },
  })
  if (!current) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

  const nextStatus = status as OrderStatus | undefined
  const isCancelling = nextStatus === 'CANCELLED' && current.status !== 'CANCELLED'
  const isShipping = nextStatus === 'SHIPPED' && current.status !== 'SHIPPED'
  const shouldRestoreStock = isCancelling && POST_PAYMENT.includes(current.status as OrderStatus)

  try {
    let updatedOrder

    if (shouldRestoreStock) {
      // Restore stock in the same transaction as the status update
      const [order] = await prisma.$transaction([
        prisma.order.update({ where: { id }, data }),
        ...current.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        ),
      ])
      updatedOrder = order
      console.log(`[admin/orders] Orden ${id} cancelada, stock restaurado`)
    } else {
      updatedOrder = await prisma.order.update({ where: { id }, data })
    }

    // Send email side effects (fire-and-forget, don't block the response)
    const emailData = {
      orderId: current.id,
      email: current.email,
      items: current.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: Number(i.price),
        size: i.size,
      })),
      total: Number(current.total),
      trackingNumber: (data.trackingNumber as string | null | undefined) ?? (current as Record<string, unknown>).trackingNumber as string | null ?? null,
    }

    if (isCancelling) {
      sendOrderCancelledEmail(emailData).catch((e) =>
        console.error('[admin/orders] cancel email failed:', e)
      )
    } else if (isShipping) {
      sendOrderShippedEmail(emailData).catch((e) =>
        console.error('[admin/orders] shipped email failed:', e)
      )
    }

    return NextResponse.json({ order: updatedOrder }, { status: 200 })
  } catch (err: unknown) {
    console.error('[PATCH /api/admin/orders/[id]]', err)
    return NextResponse.json({ error: 'Error al actualizar la orden' }, { status: 503 })
  }
}
