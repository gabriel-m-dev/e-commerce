import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { sendTransferConfirmedEmail } from '@/lib/email'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Admin-only auth guard — same pattern as [id]/route.ts
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch order with items and user for email
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { select: { productId: true, quantity: true } },
      user: { select: { email: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  }

  // Guard: only PENDING_TRANSFER orders can be confirmed via this route
  if (order.status !== 'PENDING_TRANSFER' || order.paymentMethod !== 'transfer') {
    return NextResponse.json(
      { error: 'La orden no es una transferencia pendiente de confirmación' },
      { status: 409 }
    )
  }

  try {
    // Atomic transaction: status → CONFIRMED + decrement stock for each item
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
    ])

    // Send confirmation email — fire-and-forget (non-fatal)
    const recipientEmail = order.user?.email ?? order.email
    sendTransferConfirmedEmail({
      to: recipientEmail,
      orderId: order.id,
      total: Number(order.total),
    }).catch((err) => console.error('[confirm-transfer] confirmed email failed:', err))

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (err: unknown) {
    console.error('[POST /api/admin/orders/[id]/confirm-transfer]', err)
    return NextResponse.json({ error: 'Error al confirmar la transferencia' }, { status: 503 })
  }
}
