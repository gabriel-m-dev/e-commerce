import { prisma } from '@/lib/prisma'

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export type OrderWithItems = {
  id: string
  email: string
  status: OrderStatus
  trackingNumber: string | null
  subtotal: number
  shipping: number
  total: number
  createdAt: Date
  items: {
    id: string
    name: string
    price: number
    quantity: number
    size: string | null
  }[]
  address: {
    id: string
    name: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  } | null
}

function mapOrder(order: {
  id: string
  email: string
  status: string
  trackingNumber?: string | null
  subtotal: number
  shipping: number
  total: number
  createdAt: Date
  items: { id: string; name: string; price: number; quantity: number; size: string | null }[]
  address: { id: string; name: string; street: string; city: string; state: string; zipCode: string; country: string } | null
}): OrderWithItems {
  return {
    id: order.id,
    email: order.email,
    status: order.status as OrderStatus,
    trackingNumber: order.trackingNumber ?? null,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      size: item.size,
    })),
    address: order.address ?? null,
  }
}

export async function getAllOrders(status?: OrderStatus): Promise<OrderWithItems[]> {
  try {
    const orders = await prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { select: { id: true, name: true, price: true, quantity: true, size: true } },
        address: true,
      },
    })
    return orders.map(mapOrder)
  } catch (e) {
    console.error('[getAllOrders] DB unavailable:', e)
    return []
  }
}

export async function getOrdersByEmail(email: string): Promise<OrderWithItems[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { select: { id: true, name: true, price: true, quantity: true, size: true } },
        address: true,
      },
    })
    return orders.map(mapOrder)
  } catch (e) {
    console.error('[getOrdersByEmail] DB unavailable:', e)
    return []
  }
}

export async function getOrdersByUserId(userId: string, email: string): Promise<OrderWithItems[]> {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId },
          { email, userId: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { select: { id: true, name: true, price: true, quantity: true, size: true } },
        address: true,
      },
    })
    return orders.map(mapOrder)
  } catch (e) {
    console.error('[getOrdersByUserId] DB unavailable:', e)
    return []
  }
}
