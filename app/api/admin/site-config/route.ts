import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllSiteConfigs, upsertSiteConfig, type SiteConfigKey, type SiteConfigValues } from '@/lib/queries/site-config'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const configs = await getAllSiteConfigs()
    return NextResponse.json(configs)
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 503 })
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { key, value } = body as { key: SiteConfigKey; value: SiteConfigValues[SiteConfigKey] }

  const VALID_KEYS: SiteConfigKey[] = ['hero', 'productFeature', 'categoryCards', 'jordanCategorySplit', 'nikeCategorySplit', 'adidasCategorySplit', 'nuestraSeleccion']
  if (!key || !VALID_KEYS.includes(key) || value === undefined) {
    return NextResponse.json({ error: 'key o value inválido' }, { status: 400 })
  }

  try {
    await upsertSiteConfig(key, value)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 503 })
  }
}
