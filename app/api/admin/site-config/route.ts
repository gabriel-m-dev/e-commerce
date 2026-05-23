import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getAllSiteConfigs, upsertSiteConfig, getSiteConfig, type SiteConfigKey, type SiteConfigValues, type BenefitCardsConfig } from '@/lib/queries/site-config'

const STORAGE_BUCKET = 'products'

function extractStoragePath(url: string): string | null {
  const marker = `/object/public/${STORAGE_BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const path = url.slice(idx + marker.length)
  return path || null
}

async function deleteStorageImageIfOwned(oldUrl: string): Promise<void> {
  if (!oldUrl) return
  if (!oldUrl.includes('supabase')) return
  const filePath = extractStoragePath(oldUrl)
  if (!filePath) return
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.warn('[Storage] SUPABASE_SERVICE_ROLE_KEY not set — skipping old image deletion')
    return
  }
  try {
    const adminClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { persistSession: false } }
    )
    const { error } = await adminClient.storage.from(STORAGE_BUCKET).remove([filePath])
    if (error) console.error('[Storage] Failed to delete old image:', filePath, error.message)
  } catch (err) {
    console.error('[Storage] Unexpected error deleting old image:', err)
  }
}

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

  const VALID_KEYS: SiteConfigKey[] = ['hero', 'productFeature', 'categoryCards', 'jordanCategorySplit', 'nikeCategorySplit', 'adidasCategorySplit', 'nuestraSeleccion', 'brandSneakersNike', 'brandSneakersJordan', 'brandSneakersAdidas', 'benefitCards', 'announcementBar', 'jordanMasPedido', 'nikeMasPedido', 'adidasMasPedido', 'newArrivalsNike', 'newArrivalsJordan', 'newArrivalsAdidas', 'jordanHero', 'nikeHero', 'adidasHero']
  if (!key || !VALID_KEYS.includes(key) || value === undefined) {
    return NextResponse.json({ error: 'key o value inválido' }, { status: 400 })
  }

  // For benefitCards: delete replaced/removed images from Storage before saving
  if (key === 'benefitCards') {
    try {
      const existing = await getSiteConfig('benefitCards')
      if (existing) {
        const incoming = value as BenefitCardsConfig
        const slots = ['payment', 'shipping', 'security'] as const
        const toDelete: string[] = []
        for (const slot of slots) {
          const oldUrl = existing[slot]?.imageUrl
          const newUrl = incoming[slot]?.imageUrl
          if (oldUrl && oldUrl !== newUrl) toDelete.push(oldUrl)
        }
        await Promise.allSettled(toDelete.map(deleteStorageImageIfOwned))
      }
    } catch {
      // Non-blocking — proceed with save even if cleanup fails
    }
  }

  try {
    await upsertSiteConfig(key, value)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 503 })
  }
}
