import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // 1. Auth: verificar sesión Supabase
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parsear body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 3. Validar campos requeridos
  const { name, slug, price, comparePrice, categorySlugs, primaryCategorySlug, images, description, stock, featured, brand, active, colors, sizes, shippingMethodId } = body as Record<string, unknown>

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

    const product = await prisma.product.create({
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
        shippingMethodId: (typeof shippingMethodId === 'string' && shippingMethodId) ? shippingMethodId : null,
        categories: {
          create: foundCategories.map((c) => ({
            categoryId: c.id,
            isPrimary: c.slug === resolvedPrimarySlug,
          })),
        },
      },
      include: { categories: { include: { category: true }, orderBy: { isPrimary: 'desc' as const } } },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Ya existe un producto con ese slug' }, { status: 400 })
    }
    console.error('[POST /api/admin/products]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 503 })
  }
}
