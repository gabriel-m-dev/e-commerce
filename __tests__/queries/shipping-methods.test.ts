/**
 * Unit tests for lib/queries/shipping-methods.ts
 * Tests: getActiveShippingMethods filter, deleteShippingMethod soft-delete path
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock Prisma singleton — factory must be inline (vi.mock is hoisted)
// Variables referencing vi.fn() cannot be used inside factory (hoisting issue).
// ---------------------------------------------------------------------------

vi.mock('@/lib/prisma', () => {
  const findMany = vi.fn()
  const findUnique = vi.fn()
  const count = vi.fn()
  const update = vi.fn()
  const del = vi.fn()
  const productFindMany = vi.fn()
  return {
    prisma: {
      shippingMethod: {
        findMany,
        findUnique,
        update,
        delete: del,
      },
      order: {
        count,
      },
      product: {
        findMany: productFindMany,
      },
    },
  }
})

import { prisma } from '@/lib/prisma'
import {
  getActiveShippingMethods,
  getShippingMethodsByProductIds,
  deleteShippingMethod,
} from '@/lib/queries/shipping-methods'

const mockFindMany        = prisma.shippingMethod.findMany as ReturnType<typeof vi.fn>
const mockUpdate          = prisma.shippingMethod.update as ReturnType<typeof vi.fn>
const mockDelete          = prisma.shippingMethod.delete as ReturnType<typeof vi.fn>
const mockCount           = prisma.order.count as ReturnType<typeof vi.fn>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockProductFindMany = (prisma as any).product.findMany as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// getActiveShippingMethods
// ===========================================================================

describe('getActiveShippingMethods', () => {
  it('queries only active methods ordered by price asc', async () => {
    const mockRows = [
      { id: 'a', name: 'Económico', price: 10000, active: true, createdAt: new Date() },
      { id: 'b', name: 'Express',   price: 25000, active: true, createdAt: new Date() },
    ]
    mockFindMany.mockResolvedValue(mockRows)

    const result = await getActiveShippingMethods()

    expect(mockFindMany).toHaveBeenCalledOnce()
    const callArgs = mockFindMany.mock.calls[0][0]

    // Must filter for active only
    expect(callArgs.where).toEqual({ active: true })

    // Must order by price ascending
    expect(callArgs.orderBy).toEqual({ price: 'asc' })

    expect(result).toEqual(mockRows)
  })

  it('returns an empty array when no active methods exist', async () => {
    mockFindMany.mockResolvedValue([])
    const result = await getActiveShippingMethods()
    expect(result).toEqual([])
  })
})

// ===========================================================================
// getShippingMethodsByProductIds
// ===========================================================================

describe('getShippingMethodsByProductIds', () => {
  it('returns all active methods when ids array is empty (fallback)', async () => {
    const allMethods = [
      { id: 'a', name: 'Económico', price: 10000, active: true, createdAt: new Date() },
    ]
    mockFindMany.mockResolvedValue(allMethods)

    const result = await getShippingMethodsByProductIds([])

    // Should call getActiveShippingMethods (shippingMethod.findMany with active: true)
    expect(mockFindMany).toHaveBeenCalledOnce()
    expect(mockFindMany.mock.calls[0][0].where).toEqual({ active: true })
    expect(result).toEqual(allMethods)
    // Should NOT query products
    expect(mockProductFindMany).not.toHaveBeenCalled()
  })

  it('returns all active methods when any product has shippingMethodId = null (fallback)', async () => {
    const allMethods = [
      { id: 'a', name: 'Económico', price: 10000, active: true, createdAt: new Date() },
      { id: 'b', name: 'Express',   price: 25000, active: true, createdAt: new Date() },
    ]
    mockProductFindMany.mockResolvedValue([
      { shippingMethodId: 'a' },
      { shippingMethodId: null },   // triggers fallback
    ])
    mockFindMany.mockResolvedValue(allMethods)

    const result = await getShippingMethodsByProductIds(['p1', 'p2'])

    expect(mockProductFindMany).toHaveBeenCalledOnce()
    expect(mockFindMany).toHaveBeenCalledOnce()
    // Must use getActiveShippingMethods (active: true filter)
    expect(mockFindMany.mock.calls[0][0].where).toEqual({ active: true })
    expect(result).toEqual(allMethods)
  })

  it('returns only filtered distinct methods when all products have assigned ids', async () => {
    const filteredMethods = [
      { id: 'a', name: 'Económico', price: 10000, active: true, createdAt: new Date() },
    ]
    mockProductFindMany.mockResolvedValue([
      { shippingMethodId: 'a' },
      { shippingMethodId: 'a' }, // duplicate — should deduplicate
    ])
    mockFindMany.mockResolvedValue(filteredMethods)

    const result = await getShippingMethodsByProductIds(['p1', 'p2'])

    expect(mockProductFindMany).toHaveBeenCalledOnce()
    expect(mockFindMany).toHaveBeenCalledOnce()
    // Must query by distinct method ids with active: true
    const callArgs = mockFindMany.mock.calls[0][0]
    expect(callArgs.where).toMatchObject({ id: { in: ['a'] }, active: true })
    expect(result).toEqual(filteredMethods)
  })
})

// ===========================================================================
// deleteShippingMethod — soft-delete path
// ===========================================================================

describe('deleteShippingMethod', () => {
  it('soft-deletes (active=false) when orders reference the method', async () => {
    mockCount.mockResolvedValue(3) // 3 orders reference this method
    mockUpdate.mockResolvedValue({ id: 'method-1', active: false })

    const result = await deleteShippingMethod('method-1')

    // Must call order.count with the method id
    expect(mockCount).toHaveBeenCalledWith({ where: { shippingMethodId: 'method-1' } })

    // Must call shippingMethod.update with active: false
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'method-1' },
      data: { active: false },
    })

    // Must NOT hard-delete
    expect(mockDelete).not.toHaveBeenCalled()

    expect(result).toEqual({ softDeleted: true })
  })

  it('hard-deletes when no orders reference the method', async () => {
    mockCount.mockResolvedValue(0) // no orders
    mockDelete.mockResolvedValue({ id: 'method-2' })

    const result = await deleteShippingMethod('method-2')

    expect(mockCount).toHaveBeenCalledWith({ where: { shippingMethodId: 'method-2' } })
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'method-2' } })
    expect(mockUpdate).not.toHaveBeenCalled()

    expect(result).toEqual({ deleted: true })
  })
})
