/**
 * Tests for brand page data integrity.
 *
 * Covers:
 *  1. site-config integrity  — getSiteConfig / upsertSiteConfig behaviour
 *  2. zapatillas merge logic — getProducts brand+category filter
 *  3. newArrivals ordering   — getNewProducts with customIds; deleted-ID resilience
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — declared before dynamic imports so vi.mock hoists correctly
// ---------------------------------------------------------------------------

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    siteConfig: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { prisma } from '@/lib/prisma'
import { getSiteConfig, upsertSiteConfig } from '@/lib/queries/site-config'
import { getProducts, getNewProducts, getProductsByIds } from '@/lib/queries/products'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePrismaProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'prod-1',
    name: 'Air Jordan 1',
    slug: 'air-jordan-1',
    price: 15000,
    comparePrice: null,
    images: ['https://example.com/img.jpg'],
    description: 'Classic silhouette',
    featured: false,
    featuredOrder: null,
    active: true,
    stock: 10,
    brand: 'JORDAN',
    colors: [],
    sizes: [],
    createdAt: new Date('2024-01-01'),
    category: { id: 'cat-1', name: 'Zapatillas', slug: 'zapatillas' },
    categories: [
      { category: { id: 'cat-1', name: 'Zapatillas', slug: 'zapatillas' }, isPrimary: true },
    ],
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// 1. site-config integrity
// ===========================================================================

describe('getSiteConfig', () => {
  it('returns null when no config row exists in DB', async () => {
    ;(prisma.siteConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const result = await getSiteConfig('jordanMasPedido')

    expect(result).toBeNull()
    expect(prisma.siteConfig.findUnique).toHaveBeenCalledWith({
      where: { key: 'jordanMasPedido' },
    })
  })

  it('returns the stored value directly when a config row exists', async () => {
    const storedValue = { productIds: ['prod-1', 'prod-2'] }
    ;(prisma.siteConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      key: 'brandSneakersJordan',
      value: storedValue,
    })

    const result = await getSiteConfig('brandSneakersJordan')

    expect(result).toEqual(storedValue)
    expect(result).toHaveProperty('productIds')
  })

  it('returns the exact value object without mutation', async () => {
    const storedValue = { slides: [{ image: '/hero/1.webp', label: 'Nueva', title: 'T', subtitle: 'S', ctaText: 'Comprar', ctaLink: '/products' }] }
    ;(prisma.siteConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      key: 'hero',
      value: storedValue,
    })

    const result = await getSiteConfig('hero')

    // Deep equality — not the same reference as the raw prisma row, but same data
    expect(result).toEqual(storedValue)
  })

  it('returns null on DB error (try/catch silences errors)', async () => {
    ;(prisma.siteConfig.findUnique as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB connection failed'))

    const result = await getSiteConfig('nikeMasPedido')

    expect(result).toBeNull()
  })
})

describe('upsertSiteConfig', () => {
  it('calls prisma.siteConfig.upsert with correct where / create / update args', async () => {
    const value = { productIds: ['prod-A', 'prod-B'] }
    ;(prisma.siteConfig.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({
      key: 'newArrivalsJordan',
      value,
    })

    await upsertSiteConfig('newArrivalsJordan', value)

    expect(prisma.siteConfig.upsert).toHaveBeenCalledOnce()
    expect(prisma.siteConfig.upsert).toHaveBeenCalledWith({
      where: { key: 'newArrivalsJordan' },
      update: { value },
      create: { key: 'newArrivalsJordan', value },
    })
  })

  it('passes value through as-is (no deep-merge inside upsertSiteConfig)', async () => {
    // upsertSiteConfig is a thin wrapper — the caller is responsible for merging.
    // This test ensures the function does NOT silently drop or transform fields.
    const fullValue = { productIds: ['prod-1'] }
    ;(prisma.siteConfig.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({
      key: 'brandSneakersNike',
      value: fullValue,
    })

    await upsertSiteConfig('brandSneakersNike', fullValue)

    const call = (prisma.siteConfig.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call.update.value).toEqual(fullValue)
    expect(call.create.value).toEqual(fullValue)
  })
})

// ===========================================================================
// 2. zapatillas dynamic query — getProducts with brand+category filter
// ===========================================================================

describe('getProducts — brand + categorySlug filter', () => {
  it('passes brand and categorySlug to prisma.product.findMany where clause', async () => {
    const mockProducts = [
      makePrismaProduct({ id: 'p1', brand: 'JORDAN' }),
      makePrismaProduct({ id: 'p2', brand: 'JORDAN' }),
      makePrismaProduct({ id: 'p3', brand: 'JORDAN' }),
    ]
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockProducts)

    const result = await getProducts({ brand: 'JORDAN', categorySlug: 'zapatillas' })

    expect(result).toHaveLength(3)

    const whereArg = (prisma.product.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0].where
    expect(whereArg).toMatchObject({
      active: true,
      brand: 'JORDAN',
      categories: { some: { category: { slug: 'zapatillas' } } },
    })
  })

  it('returns products mapped to DbProduct shape', async () => {
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makePrismaProduct({ id: 'p1' }),
    ])

    const result = await getProducts({ brand: 'NIKE' })

    expect(result[0]).toMatchObject({
      id: 'p1',
      brand: 'JORDAN', // from the fixture
      category: 'Zapatillas',
      categorySlug: 'zapatillas',
      categorySlugs: ['zapatillas'],
    })
  })

  it('defaults to createdAt desc order when no sort is specified', async () => {
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])

    await getProducts({ brand: 'JORDAN', categorySlug: 'zapatillas' })

    const orderBy = (prisma.product.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0].orderBy
    expect(orderBy).toEqual({ createdAt: 'desc' })
  })
})

// ===========================================================================
// 3. newArrivals — getNewProducts with customIds
// ===========================================================================

describe('getNewProducts — customIds ordering', () => {
  it('returns products in customIds order (pinned order preserved)', async () => {
    const prodA = makePrismaProduct({ id: 'prod-A', name: 'AJ1 Low' })
    const prodB = makePrismaProduct({ id: 'prod-B', name: 'AJ1 High' })

    // DB returns in arbitrary order [A, B]
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([prodA, prodB])

    // We request [B, A] — reverse pin order
    const result = await getNewProducts(10, undefined, ['prod-B', 'prod-A'])

    expect(result[0].id).toBe('prod-B')
    expect(result[1].id).toBe('prod-A')
  })

  it('filters out deleted / inactive product IDs that are not returned by DB', async () => {
    const prodA = makePrismaProduct({ id: 'prod-A' })
    // prod-DELETED is not returned by DB (it was deleted or deactivated)
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([prodA])

    const result = await getNewProducts(10, undefined, ['prod-DELETED', 'prod-A'])

    // prod-DELETED must not appear; prod-A must still be present
    expect(result.map((p) => p.id)).not.toContain('prod-DELETED')
    expect(result.map((p) => p.id)).toContain('prod-A')
  })

  it('passes brand filter in where clause when customIds are provided', async () => {
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])

    await getNewProducts(10, 'JORDAN', ['prod-X'])

    const whereArg = (prisma.product.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0].where
    expect(whereArg).toMatchObject({
      id: { in: ['prod-X'] },
      active: true,
      brand: 'JORDAN',
    })
  })

  it('orders by createdAt desc when no customIds — falling back to DB products', async () => {
    // Return empty first call (no products in last 30 days) then some on fallback
    const recent: never[] = []
    const fallback = [makePrismaProduct({ id: 'p-old' })]
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(recent)
      .mockResolvedValueOnce(fallback)

    const result = await getNewProducts(10, 'JORDAN')

    // Both findMany calls should use orderBy: { createdAt: 'desc' }
    const calls = (prisma.product.findMany as ReturnType<typeof vi.fn>).mock.calls
    calls.forEach((call) => {
      expect(call[0].orderBy).toEqual({ createdAt: 'desc' })
    })
    expect(result[0].id).toBe('p-old')
  })
})

// ===========================================================================
// 4. newArrivals merge — pinned-first logic (extracted from products page)
// ===========================================================================

describe('newArrivals pinned-first merge logic', () => {
  /**
   * This replicates the merge performed in products/page.tsx for brandSneakers:
   *   const pinned = configIds.map(pid => base.find(p => p.id === pid)).filter(Boolean)
   *   const rest   = base.filter(p => !configIds.includes(p.id))
   *   return [...pinned, ...rest]
   */
  function applyPinnedOrder(
    baseProducts: Array<{ id: string }>,
    configIds: string[],
  ): Array<{ id: string }> {
    if (!configIds.length) return baseProducts
    const pinned = configIds
      .map((pid) => baseProducts.find((p) => p.id === pid))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
    const rest = baseProducts.filter((p) => !configIds.includes(p.id))
    return [...pinned, ...rest]
  }

  it('pinned products come first, rest follow in original order', () => {
    const base = [{ id: 'A' }, { id: 'B' }, { id: 'C' }]
    const configIds = ['B', 'A']

    const result = applyPinnedOrder(base, configIds)

    expect(result.map((p) => p.id)).toEqual(['B', 'A', 'C'])
  })

  it('deleted config ID is silently dropped — other products still appear', () => {
    const base = [{ id: 'A' }, { id: 'C' }]
    // DELETED is in config but not returned by DB
    const configIds = ['DELETED', 'A']

    const result = applyPinnedOrder(base, configIds)

    expect(result.map((p) => p.id)).not.toContain('DELETED')
    expect(result.map((p) => p.id)).toContain('A')
    expect(result.map((p) => p.id)).toContain('C')
  })

  it('returns all base products when configIds is empty', () => {
    const base = [{ id: 'A' }, { id: 'B' }]
    const result = applyPinnedOrder(base, [])
    expect(result).toEqual(base)
  })
})

// ===========================================================================
// 5. getProductsByIds — order preservation
// ===========================================================================

describe('getProductsByIds', () => {
  it('returns products in the requested IDs order, not DB return order', async () => {
    const prodA = makePrismaProduct({ id: 'A' })
    const prodB = makePrismaProduct({ id: 'B' })

    // DB returns [A, B]
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([prodA, prodB])

    // We requested [B, A]
    const result = await getProductsByIds(['B', 'A'])

    expect(result[0].id).toBe('B')
    expect(result[1].id).toBe('A')
  })

  it('returns empty array when called with no IDs', async () => {
    const result = await getProductsByIds([])
    expect(result).toEqual([])
    expect(prisma.product.findMany).not.toHaveBeenCalled()
  })
})
