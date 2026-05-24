/**
 * Tests for checkout flow API routes:
 *  - POST /api/checkout/create-preference
 *  - POST /api/webhook/mercadopago
 *  - PATCH /api/admin/orders/[id]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createHmac } from 'crypto'

// ---------------------------------------------------------------------------
// Mocks — declared before dynamic imports so vi.mock hoists correctly
// ---------------------------------------------------------------------------

// Mock Prisma singleton
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock next/headers (required by @/lib/supabase/server at module load time)
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

// Mock mercadopago — Preference and Payment are used as `new Preference(mp)` / `new Payment(mp)`
// vi.fn() alone is not a constructor; we need class syntax so `new` works.
const mockPreferenceCreate = vi.fn()
const mockPaymentGet = vi.fn()

vi.mock('mercadopago', () => {
  class MockMercadoPagoConfig {}
  class MockPreference {
    create = mockPreferenceCreate
  }
  class MockPayment {
    get = mockPaymentGet
  }
  return {
    MercadoPagoConfig: MockMercadoPagoConfig,
    Preference: MockPreference,
    Payment: MockPayment,
  }
})

// Mock @/lib/mercadopago (re-exports mp singleton + Preference)
vi.mock('@/lib/mercadopago', () => {
  class MockPreference {
    create = mockPreferenceCreate
  }
  return {
    mp: {},
    Preference: MockPreference,
  }
})

// Mock email sending (resend-based lib)
vi.mock('@/lib/email', () => ({
  sendOrderConfirmedEmail: vi.fn().mockResolvedValue(undefined),
  sendOrderCancelledEmail: vi.fn().mockResolvedValue(undefined),
  sendOrderShippedEmail: vi.fn().mockResolvedValue(undefined),
}))

// Mock ratelimit — always return null limiters (disabled) so tests skip rate limiting
vi.mock('@/lib/ratelimit', () => ({
  checkoutLimiter: null,
  webhookLimiter: null,
}))

// ---------------------------------------------------------------------------
// Imports (after vi.mock declarations)
// ---------------------------------------------------------------------------

import { prisma } from '@/lib/prisma'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { sendOrderConfirmedEmail, sendOrderCancelledEmail, sendOrderShippedEmail } from '@/lib/email'
import { POST as createPreferencePost } from '@/app/api/checkout/create-preference/route'
import { POST as webhookPost } from '@/app/api/webhook/mercadopago/route'
import { PATCH as adminOrderPatch } from '@/app/api/admin/orders/[id]/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WEBHOOK_SECRET = 'test-webhook-secret'
const ORDER_ID = 'order-abc-123'
const PRODUCT_ID = 'prod-001'

/** Build a minimal CartItem for the request body */
function makeCartItem(overrides: Record<string, unknown> = {}) {
  return {
    product: {
      id: PRODUCT_ID,
      name: 'Air Max 90',
      slug: 'air-max-90',
      price: 15000,
      image: 'https://example.com/img.jpg',
      category: 'Zapatillas',
      stock: 10,
    },
    quantity: 1,
    size: '42',
    ...overrides,
  }
}

/** Build the buyer fixture */
function makeBuyer() {
  return {
    email: 'test@example.com',
    fullName: 'Juan Perez',
    phone: '1122334455',
  }
}

/** Build the shipping fixture */
function makeShipping() {
  return {
    address: 'Av Corrientes 1234',
    city: 'CABA',
    province: 'Buenos Aires',
    postalCode: '1043',
  }
}

/** Wire Supabase mock to return an unauthenticated session (no user) */
function mockAnonAuth() {
  ;(createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  })
}

/** Wire Supabase mock to return a regular (non-admin) authenticated user */
function mockAuthUser(id = 'user-123', email = 'test@example.com') {
  ;(createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id, email, app_metadata: {}, user_metadata: { name: 'Juan Perez' } } },
      }),
    },
  })
}

/** Wire Supabase mock to return an admin user */
function mockAdminAuth() {
  ;(createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'admin@example.com', app_metadata: { role: 'admin' } } },
      }),
    },
  })
}

/** Build a NextRequest for the create-preference endpoint */
function makeCreatePreferenceRequest(body: unknown) {
  return new NextRequest('http://localhost/api/checkout/create-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** Build a valid HMAC signature header for the webhook */
function makeWebhookSignature(paymentId: string, requestId: string, ts: string): string {
  const template = `id:${paymentId};request-id:${requestId};ts:${ts};`
  const hmac = createHmac('sha256', WEBHOOK_SECRET).update(template).digest('hex')
  return `ts=${ts},v1=${hmac}`
}

/** Build a NextRequest for the mercadopago webhook */
function makeWebhookRequest(
  body: unknown,
  signatureHeader: string,
  paymentId = '999',
  requestId = 'req-001'
) {
  const url = `http://localhost/api/webhook/mercadopago?data.id=${paymentId}`
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': signatureHeader,
      'x-request-id': requestId,
    },
    body: JSON.stringify(body),
  })
}

/** Build a NextRequest for the admin PATCH endpoint */
function makeAdminPatchRequest(body: unknown) {
  return new NextRequest(`http://localhost/api/admin/orders/${ORDER_ID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** Route params wrapper for the admin handler */
function makeParams(id = ORDER_ID) {
  return { params: Promise.resolve({ id }) }
}

// ---------------------------------------------------------------------------
// beforeEach — reset all mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  // Set the webhook secret env var for every test
  process.env.MERCADOPAGO_WEBHOOK_SECRET = WEBHOOK_SECRET
})

// ===========================================================================
// POST /api/checkout/create-preference
// ===========================================================================

describe('POST /api/checkout/create-preference', () => {
  it('returns 400 when product has insufficient stock', async () => {
    mockAnonAuth()

    // Product exists but stock is 0
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: PRODUCT_ID, price: 15000, stock: 0, active: true },
    ])

    const req = makeCreatePreferenceRequest({
      items: [makeCartItem({ quantity: 1 })],
      buyer: makeBuyer(),
      shipping: makeShipping(),
    })

    const res = await createPreferencePost(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toMatch(/stock insuficiente/i)
  })

  it('creates order in DB and returns preferenceId when cart is valid', async () => {
    mockAnonAuth()

    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: PRODUCT_ID, price: 15000, stock: 10, active: true },
    ])

    const createdOrder = { id: ORDER_ID }
    ;(prisma.order.create as ReturnType<typeof vi.fn>).mockResolvedValue(createdOrder)

    mockPreferenceCreate.mockResolvedValue({
      id: 'pref-abc',
      init_point: 'https://mp.com/checkout/pref-abc',
    })

    const req = makeCreatePreferenceRequest({
      items: [makeCartItem()],
      buyer: makeBuyer(),
      shipping: makeShipping(),
    })

    const res = await createPreferencePost(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.preferenceId).toBe('pref-abc')
    expect(json.orderId).toBe(ORDER_ID)

    // Order must have been persisted with PENDING status and correct item
    const orderCreateCall = (prisma.order.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(orderCreateCall.data.status).toBe('PENDING')
    expect(orderCreateCall.data.email).toBe('test@example.com')
    expect(orderCreateCall.data.items.create[0].productId).toBe(PRODUCT_ID)
    expect(orderCreateCall.data.items.create[0].quantity).toBe(1)
  })

  it('returns 500 when order creation throws', async () => {
    mockAnonAuth()

    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: PRODUCT_ID, price: 15000, stock: 10, active: true },
    ])

    // Simulate a DB failure mid-create
    ;(prisma.order.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('DB connection lost')
    )

    const req = makeCreatePreferenceRequest({
      items: [makeCartItem()],
      buyer: makeBuyer(),
      shipping: makeShipping(),
    })

    const res = await createPreferencePost(req)

    expect(res.status).toBe(500)
  })

  it('returns 400 when product is inactive', async () => {
    mockAnonAuth()
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: PRODUCT_ID, price: 15000, stock: 10, active: false },
    ])
    const req = makeCreatePreferenceRequest({
      items: [makeCartItem()],
      buyer: makeBuyer(),
      shipping: makeShipping(),
    })
    const res = await createPreferencePost(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when product does not exist in DB', async () => {
    mockAnonAuth()
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])
    const req = makeCreatePreferenceRequest({
      items: [makeCartItem()],
      buyer: makeBuyer(),
      shipping: makeShipping(),
    })
    const res = await createPreferencePost(req)
    expect(res.status).toBe(400)
  })

  it('ignores client-sent price and uses DB price for order total', async () => {
    mockAnonAuth()
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: PRODUCT_ID, price: 15000, stock: 10, active: true },
    ])
    ;(prisma.order.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: ORDER_ID })
    mockPreferenceCreate.mockResolvedValue({ id: 'pref-x', init_point: 'https://mp.com/pref-x' })

    // Client tries to send price: 1 — should be ignored
    const itemWithFakePrice = makeCartItem()
    ;(itemWithFakePrice as Record<string, unknown>).product = {
      ...itemWithFakePrice.product,
      price: 1,
    }

    const req = makeCreatePreferenceRequest({
      items: [itemWithFakePrice],
      buyer: makeBuyer(),
      shipping: makeShipping(),
    })
    const res = await createPreferencePost(req)

    expect(res.status).toBe(200)
    const orderCreateCall = (prisma.order.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    // Order item price must use DB price (15000), not client price (1)
    expect(orderCreateCall.data.items.create[0].price).toBe(15000)
    expect(Number(orderCreateCall.data.total)).toBe(15000)
  })

  it('returns 400 when quantity is zero', async () => {
    mockAnonAuth()
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: PRODUCT_ID, price: 15000, stock: 10, active: true },
    ])
    const req = makeCreatePreferenceRequest({
      items: [makeCartItem({ quantity: 0 })],
      buyer: makeBuyer(),
      shipping: makeShipping(),
    })
    const res = await createPreferencePost(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when quantity is negative', async () => {
    mockAnonAuth()
    ;(prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: PRODUCT_ID, price: 15000, stock: 10, active: true },
    ])
    const req = makeCreatePreferenceRequest({
      items: [makeCartItem({ quantity: -5 })],
      buyer: makeBuyer(),
      shipping: makeShipping(),
    })
    const res = await createPreferencePost(req)
    expect(res.status).toBe(400)
  })
})

// ===========================================================================
// POST /api/webhook/mercadopago
// ===========================================================================

describe('POST /api/webhook/mercadopago', () => {
  it('returns 401 when HMAC signature is invalid', async () => {
    const body = { type: 'payment', data: { id: '999' } }

    // timingSafeEqual requires equal-length buffers, so send a wrong but 64-char hex HMAC
    // (a SHA-256 hex digest is always 64 chars)
    const wrongV1 = 'a'.repeat(64)
    const req = makeWebhookRequest(body, `ts=12345,v1=${wrongV1}`)

    const res = await webhookPost(req)
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toBe('Invalid signature')
  })

  it('sets order to PROCESSING and decrements stock when payment is approved', async () => {
    const paymentId = '777'
    const requestId = 'req-approved'
    const ts = String(Date.now())
    const sig = makeWebhookSignature(paymentId, requestId, ts)

    const body = { type: 'payment', data: { id: paymentId } }

    mockPaymentGet.mockResolvedValue({
      status: 'approved',
      external_reference: ORDER_ID,
    })

    const pendingOrder = {
      id: ORDER_ID,
      email: 'test@example.com',
      status: 'PENDING',
      total: 15000,
      items: [{ productId: PRODUCT_ID, quantity: 2, name: 'Air Max 90', price: 15000, size: '42' }],
    }
    ;(prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(pendingOrder)

    // $transaction resolves with array (order update result is first element)
    ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([
      { ...pendingOrder, status: 'PROCESSING' },
    ])

    const req = makeWebhookRequest(body, sig, paymentId, requestId)
    const res = await webhookPost(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.received).toBe(true)

    // $transaction must have been called
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)

    // Verify the first arg to $transaction contains an order.update call with PROCESSING
    const transactionArgs = (prisma.$transaction as ReturnType<typeof vi.fn>).mock.calls[0][0]
    // transactionArgs is an array of Prisma promises — we check via the order.update mock
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ORDER_ID },
        data: { status: 'PROCESSING' },
      })
    )

    // product.updateMany must have been called for the stock decrement
    expect(prisma.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: PRODUCT_ID, stock: { gte: 2 } },
        data: { stock: { decrement: 2 } },
      })
    )

    // Confirmation email must have been sent
    expect(sendOrderConfirmedEmail).toHaveBeenCalledTimes(1)
    expect(sendOrderConfirmedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: ORDER_ID })
    )
  })

  it('skips DB update when order is already PROCESSING (idempotency)', async () => {
    const paymentId = '778'
    const requestId = 'req-idem'
    const ts = String(Date.now())
    const sig = makeWebhookSignature(paymentId, requestId, ts)

    const body = { type: 'payment', data: { id: paymentId } }

    mockPaymentGet.mockResolvedValue({
      status: 'approved',
      external_reference: ORDER_ID,
    })

    // Order is already PROCESSING — has already been handled
    ;(prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ORDER_ID,
      email: 'test@example.com',
      status: 'PROCESSING',
      total: 15000,
      items: [{ productId: PRODUCT_ID, quantity: 2, name: 'Air Max 90', price: 15000, size: '42' }],
    })

    const req = makeWebhookRequest(body, sig, paymentId, requestId)
    const res = await webhookPost(req)

    expect(res.status).toBe(200)

    // No DB mutation should happen — order.update and $transaction must NOT be called
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(prisma.order.update).not.toHaveBeenCalled()
    expect(sendOrderConfirmedEmail).not.toHaveBeenCalled()
  })

  it('sets order to CANCELLED when payment is rejected', async () => {
    const paymentId = '779'
    const requestId = 'req-rejected'
    const ts = String(Date.now())
    const sig = makeWebhookSignature(paymentId, requestId, ts)

    const body = { type: 'payment', data: { id: paymentId } }

    mockPaymentGet.mockResolvedValue({
      status: 'rejected',
      external_reference: ORDER_ID,
    })

    const pendingOrder = {
      id: ORDER_ID,
      email: 'test@example.com',
      status: 'PENDING',
      total: 15000,
      items: [{ productId: PRODUCT_ID, quantity: 1, name: 'Air Max 90', price: 15000, size: null }],
    }
    ;(prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(pendingOrder)
    ;(prisma.order.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...pendingOrder,
      status: 'CANCELLED',
    })

    const req = makeWebhookRequest(body, sig, paymentId, requestId)
    const res = await webhookPost(req)

    expect(res.status).toBe(200)

    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ORDER_ID },
        data: { status: 'CANCELLED' },
      })
    )

    // No stock decrement — stock was never decremented for a rejected payment
    expect(prisma.$transaction).not.toHaveBeenCalled()

    // Cancellation email must have been sent
    expect(sendOrderCancelledEmail).toHaveBeenCalledTimes(1)
  })
})

// ===========================================================================
// PATCH /api/admin/orders/[id]
// ===========================================================================

describe('PATCH /api/admin/orders/[id]', () => {
  beforeEach(() => {
    mockAdminAuth()
  })

  it('restores stock when cancelling a PROCESSING order', async () => {
    const currentOrder = {
      id: ORDER_ID,
      email: 'test@example.com',
      status: 'PROCESSING',
      total: 20000,
      items: [{ productId: PRODUCT_ID, quantity: 2, name: 'Air Max 90', price: 10000, size: '42' }],
    }
    ;(prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(currentOrder)

    const updatedOrder = { ...currentOrder, status: 'CANCELLED' }
    // $transaction resolves with array — first element is the updated order
    ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([updatedOrder])

    const req = makeAdminPatchRequest({ status: 'CANCELLED' })
    const res = await adminOrderPatch(req, makeParams())

    expect(res.status).toBe(200)

    // $transaction must have been called (order update + stock restore in same tx)
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)

    // product.update must have been called with stock increment
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: PRODUCT_ID },
        data: { stock: { increment: 2 } },
      })
    )

    // order.update must have been called with CANCELLED
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ORDER_ID },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      })
    )
  })

  it('does NOT restore stock when updating a PROCESSING order to SHIPPED', async () => {
    const currentOrder = {
      id: ORDER_ID,
      email: 'test@example.com',
      status: 'PROCESSING',
      total: 20000,
      items: [{ productId: PRODUCT_ID, quantity: 2, name: 'Air Max 90', price: 10000, size: '42' }],
    }
    ;(prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(currentOrder)

    const updatedOrder = { ...currentOrder, status: 'SHIPPED' }
    ;(prisma.order.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedOrder)

    const req = makeAdminPatchRequest({ status: 'SHIPPED' })
    const res = await adminOrderPatch(req, makeParams())

    expect(res.status).toBe(200)

    // No $transaction — stock must NOT be touched
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(prisma.product.update).not.toHaveBeenCalled()
    expect(prisma.product.updateMany).not.toHaveBeenCalled()

    // Shipping email must have been triggered
    expect(sendOrderShippedEmail).toHaveBeenCalledTimes(1)
  })
})
