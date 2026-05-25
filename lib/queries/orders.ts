import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma'

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
    color: string | null
    image: string | null
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

export type GetOrdersOptions = {
  status?: OrderStatus
  search?: string
  cursor?: string
  limit?: number
}

export type GetOrdersResult = {
  orders: OrderWithItems[]
  nextCursor: string | null
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
  items: {
    id: string
    name: string
    price: number
    quantity: number
    size: string | null
    color?: string | null
    product: { images: string[] }
  }[]
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
      color: item.color ?? null,
      image: item.product.images[0] ?? null,
    })),
    address: order.address ?? null,
  }
}

const DEFAULT_LIMIT = 25

export async function getAllOrders(options?: GetOrdersOptions): Promise<GetOrdersResult>
export async function getAllOrders(status?: OrderStatus): Promise<OrderWithItems[]>
export async function getAllOrders(
  optionsOrStatus?: GetOrdersOptions | OrderStatus
): Promise<GetOrdersResult | OrderWithItems[]> {
  // Backward-compat: if called with a plain string status (legacy callers), return bare array
  if (typeof optionsOrStatus === 'string') {
    try {
      const orders = await prisma.order.findMany({
        where: { status: optionsOrStatus },
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            select: {
              id: true,
              name: true,
              price: true,
              quantity: true,
              size: true,
              color: true,
              product: { select: { images: true } },
            },
          },
          address: true,
        },
      })
      return orders.map(mapOrder)
    } catch (e) {
      console.error('[getAllOrders] DB unavailable:', e)
      return []
    }
  }

  const options = optionsOrStatus ?? {}
  const { status, search, cursor, limit: rawLimit } = options
  const limit = rawLimit ?? DEFAULT_LIMIT

  try {
    // Build cursor condition: orders older than cursor position
    let cursorWhere: Record<string, unknown> | undefined
    if (cursor) {
      try {
        const decoded = atob(cursor)
        const separatorIdx = decoded.lastIndexOf('__')
        if (separatorIdx !== -1) {
          const tsStr = decoded.slice(0, separatorIdx)
          const cursorId = decoded.slice(separatorIdx + 2)
          const cursorTs = new Date(tsStr)
          cursorWhere = {
            OR: [
              { createdAt: { lt: cursorTs } },
              { createdAt: cursorTs, id: { lt: cursorId } },
            ],
          }
        }
      } catch {
        // malformed cursor — ignore, start from beginning
      }
    }

    // Build search condition: min 2 chars
    const searchWhere =
      search && search.length >= 2
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              { id: { startsWith: search, mode: 'insensitive' as const } },
            ],
          }
        : undefined

    // Combine conditions
    const andConditions: Prisma.OrderWhereInput[] = []
    if (status) andConditions.push({ status })
    if (searchWhere) andConditions.push(searchWhere)
    if (cursorWhere) andConditions.push(cursorWhere)

    const where = andConditions.length > 0 ? { AND: andConditions } : undefined

    const rows = await prisma.order.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      include: {
        items: {
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            size: true,
            color: true,
            product: { select: { images: true } },
          },
        },
        address: true,
      },
    })

    const orders = rows.map(mapOrder)

    // Compute nextCursor only when we got a full page
    let nextCursor: string | null = null
    if (rows.length === limit) {
      const last = rows[rows.length - 1]
      nextCursor = btoa(`${last.createdAt.toISOString()}__${last.id}`)
    }

    return { orders, nextCursor }
  } catch (e) {
    console.error('[getAllOrders] DB unavailable:', e)
    return { orders: [], nextCursor: null }
  }
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            size: true,
            color: true,
            product: { select: { images: true } },
          },
        },
        address: true,
      },
    })
    if (!order) return null
    return mapOrder(order)
  } catch (e) {
    console.error('[getOrderById] DB unavailable:', e)
    return null
  }
}

export async function getOrdersByEmail(email: string): Promise<OrderWithItems[]> {
  try {
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
            color: true,
            product: { select: { images: true } },
          },
        },
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
        items: {
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            size: true,
            color: true,
            product: { select: { images: true } },
          },
        },
        address: true,
      },
    })
    return orders.map(mapOrder)
  } catch (e) {
    console.error('[getOrdersByUserId] DB unavailable:', e)
    return []
  }
}
