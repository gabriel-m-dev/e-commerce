import { prisma } from '@/lib/prisma'

export type OrderWithItems = {
  id: string
  email: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
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

export async function getOrdersByEmail(email: string): Promise<OrderWithItems[]> {
  const orders = await prisma.order.findMany({
    where: { email },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
          size: true,
        },
      },
      address: true,
    },
  })

  return orders.map((order) => ({
    id: order.id,
    email: order.email,
    status: order.status as OrderWithItems['status'],
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
    address: order.address
      ? {
          id: order.address.id,
          name: order.address.name,
          street: order.address.street,
          city: order.address.city,
          state: order.address.state,
          zipCode: order.address.zipCode,
          country: order.address.country,
        }
      : null,
  }))
}
