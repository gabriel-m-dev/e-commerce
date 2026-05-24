/**
 * Tests for admin route auth protection.
 *
 * Every admin API route checks:
 *   if (!user || user.app_metadata?.role !== 'admin') → 401
 *
 * For each route group we verify:
 *  1. Unauthenticated (user = null)      → 401
 *  2. Authenticated non-admin            → 401
 *  3. Admin user                         → passes auth, returns 200/201
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mocks — declared before dynamic imports so vi.mock hoists correctly
// ---------------------------------------------------------------------------

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    siteConfig: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  })),
}))

vi.mock('@/lib/queries/site-config', () => ({
  getSiteConfig: vi.fn(),
  upsertSiteConfig: vi.fn(),
  getAllSiteConfigs: vi.fn(),
}))

vi.mock('@/lib/email', () => ({
  sendOrderCancelledEmail: vi.fn().mockResolvedValue(undefined),
  sendOrderShippedEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

// ---------------------------------------------------------------------------
// Imports (after vi.mock declarations)
// ---------------------------------------------------------------------------

import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getAllSiteConfigs, upsertSiteConfig } from '@/lib/queries/site-config'
import { POST as productsPOST } from '@/app/api/admin/products/route'
import { PUT as productIdPUT, DELETE as productIdDELETE } from '@/app/api/admin/products/[id]/route'
import { PATCH as ordersPatch } from '@/app/api/admin/orders/[id]/route'
import { GET as siteConfigGET, PATCH as siteConfigPATCH } from '@/app/api/admin/site-config/route'

// ---------------------------------------------------------------------------
// Auth mock helpers
// ---------------------------------------------------------------------------

function mockAuth(user: object | null) {
  ;(createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  })
}

function mockUnauthenticated() {
  mockAuth(null)
}

function mockNonAdmin() {
  mockAuth({ id: 'user-regular', app_metadata: { role: 'user' } })
}

function mockAdmin() {
  mockAuth({ id: 'user-admin', app_metadata: { role: 'admin' } })
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
  const init: RequestInit = { method }
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' }
    init.body = JSON.stringify(body)
  }
  return new Request(url, init) as unknown as NextRequest
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

// ---------------------------------------------------------------------------
// Shared valid POST body for /api/admin/products
// ---------------------------------------------------------------------------
const VALID_PRODUCT_BODY = {
  name: 'Air Max 90',
  slug: 'air-max-90',
  price: 12000,
  comparePrice: null,
  categorySlug: 'zapatillas',
  images: ['https://example.com/img.jpg'],
  description: 'Classic runner',
  stock: 5,
  featured: false,
  active: true,
  brand: 'NIKE',
  colors: [],
  sizes: [],
}

// ---------------------------------------------------------------------------
// beforeEach — reset mocks
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// POST /api/admin/products
// ===========================================================================

describe('POST /api/admin/products — auth protection', () => {
  it('returns 401 when unauthenticated (no user)', async () => {
    mockUnauthenticated()
    const req = makeRequest('POST', 'http://localhost/api/admin/products', VALID_PRODUCT_BODY)
    const res = await productsPOST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when authenticated as non-admin', async () => {
    mockNonAdmin()
    const req = makeRequest('POST', 'http://localhost/api/admin/products', VALID_PRODUCT_BODY)
    const res = await productsPOST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('proceeds past auth when admin — returns 201 on valid body', async () => {
    mockAdmin()
    ;(prisma.category.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'cat-1',
      slug: 'zapatillas',
      name: 'Zapatillas',
    })
    ;(prisma.product.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'prod-new',
      ...VALID_PRODUCT_BODY,
      categoryId: 'cat-1',
      category: { id: 'cat-1', slug: 'zapatillas', name: 'Zapatillas' },
    })
    const req = makeRequest('POST', 'http://localhost/api/admin/products', VALID_PRODUCT_BODY)
    const res = await productsPOST(req)
    expect(res.status).toBe(201)
  })
})

// ===========================================================================
// PUT /api/admin/products/[id]
// ===========================================================================

describe('PUT /api/admin/products/[id] — auth protection', () => {
  const VALID_PUT_BODY = {
    name: 'Air Max 90',
    slug: 'air-max-90',
    price: 12000,
    comparePrice: null,
    categorySlug: 'zapatillas',
    images: ['https://example.com/img.jpg'],
    description: 'Classic runner',
    stock: 5,
    featured: false,
    active: true,
    brand: 'NIKE',
    colors: [],
    sizes: [],
  }

  it('returns 401 when unauthenticated (no user)', async () => {
    mockUnauthenticated()
    const req = makeRequest('PUT', 'http://localhost/api/admin/products/prod-1', VALID_PUT_BODY)
    const res = await productIdPUT(req, makeParams('prod-1'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when authenticated as non-admin', async () => {
    mockNonAdmin()
    const req = makeRequest('PUT', 'http://localhost/api/admin/products/prod-1', VALID_PUT_BODY)
    const res = await productIdPUT(req, makeParams('prod-1'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('proceeds past auth when admin — returns 200 on valid body', async () => {
    mockAdmin()
    ;(prisma.category.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'cat-1',
      slug: 'zapatillas',
      name: 'Zapatillas',
    })
    const existingProduct = { id: 'prod-1', brand: 'NIKE', images: [], ...VALID_PUT_BODY }
    ;(prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(existingProduct)
    ;(prisma.product.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...existingProduct,
      category: { id: 'cat-1', slug: 'zapatillas', name: 'Zapatillas' },
    })
    const req = makeRequest('PUT', 'http://localhost/api/admin/products/prod-1', VALID_PUT_BODY)
    const res = await productIdPUT(req, makeParams('prod-1'))
    expect(res.status).toBe(200)
  })
})

// ===========================================================================
// DELETE /api/admin/products/[id]
// ===========================================================================

describe('DELETE /api/admin/products/[id] — auth protection', () => {
  it('returns 401 when unauthenticated (no user)', async () => {
    mockUnauthenticated()
    const req = makeRequest('DELETE', 'http://localhost/api/admin/products/prod-1')
    const res = await productIdDELETE(req, makeParams('prod-1'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when authenticated as non-admin', async () => {
    mockNonAdmin()
    const req = makeRequest('DELETE', 'http://localhost/api/admin/products/prod-1')
    const res = await productIdDELETE(req, makeParams('prod-1'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('proceeds past auth when admin — returns 200 on valid product', async () => {
    mockAdmin()
    const product = { id: 'prod-1', images: [], brand: 'NIKE', name: 'Air Max 90' }
    ;(prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(product)
    ;(prisma.product.delete as ReturnType<typeof vi.fn>).mockResolvedValue(product)
    // getSiteConfig returns null for all keys → no cascade cleanup
    const { getSiteConfig } = await import('@/lib/queries/site-config')
    ;(getSiteConfig as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(upsertSiteConfig as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    const req = makeRequest('DELETE', 'http://localhost/api/admin/products/prod-1')
    const res = await productIdDELETE(req, makeParams('prod-1'))
    expect(res.status).toBe(200)
  })
})

// ===========================================================================
// PATCH /api/admin/orders/[id]
// ===========================================================================

describe('PATCH /api/admin/orders/[id] — auth protection', () => {
  const VALID_PATCH_BODY = { status: 'PROCESSING' }
  const EXISTING_ORDER = {
    id: 'order-1',
    status: 'PENDING',
    email: 'test@example.com',
    total: 15000,
    trackingNumber: null,
    items: [],
  }

  it('returns 401 when unauthenticated (no user)', async () => {
    mockUnauthenticated()
    const req = makeRequest('PATCH', 'http://localhost/api/admin/orders/order-1', VALID_PATCH_BODY)
    const res = await ordersPatch(req, makeParams('order-1'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when authenticated as non-admin', async () => {
    mockNonAdmin()
    const req = makeRequest('PATCH', 'http://localhost/api/admin/orders/order-1', VALID_PATCH_BODY)
    const res = await ordersPatch(req, makeParams('order-1'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('proceeds past auth when admin — returns 200 on valid order update', async () => {
    mockAdmin()
    ;(prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(EXISTING_ORDER)
    ;(prisma.order.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...EXISTING_ORDER,
      status: 'PROCESSING',
    })
    const req = makeRequest('PATCH', 'http://localhost/api/admin/orders/order-1', VALID_PATCH_BODY)
    const res = await ordersPatch(req, makeParams('order-1'))
    expect(res.status).toBe(200)
  })
})

// ===========================================================================
// GET /api/admin/site-config
// ===========================================================================

describe('GET /api/admin/site-config — auth protection', () => {
  it('returns 401 when unauthenticated (no user)', async () => {
    mockUnauthenticated()
    const res = await siteConfigGET()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when authenticated as non-admin', async () => {
    mockNonAdmin()
    const res = await siteConfigGET()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('proceeds past auth when admin — returns 200 with configs', async () => {
    mockAdmin()
    ;(getAllSiteConfigs as ReturnType<typeof vi.fn>).mockResolvedValue([])
    const res = await siteConfigGET()
    expect(res.status).toBe(200)
  })
})

// ===========================================================================
// PATCH /api/admin/site-config
// ===========================================================================

describe('PATCH /api/admin/site-config — auth protection', () => {
  const VALID_PATCH_BODY = {
    key: 'hero',
    value: { slides: [] },
  }

  it('returns 401 when unauthenticated (no user)', async () => {
    mockUnauthenticated()
    const req = makeRequest('PATCH', 'http://localhost/api/admin/site-config', VALID_PATCH_BODY)
    const res = await siteConfigPATCH(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when authenticated as non-admin', async () => {
    mockNonAdmin()
    const req = makeRequest('PATCH', 'http://localhost/api/admin/site-config', VALID_PATCH_BODY)
    const res = await siteConfigPATCH(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('proceeds past auth when admin — returns 200 on valid key/value', async () => {
    mockAdmin()
    ;(upsertSiteConfig as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    const req = makeRequest('PATCH', 'http://localhost/api/admin/site-config', VALID_PATCH_BODY)
    const res = await siteConfigPATCH(req)
    expect(res.status).toBe(200)
  })
})
