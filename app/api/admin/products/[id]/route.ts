import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getSiteConfig, upsertSiteConfig } from '@/lib/queries/site-config'

const STORAGE_BUCKET = 'products'

function extractStoragePath(url: string): string | null {
  // Public URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
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
    if (error) {
      console.error('[Storage] Failed to delete old image:', filePath, error.message)
    }
  } catch (err) {
    console.error('[Storage] Unexpected error deleting old image:', err)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, slug, price, comparePrice, categorySlugs, primaryCategorySlug, images, description, stock, featured, brand, active, colors, sizes } =
    body as Record<string, unknown>

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof slug !== 'string' || !slug.trim() ||
    typeof price !== 'number' || price <= 0 ||
    !Array.isArray(categorySlugs) || categorySlugs.length === 0 ||
    !Array.isArray(images) || images.length === 0 ||
    typeof description !== 'string' || !description.trim() ||
    typeof stock !== 'number' || stock < 0
  ) {
    return NextResponse.json({ error: 'Faltan campos requeridos o son inválidos' }, { status: 400 })
  }

  // Resolve primary: explicit or default to first element when only one category
  const resolvedPrimarySlug: string =
    typeof primaryCategorySlug === 'string' && primaryCategorySlug.trim()
      ? primaryCategorySlug.trim()
      : (categorySlugs as string[]).length === 1
        ? (categorySlugs as string[])[0]
        : ''

  if (!resolvedPrimarySlug || !(categorySlugs as string[]).includes(resolvedPrimarySlug)) {
    return NextResponse.json({ error: 'primaryCategorySlug debe estar incluido en categorySlugs' }, { status: 400 })
  }

  const VALID_BRANDS = ['NIKE', 'JORDAN', 'ADIDAS', 'OTROS']
  if (brand !== undefined && !VALID_BRANDS.includes(brand as string)) {
    return NextResponse.json({ error: 'Marca inválida' }, { status: 400 })
  }

  const HEX_RE = /^#[0-9A-Fa-f]{6}$/
  let normalizedColors: string[] = []
  if (colors !== undefined) {
    if (!Array.isArray(colors) || !colors.every((c) => typeof c === 'string' && HEX_RE.test(c))) {
      return NextResponse.json(
        { error: 'colors debe ser un array de hex codes válidos (#RRGGBB)' },
        { status: 400 }
      )
    }
    normalizedColors = (colors as string[]).map((c) => c.toUpperCase())
  }

  let normalizedSizes: string[] = []
  if (sizes !== undefined) {
    if (!Array.isArray(sizes) || !sizes.every((s) => typeof s === 'string')) {
      return NextResponse.json({ error: 'sizes debe ser un array de strings' }, { status: 400 })
    }
    normalizedSizes = (sizes as string[]).map((s) => s.toUpperCase())
  }

  try {
    const slugsArr = categorySlugs as string[]
    const foundCategories = await prisma.category.findMany({ where: { slug: { in: slugsArr } } })
    if (foundCategories.length !== slugsArr.length) {
      const foundSlugs = foundCategories.map((c) => c.slug)
      const missing = slugsArr.filter((s) => !foundSlugs.includes(s))
      return NextResponse.json({ error: `Categorías no encontradas: ${missing.join(', ')}` }, { status: 400 })
    }
    const primaryCategory = foundCategories.find((c) => c.slug === resolvedPrimarySlug)!

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    // Best-effort: delete removed images from Storage (does not block update on failure)
    const newImages = (images as string[]).filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
    const removedImages = existing.images.filter((old) => !newImages.includes(old))
    await Promise.allSettled(
      removedImages.map((oldUrl) => deleteStorageImageIfOwned(oldUrl))
    )

    // Replace M2M categories: deleteMany then re-create
    await prisma.productCategory.deleteMany({ where: { productId: id } })

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: Math.round(price),
        comparePrice: comparePrice != null ? Math.round(Number(comparePrice)) : null,
        images: images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0),
        colors: normalizedColors,
        sizes: normalizedSizes,
        stock: Math.round(stock),
        featured: featured === true,
        active: active !== false,
        brand: (brand as string | undefined) ? (brand as string) as import('@/lib/generated/prisma/client').Brand : 'OTROS',
        categories: {
          create: foundCategories.map((c) => ({
            categoryId: c.id,
            isPrimary: c.slug === resolvedPrimarySlug,
          })),
        },
      },
      include: { categories: { include: { category: true }, orderBy: { isPrimary: 'desc' as const } } },
    })

    // If brand changed, remove product ID from old brand's sneakersConfig, newArrivals, and masPedido
    const oldBrand = existing.brand as string | null
    const newBrand = (brand as string | undefined) ?? 'OTROS'
    if (oldBrand && oldBrand !== newBrand) {
      const oldSneakersKey =
        oldBrand === 'NIKE' ? 'brandSneakersNike' as const
        : oldBrand === 'JORDAN' ? 'brandSneakersJordan' as const
        : oldBrand === 'ADIDAS' ? 'brandSneakersAdidas' as const
        : null
      if (oldSneakersKey) {
        try {
          const oldConfig = await getSiteConfig(oldSneakersKey)
          if (oldConfig?.productIds?.includes(id)) {
            await upsertSiteConfig(oldSneakersKey, {
              ...oldConfig,
              productIds: oldConfig.productIds.filter((pid) => pid !== id),
            })
          }
        } catch (err) {
          console.error('[PUT /api/admin/products/[id]] sneakersConfig cleanup failed', err)
        }
      }

      const oldNewArrivalsKey =
        oldBrand === 'NIKE' ? 'newArrivalsNike' as const
        : oldBrand === 'JORDAN' ? 'newArrivalsJordan' as const
        : oldBrand === 'ADIDAS' ? 'newArrivalsAdidas' as const
        : null
      if (oldNewArrivalsKey) {
        try {
          const oldConfig = await getSiteConfig(oldNewArrivalsKey)
          if (oldConfig?.productIds?.includes(id)) {
            await upsertSiteConfig(oldNewArrivalsKey, {
              ...oldConfig,
              productIds: oldConfig.productIds.filter((pid) => pid !== id),
            })
          }
        } catch (err) {
          console.error('[PUT /api/admin/products/[id]] newArrivals cleanup failed', err)
        }
      }

      const oldMasPedidoKey =
        oldBrand === 'NIKE' ? 'nikeMasPedido' as const
        : oldBrand === 'JORDAN' ? 'jordanMasPedido' as const
        : oldBrand === 'ADIDAS' ? 'adidasMasPedido' as const
        : null
      if (oldMasPedidoKey) {
        try {
          const oldConfig = await getSiteConfig(oldMasPedidoKey)
          if (oldConfig?.productId === id) {
            await upsertSiteConfig(oldMasPedidoKey, { ...oldConfig, productId: '' })
          }
        } catch (err) {
          console.error('[PUT /api/admin/products/[id]] masPedido cleanup failed', err)
        }
      }
    }

    return NextResponse.json({ product }, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Ya existe un producto con ese slug' }, { status: 400 })
    }
    console.error('[PUT /api/admin/products/[id]]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 503 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    await prisma.product.delete({ where: { id } })

    // Best-effort: clean up all site-config references to this product
    try {
      const arrayKeys = [
        'nuestraSeleccion',
        'brandSneakersNike', 'brandSneakersJordan', 'brandSneakersAdidas',
        'newArrivalsNike', 'newArrivalsJordan', 'newArrivalsAdidas',
      ] as const
      const singleKeys = [
        'jordanMasPedido', 'nikeMasPedido', 'adidasMasPedido',
        'productFeature',
      ] as const

      for (const key of arrayKeys) {
        const cfg = await getSiteConfig(key)
        if (cfg?.productIds?.includes(id)) {
          await upsertSiteConfig(key, {
            ...cfg,
            productIds: cfg.productIds.filter((pid) => pid !== id),
          })
        }
      }
      for (const key of singleKeys) {
        const cfg = await getSiteConfig(key)
        if (cfg?.productId === id) {
          await upsertSiteConfig(key, { ...cfg, productId: "" })
        }
      }
    } catch (err) {
      console.error('[DELETE /api/admin/products/[id]] site-config cleanup failed', err)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'No se puede eliminar un producto con órdenes asociadas' },
        { status: 400 }
      )
    }
    console.error('[DELETE /api/admin/products/[id]]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 503 })
  }
}
