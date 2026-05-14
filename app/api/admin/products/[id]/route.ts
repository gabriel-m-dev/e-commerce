import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

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

  const { name, slug, price, comparePrice, categorySlug, images, description, stock, featured } =
    body as Record<string, unknown>

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

  try {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
    if (!category) {
      return NextResponse.json({ error: `Categoría '${categorySlug}' no encontrada` }, { status: 400 })
    }

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: Math.round(price),
        comparePrice: comparePrice != null ? Math.round(Number(comparePrice)) : null,
        images: images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0),
        categoryId: category.id,
        stock: Math.round(stock),
        featured: featured === true,
      },
      include: { category: true },
    })
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
