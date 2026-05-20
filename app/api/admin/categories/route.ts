import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: NextRequest) {
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

  const { name } = body as Record<string, unknown>
  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'El campo name es requerido' }, { status: 400 })
  }

  const slug = toSlug(name.trim())
  if (!slug) {
    return NextResponse.json({ error: 'El nombre no genera un slug válido' }, { status: 400 })
  }

  try {
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ id: existing.id, name: existing.name, slug: existing.slug }, { status: 200 })
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug },
      select: { id: true, name: true, slug: true },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/categories]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 503 })
  }
}
