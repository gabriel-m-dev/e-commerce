import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upsertSiteConfig } from '@/lib/queries/site-config'

type Brand = 'NIKE' | 'JORDAN' | 'ADIDAS'

function configKeyForBrand(brand: Brand) {
  if (brand === 'NIKE') return 'newArrivalsNike' as const
  if (brand === 'JORDAN') return 'newArrivalsJordan' as const
  return 'newArrivalsAdidas' as const
}

async function getAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.app_metadata?.role === 'admin' ? user : null
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { brand, ids } = body as { brand?: Brand; ids?: string[] }

  if (!brand || !['NIKE', 'JORDAN', 'ADIDAS'].includes(brand)) {
    return NextResponse.json({ error: 'brand inválido' }, { status: 400 })
  }
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
    return NextResponse.json({ error: 'ids debe ser un array de strings' }, { status: 400 })
  }

  try {
    await upsertSiteConfig(configKeyForBrand(brand), { productIds: ids })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/admin/new-arrivals-order]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 503 })
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { brand } = body as { brand?: Brand }

  if (!brand || !['NIKE', 'JORDAN', 'ADIDAS'].includes(brand)) {
    return NextResponse.json({ error: 'brand inválido' }, { status: 400 })
  }

  try {
    await upsertSiteConfig(configKeyForBrand(brand), { productIds: [] })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/admin/new-arrivals-order]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 503 })
  }
}
