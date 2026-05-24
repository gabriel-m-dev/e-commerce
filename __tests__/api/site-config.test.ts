import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: vi.fn().mockReturnValue([]), set: vi.fn() }),
}))

vi.mock('@/lib/queries/site-config', () => ({
  getAllSiteConfigs: vi.fn(),
  upsertSiteConfig: vi.fn(),
  getSiteConfig: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    storage: {
      from: vi.fn().mockReturnValue({
        remove: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  }),
}))

import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { getAllSiteConfigs, upsertSiteConfig, getSiteConfig } from '@/lib/queries/site-config'
import { GET, PATCH } from '@/app/api/admin/site-config/route'

function mockAnonAuth() {
  ;(createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  })
}

function mockAdminAuth() {
  ;(createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'admin@example.com', app_metadata: { role: 'admin' } } },
      }),
    },
  })
}

function mockNonAdminAuth() {
  ;(createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'user@example.com', app_metadata: {} } },
      }),
    },
  })
}

function makePatchRequest(body: unknown) {
  return new NextRequest('http://localhost/api/admin/site-config', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const makeGetRequest = () =>
  new NextRequest('http://localhost/api/admin/site-config', { method: 'GET' })

beforeEach(() => vi.clearAllMocks())

describe('GET /api/admin/site-config', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAnonAuth()
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when non-admin', async () => {
    mockNonAdminAuth()
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(401)
  })

  it('returns 200 with configs when admin', async () => {
    mockAdminAuth()
    ;(getAllSiteConfigs as ReturnType<typeof vi.fn>).mockResolvedValue([{ key: 'hero', value: {} }])
    const res = await GET(makeGetRequest())
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toEqual([{ key: 'hero', value: {} }])
  })

  it('returns 503 when getAllSiteConfigs throws', async () => {
    mockAdminAuth()
    ;(getAllSiteConfigs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'))
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(503)
  })
})

describe('PATCH /api/admin/site-config', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAnonAuth()
    const res = await PATCH(makePatchRequest({ key: 'hero', value: {} }))
    expect(res.status).toBe(401)
  })

  it('returns 401 when non-admin', async () => {
    mockNonAdminAuth()
    const res = await PATCH(makePatchRequest({ key: 'hero', value: {} }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when key is invalid', async () => {
    mockAdminAuth()
    const res = await PATCH(makePatchRequest({ key: 'INVALID_KEY', value: {} }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when key is missing', async () => {
    mockAdminAuth()
    const res = await PATCH(makePatchRequest({ value: {} }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when value is undefined', async () => {
    mockAdminAuth()
    const res = await PATCH(makePatchRequest({ key: 'hero' }))
    expect(res.status).toBe(400)
  })

  it('returns 200 and upserts when key and value are valid', async () => {
    mockAdminAuth()
    ;(upsertSiteConfig as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    const res = await PATCH(makePatchRequest({ key: 'hero', value: { imageUrl: 'https://example.com/img.jpg' } }))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toEqual({ ok: true })
    expect(upsertSiteConfig).toHaveBeenCalledWith('hero', { imageUrl: 'https://example.com/img.jpg' })
  })

  it('returns 503 when upsertSiteConfig throws', async () => {
    mockAdminAuth()
    ;(upsertSiteConfig as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'))
    const res = await PATCH(makePatchRequest({ key: 'hero', value: {} }))
    expect(res.status).toBe(503)
  })

  it('calls getSiteConfig for benefitCards key before upserting', async () => {
    mockAdminAuth()
    ;(getSiteConfig as ReturnType<typeof vi.fn>).mockResolvedValue({
      payment: { imageUrl: 'https://supabase.co/storage/v1/object/public/products/old.jpg' },
      shipping: null,
      security: null,
    })
    ;(upsertSiteConfig as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    const res = await PATCH(
      makePatchRequest({
        key: 'benefitCards',
        value: {
          payment: { imageUrl: 'https://supabase.co/storage/v1/object/public/products/new.jpg' },
          shipping: null,
          security: null,
        },
      })
    )
    expect(res.status).toBe(200)
    expect(getSiteConfig).toHaveBeenCalledWith('benefitCards')
  })
})
