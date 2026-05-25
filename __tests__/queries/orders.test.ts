/**
 * Unit tests for lib/queries/orders.ts
 * Tests: getAllOrders (search, pagination, empty results) + getOrderById
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock Prisma singleton — factory must be inline (vi.mock is hoisted)
// ---------------------------------------------------------------------------

vi.mock('@/lib/prisma', () => {
  const findMany = vi.fn()
  const findUnique = vi.fn()
  return {
    prisma: {
      order: {
        findMany,
        findUnique,
      },
    },
  }
})

import { prisma } from '@/lib/prisma'
import { getAllOrders, getOrderById } from '@/lib/queries/orders'

// Typed references to mocked fns
const mockFindMany = prisma.order.findMany as ReturnType<typeof vi.fn>
const mockFindUnique = prisma.order.findUnique as ReturnType<typeof vi.fn>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeOrder(overrides: {
  id?: string
  email?: string
  status?: string
  createdAt?: Date
  color?: string | null
} = {}) {
  return {
    id: overrides.id ?? 'ord_test123',
    email: overrides.email ?? 'test@example.com',
    status: overrides.status ?? 'PENDING',
    trackingNumber: null,
    subtotal: 10000,
    shipping: 0,
    total: 10000,
    createdAt: overrides.createdAt ?? new Date('2025-01-15T10:00:00Z'),
    items: [
      {
        id: 'item_1',
        name: 'Test Product',
        price: 10000,
        quantity: 1,
        size: 'M',
        color: overrides.color !== undefined ? overrides.color : 'Negro',
        product: { images: ['https://example.com/img.jpg'] },
      },
    ],
    address: {
      id: 'addr_1',
      name: 'John Doe',
      street: 'Av. Test 123',
      city: 'Buenos Aires',
      state: 'CABA',
      zipCode: '1000',
      country: 'Argentina',
    },
  }
}

function make25Orders() {
  return Array.from({ length: 25 }, (_, i) =>
    makeOrder({
      id: `ord_${String(i).padStart(3, '0')}`,
      createdAt: new Date(Date.now() - i * 1000),
    })
  )
}

// ---------------------------------------------------------------------------
// Tests: getAllOrders (options form)
// ---------------------------------------------------------------------------

describe('getAllOrders (options)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 25 rows and a non-null nextCursor when a full page is returned', async () => {
    const rows = make25Orders()
    mockFindMany.mockResolvedValueOnce(rows)

    const result = await getAllOrders()

    // result is GetOrdersResult (options path, not string path)
    expect(result).toHaveProperty('orders')
    expect(result).toHaveProperty('nextCursor')
    if (!Array.isArray(result)) {
      expect(result.orders).toHaveLength(25)
      expect(result.nextCursor).not.toBeNull()
      expect(typeof result.nextCursor).toBe('string')
    }
  })

  it('returns null nextCursor on last page (fewer than limit rows)', async () => {
    const rows = make25Orders().slice(0, 10)
    mockFindMany.mockResolvedValueOnce(rows)

    const result = await getAllOrders({ limit: 25 })

    if (!Array.isArray(result)) {
      expect(result.orders).toHaveLength(10)
      expect(result.nextCursor).toBeNull()
    }
  })

  it('builds search filter with OR on email and id when search >= 2 chars', async () => {
    mockFindMany.mockResolvedValueOnce([])

    await getAllOrders({ search: 'gabriel' })

    expect(mockFindMany).toHaveBeenCalledOnce()
    const callArg = mockFindMany.mock.calls[0][0]

    const andArr: unknown[] = callArg.where?.AND
    expect(andArr).toBeDefined()
    const searchClause = (andArr as Record<string, unknown>[]).find((c) => 'OR' in c)
    expect(searchClause).toBeDefined()

    const orArr = (searchClause as { OR: unknown[] }).OR
    expect(orArr).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: expect.objectContaining({ contains: 'gabriel' }) }),
        expect.objectContaining({ id: expect.objectContaining({ startsWith: 'gabriel' }) }),
      ])
    )
  })

  it('does NOT apply search filter when query is 1 char (min 2 chars required)', async () => {
    mockFindMany.mockResolvedValueOnce([])

    await getAllOrders({ search: 'g' })

    const callArg = mockFindMany.mock.calls[0][0]
    const andArr: unknown[] | undefined = callArg.where?.AND

    if (andArr) {
      const searchClause = (andArr as Record<string, unknown>[]).find((c) => 'OR' in c)
      expect(searchClause).toBeUndefined()
    } else {
      // No where clause at all — also valid
      expect(callArg.where).toBeUndefined()
    }
  })

  it('returns empty orders and null nextCursor when DB throws', async () => {
    mockFindMany.mockRejectedValueOnce(new Error('DB down'))

    const result = await getAllOrders()

    if (!Array.isArray(result)) {
      expect(result.orders).toEqual([])
      expect(result.nextCursor).toBeNull()
    }
  })

  it('cursor encoding round-trips: nextCursor decodes back to ISO timestamp + id', async () => {
    const rows = make25Orders()
    mockFindMany.mockResolvedValueOnce(rows)

    const result = await getAllOrders()

    if (!Array.isArray(result) && result.nextCursor) {
      const decoded = atob(result.nextCursor)
      const sepIdx = decoded.lastIndexOf('__')
      const tsStr = decoded.slice(0, sepIdx)
      const id = decoded.slice(sepIdx + 2)

      const date = new Date(tsStr)
      expect(date.toISOString()).toBe(tsStr)
      expect(id).toBe(rows[24].id)
    }
  })

  it('includes cursor condition in Prisma where clause when cursor param provided', async () => {
    const ts = new Date('2025-01-15T10:00:00.000Z')
    const cursor = btoa(`${ts.toISOString()}__ord_cursor_id`)
    mockFindMany.mockResolvedValueOnce([])

    await getAllOrders({ cursor })

    const callArg = mockFindMany.mock.calls[0][0]
    const andArr: unknown[] | undefined = callArg.where?.AND
    expect(andArr).toBeDefined()
    // Cursor clause is an OR of createdAt conditions
    const cursorClause = (andArr as Record<string, unknown>[]).find((c) => 'OR' in c)
    expect(cursorClause).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Tests: getAllOrders backward compat (legacy string status)
// ---------------------------------------------------------------------------

describe('getAllOrders backward compat (string status)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a plain array when called with a status string (legacy)', async () => {
    const rows = [makeOrder({ status: 'PENDING' })]
    mockFindMany.mockResolvedValueOnce(rows)

    // Cast to any to bypass the overload typing in the test — this simulates legacy call sites
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (getAllOrders as any)('PENDING')

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// Tests: getOrderById
// ---------------------------------------------------------------------------

describe('getOrderById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when order is not found', async () => {
    mockFindUnique.mockResolvedValueOnce(null)

    const result = await getOrderById('nonexistent-id')

    expect(result).toBeNull()
    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'nonexistent-id' } })
    )
  })

  it('returns mapped order with color when order exists', async () => {
    mockFindUnique.mockResolvedValueOnce(makeOrder({ color: 'Negro' }))

    const result = await getOrderById('ord_test123')

    expect(result).not.toBeNull()
    expect(result?.id).toBe('ord_test123')
    expect(result?.items[0].color).toBe('Negro')
    expect(result?.items[0].image).toBe('https://example.com/img.jpg')
  })

  it('maps color as null when order item has no color (legacy orders)', async () => {
    mockFindUnique.mockResolvedValueOnce(makeOrder({ color: null }))

    const result = await getOrderById('ord_test123')

    expect(result?.items[0].color).toBeNull()
  })

  it('returns null when DB throws', async () => {
    mockFindUnique.mockRejectedValueOnce(new Error('DB unavailable'))

    const result = await getOrderById('ord_test123')

    expect(result).toBeNull()
  })
})
