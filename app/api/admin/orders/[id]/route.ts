import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { sendOrderCancelledEmail, sendOrderShippedEmail, sendArrivedCountryEmail, sendNationalDistributionEmail, sendDeliveredEmail } from '@/lib/email'

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'PENDING_TRANSFER', 'ARRIVED_COUNTRY', 'CUSTOMS', 'NATIONAL_DISTRIBUTION'] as const
type OrderStatus = typeof VALID_STATUSES[number]

// Statuses where payment was confirmed and stock was decremented.
// PENDING_TRANSFER is intentionally excluded: stock is only decremented when admin
// confirms the transfer via /confirm-transfer — never at order creation.
// Cancelling a PENDING_TRANSFER order must NOT restore stock (nothing was decremented yet).
const POST_PAYMENT: OrderStatus[] = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'ARRIVED_COUNTRY', 'CUSTOMS', 'NATIONAL_DISTRIBUTION']

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

  const { status, trackingNumber, address, subStatus } = body as Record<string, unknown>

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

  if (address !== undefined && typeof address === 'object' && address !== null) {
    const a = address as Record<string, unknown>
    const requiredKeys = ['name', 'phone', 'street', 'city', 'state', 'zipCode', 'country']
    const allowedKeys = requiredKeys
    const addressData: Record<string, string | null> = {}
    for (const key of allowedKeys) {
      if (key in a) {
        const val = a[key]
        if (typeof val !== 'string' && val !== null) {
          return NextResponse.json({ error: `address.${key} inválido` }, { status: 400 })
        }
        if (val === '' || val === null) {
          return NextResponse.json({ error: `address.${key} es requerido` }, { status: 400 })
        }
        addressData[key] = val as string
      }
    }
    if (Object.keys(addressData).length > 0) {
      data._addressUpdate = addressData
    }
  }

  if (subStatus !== undefined && subStatus !== null && typeof subStatus !== 'string') {
    return NextResponse.json({ error: 'Invalid subStatus' }, { status: 400 })
  }

  if (subStatus !== undefined) {
    data.subStatus = subStatus === '' ? null : subStatus
    if (typeof subStatus === 'string' && subStatus !== '') {
      data.subStatusHistory = { push: subStatus }
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  // Fetch current order to determine side effects
  const current = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { select: { productId: true, quantity: true, name: true, price: true, size: true } },
      address: { select: { phone: true } },
    },
  })
  if (!current) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

  // Guard: PENDING_TRANSFER → CONFIRMED must go through /confirm-transfer (stock decrement side-effect).
  // Only CANCELLED is allowed as a PATCH transition from PENDING_TRANSFER.
  if (
    current.status === 'PENDING_TRANSFER' &&
    status !== undefined &&
    status !== 'CANCELLED'
  ) {
    return NextResponse.json(
      { error: 'Usá /confirm-transfer para confirmar pagos por transferencia' },
      { status: 400 }
    )
  }

  const nextStatus = status as OrderStatus | undefined
  const isCancelling = nextStatus === 'CANCELLED' && current.status !== 'CANCELLED'
  const isShipping = nextStatus === 'SHIPPED' && current.status !== 'SHIPPED'
  const isArrivedCountry = nextStatus === 'ARRIVED_COUNTRY' && current.status !== 'ARRIVED_COUNTRY'
  const isNationalDistribution = nextStatus === 'NATIONAL_DISTRIBUTION' && current.status !== 'NATIONAL_DISTRIBUTION'
  const isDelivered = nextStatus === 'DELIVERED' && current.status !== 'DELIVERED'
  const shouldRestoreStock = isCancelling && POST_PAYMENT.includes(current.status as OrderStatus)

  try {
    let updatedOrder

    const addressUpdate = data._addressUpdate as Record<string, string | null> | undefined
    delete data._addressUpdate

    const addressUpsert = addressUpdate
      ? prisma.address.upsert({
          where: { orderId: id },
          update: addressUpdate,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: { orderId: id, ...(addressUpdate as any) },
        })
      : null

    if (shouldRestoreStock) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [order] = await prisma.$transaction([
        prisma.order.update({ where: { id }, data }),
        ...current.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        ),
        ...(addressUpsert ? [addressUpsert] : []),
      ] as any)
      updatedOrder = order
      console.log(`[admin/orders] Orden ${id} cancelada, stock restaurado`)
    } else {
      const hasOrderUpdate = Object.keys(data).length > 0
      await Promise.all([
        hasOrderUpdate ? prisma.order.update({ where: { id }, data }) : null,
        addressUpsert,
      ].filter(Boolean))
      updatedOrder = hasOrderUpdate
        ? await prisma.order.findUnique({ where: { id } })
        : current
    }

    // Send email side effects (fire-and-forget, don't block the response)
    const emailData = {
      orderId: current.id,
      email: current.email,
      phone: current.address?.phone ?? null,
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
    } else if (isArrivedCountry) {
      sendArrivedCountryEmail(emailData).catch((e) =>
        console.error('[admin/orders] arrived-country email failed:', e)
      )
    } else if (isNationalDistribution) {
      sendNationalDistributionEmail(emailData).catch((e) =>
        console.error('[admin/orders] national-distribution email failed:', e)
      )
    } else if (isDelivered) {
      sendDeliveredEmail(emailData).catch((e) =>
        console.error('[admin/orders] delivered email failed:', e)
      )
    }

    return NextResponse.json({ order: updatedOrder }, { status: 200 })
  } catch (err: unknown) {
    console.error('[PATCH /api/admin/orders/[id]]', err)
    return NextResponse.json({ error: 'Error al actualizar la orden' }, { status: 503 })
  }
}

// PENDING_TRANSFER is deletable: no stock was decremented, so no restore is needed.
const DELETABLE_STATUSES: OrderStatus[] = ['PENDING', 'CANCELLED', 'PENDING_TRANSFER']

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await prisma.order.findUnique({ where: { id }, select: { id: true, status: true } })
  if (!order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

  if (!DELETABLE_STATUSES.includes(order.status as OrderStatus)) {
    return NextResponse.json(
      { error: `No se puede eliminar una orden con estado ${order.status}` },
      { status: 422 }
    )
  }

  try {
    await prisma.order.delete({ where: { id } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: unknown) {
    console.error('[DELETE /api/admin/orders/[id]]', err)
    return NextResponse.json({ error: 'Error al eliminar la orden' }, { status: 503 })
  }
}
