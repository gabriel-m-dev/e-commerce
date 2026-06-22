/**
 * Tests for /api/admin/products/[id] — DELETE and PUT handlers.
 *
 * Critical paths covered:
 *  DELETE — site-config cascade cleanup (array keys and single keys)
 *  PUT    — brand-change cleanup (sneakersConfig, newArrivals, masPedido)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mocks — must be declared before dynamic imports so vi.mock hoists correctly
// ---------------------------------------------------------------------------

// Mock Prisma singleton
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
    productCategory: {
      deleteMany: vi.fn(),
    },
    productShippingMethod: {
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    siteConfig: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation(async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops)
      return ops
    }),
  },
}))

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock @supabase/supabase-js (used for storage admin client in PUT)
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  })),
}))

// Mock site-config queries
vi.mock('@/lib/queries/site-config', () => ({
  getSiteConfig: vi.fn(),
  upsertSiteConfig: vi.fn(),
}))

// Mock next/headers (required by @/lib/supabase/server at module load time)
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

// ---------------------------------------------------------------------------
// Imports (after vi.mock declarations)
// ---------------------------------------------------------------------------

import { prisma } from '@/lib/prisma'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { getSiteConfig, upsertSiteConfig } from '@/lib/queries/site-config'
import { DELETE, PUT } from '@/app/api/admin/products/[id]/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRODUCT_ID = 'prod-123'
const OTHER_PRODUCT_ID = 'prod-456'

/** Build a minimal product fixture */
function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: PRODUCT_ID,
    name: 'Air Jordan 1',
    slug: 'air-jordan-1',
    description: 'Classic silhouette',
    price: 15000,
    comparePrice: null,
    images: ['https://example.com/img.jpg'],
    colors: [],
    sizes: [],
    categoryId: 'cat-1',
    stock: 10,
    featured: false,
    active: true,
    brand: 'JORDAN',
    ...overrides,
  }
}

/** Build a minimal admin Supabase user fixture */
function makeAdminUser() {
  return {
    id: 'user-admin',
    app_metadata: { role: 'admin' },
  }
}

/** Wire up the Supabase mock to return an admin user */
function mockAdminAuth() {
  ;(createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: makeAdminUser() },
      }),
    },
  })
}

/** Helper: build a DELETE NextRequest for the given product ID (unused in handler body, only params matter) */
function makeDeleteRequest() {
  return new Request(`http://localhost/api/admin/products/${PRODUCT_ID}`, {
    method: 'DELETE',
  }) as unknown as NextRequest
}

/** Helper: build a PUT NextRequest with a minimal valid body */
function makePutRequest(body: Record<string, unknown>) {
  return new Request(`http://localhost/api/admin/products/${PRODUCT_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

/** Minimal valid PUT body for a JORDAN → NIKE brand change */
function makeValidPutBody(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Air Jordan 1',
    slug: 'air-jordan-1',
    price: 15000,
    comparePrice: null,
    categorySlugs: ['zapatillas'],
    primaryCategorySlug: 'zapatillas',
    images: ['https://example.com/img.jpg'],
    description: 'Classic silhouette',
    stock: 10,
    featured: false,
    active: true,
    brand: 'NIKE',
    colors: [],
    sizes: [],
    ...overrides,
  }
}

/** Route params wrapper — the handler receives `{ params: Promise<{ id: string }> }` */
function makeParams(id = PRODUCT_ID) {
  return { params: Promise.resolve({ id }) }
}

// ---------------------------------------------------------------------------
// beforeEach — reset all mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  mockAdminAuth()
  ;(upsertSiteConfig as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
})

// ===========================================================================
// DELETE — cascade cleanup
// ===========================================================================

describe('DELETE /api/admin/products/[id]', () => {
  it('removes the product ID from brandSneakersJordan.productIds', async () => {
    // Arrange
    const product = makeProduct()
    ;(prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(product)
    ;(prisma.product.delete as ReturnType<typeof vi.fn>).mockResolvedValue(product)

    ;(getSiteConfig as ReturnType<typeof vi.fn>).mockImplementation(async (key: string) => {
      if (key === 'brandSneakersJordan') {
        return { productIds: [PRODUCT_ID, OTHER_PRODUCT_ID] }
      }
      return null
    })

    // Act
    const response = await DELETE(makeDeleteRequest(), makeParams())

    // Assert
    expect(response.status).toBe(200)

    // upsertSiteConfig must have been called for brandSneakersJordan
    const calls = (upsertSiteConfig as ReturnType<typeof vi.fn>).mock.calls
    const jordanCall = calls.find(([k]: [string]) => k === 'brandSneakersJordan')
    expect(jordanCall).toBeDefined()
    // The deleted ID must be gone; the other one must remain
    expect(jordanCall![1].productIds).not.toContain(PRODUCT_ID)
    expect(jordanCall![1].productIds).toContain(OTHER_PRODUCT_ID)
  })

  it('sets masPedido productId to empty string when it matches the deleted product', async () => {
    // Arrange
    const product = makeProduct()
    ;(prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(product)
    ;(prisma.product.delete as ReturnType<typeof vi.fn>).mockResolvedValue(product)

    ;(getSiteConfig as ReturnType<typeof vi.fn>).mockImplementation(async (key: string) => {
      if (key === 'jordanMasPedido') {
        return { productId: PRODUCT_ID }
      }
      return null
    })

    // Act
    const response = await DELETE(makeDeleteRequest(), makeParams())

    // Assert
    expect(response.status).toBe(200)

    const calls = (upsertSiteConfig as ReturnType<typeof vi.fn>).mock.calls
    const masPedidoCall = calls.find(([k]: [string]) => k === 'jordanMasPedido')
    expect(masPedidoCall).toBeDefined()
    // The API clears the productId by setting it to '' (empty string), not null
    expect(masPedidoCall![1].productId).toBe('')
  })

  it('leaves other products untouched when only one ID is removed from a list', async () => {
    // Arrange
    const product = makeProduct()
    ;(prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(product)
    ;(prisma.product.delete as ReturnType<typeof vi.fn>).mockResolvedValue(product)

    ;(getSiteConfig as ReturnType<typeof vi.fn>).mockImplementation(async (key: string) => {
      if (key === 'brandSneakersJordan') {
        return { productIds: [PRODUCT_ID, OTHER_PRODUCT_ID] }
      }
      return null
    })

    // Act
    await DELETE(makeDeleteRequest(), makeParams())

    // Assert — OTHER_PRODUCT_ID must survive in the updated config
    const calls = (upsertSiteConfig as ReturnType<typeof vi.fn>).mock.calls
    const jordanCall = calls.find(([k]: [string]) => k === 'brandSneakersJordan')
    expect(jordanCall![1].productIds).toEqual([OTHER_PRODUCT_ID])
  })
})

// ===========================================================================
// PUT — brand-change cleanup
// ===========================================================================

describe('PUT /api/admin/products/[id] — brand change JORDAN → NIKE', () => {
  beforeEach(() => {
    // Category lookup must succeed (now uses findMany)
    ;(prisma.category.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{
      id: 'cat-1',
      slug: 'zapatillas',
      name: 'Zapatillas',
    }])

    // deleteMany for M2M category replacement must succeed
    ;(prisma.productCategory.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 })

    // Existing product is JORDAN brand
    ;(prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeProduct({ brand: 'JORDAN' })
    )

    // product.update returns the updated product (now NIKE)
    ;(prisma.product.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeProduct({ brand: 'NIKE' })
    )
  })

  it('sets jordanMasPedido.productId to empty string when it references the moved product', async () => {
    // Arrange — jordanMasPedido points to our product
    ;(getSiteConfig as ReturnType<typeof vi.fn>).mockImplementation(async (key: string) => {
      if (key === 'jordanMasPedido') {
        return { productId: PRODUCT_ID }
      }
      return null
    })

    const body = makeValidPutBody({ brand: 'NIKE' })
    const response = await PUT(makePutRequest(body), makeParams())

    expect(response.status).toBe(200)

    const calls = (upsertSiteConfig as ReturnType<typeof vi.fn>).mock.calls
    const masPedidoCall = calls.find(([k]: [string]) => k === 'jordanMasPedido')
    expect(masPedidoCall).toBeDefined()
    // The API clears the productId by setting it to '' (empty string), not null
    expect(masPedidoCall![1].productId).toBe('')
  })

  it('removes the product ID from brandSneakersJordan.productIds on brand change', async () => {
    // Arrange
    ;(getSiteConfig as ReturnType<typeof vi.fn>).mockImplementation(async (key: string) => {
      if (key === 'brandSneakersJordan') {
        return { productIds: [PRODUCT_ID, OTHER_PRODUCT_ID] }
      }
      return null
    })

    const body = makeValidPutBody({ brand: 'NIKE' })
    const response = await PUT(makePutRequest(body), makeParams())

    expect(response.status).toBe(200)

    const calls = (upsertSiteConfig as ReturnType<typeof vi.fn>).mock.calls
    const sneakersCall = calls.find(([k]: [string]) => k === 'brandSneakersJordan')
    expect(sneakersCall).toBeDefined()
    expect(sneakersCall![1].productIds).not.toContain(PRODUCT_ID)
  })

  it('removes the product ID from newArrivalsJordan.productIds on brand change', async () => {
    // Arrange
    ;(getSiteConfig as ReturnType<typeof vi.fn>).mockImplementation(async (key: string) => {
      if (key === 'newArrivalsJordan') {
        return { productIds: [PRODUCT_ID] }
      }
      return null
    })

    const body = makeValidPutBody({ brand: 'NIKE' })
    const response = await PUT(makePutRequest(body), makeParams())

    expect(response.status).toBe(200)

    const calls = (upsertSiteConfig as ReturnType<typeof vi.fn>).mock.calls
    const newArrivalsCall = calls.find(([k]: [string]) => k === 'newArrivalsJordan')
    expect(newArrivalsCall).toBeDefined()
    expect(newArrivalsCall![1].productIds).toEqual([])
  })
})
