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
  const { name, slug, price, comparePrice, categorySlug, images, description, stock, featured, brand, active, colors } = body as Record<string, unknown>

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof slug !== 'string' || !slug.trim() ||
    typeof price !== 'number' || price <= 0 ||
    typeof categorySlug !== 'string' || !categorySlug.trim() ||
    !Array.isArray(images) || images.length === 0 ||
    typeof description !== 'string' || !description.trim() ||
    typeof stock !== 'number' || stock < 0
  ) {
    return NextResponse.json({ error: 'Faltan campos requeridos o son inválidos' }, { status: 400 })
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

  try {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
    if (!category) {
      return NextResponse.json({ error: `Categoría '${categorySlug}' no encontrada` }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: Math.round(price),
        comparePrice: comparePrice != null ? Math.round(Number(comparePrice)) : null,
        images: images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0),
        colors: normalizedColors,
        categoryId: category.id,
        stock: Math.round(stock),
        featured: featured === true,
        active: active !== false,
        brand: (brand as string | undefined) ? (brand as string) as import('@/lib/generated/prisma/client').Brand : 'OTROS',
      },
      include: { category: true },
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
