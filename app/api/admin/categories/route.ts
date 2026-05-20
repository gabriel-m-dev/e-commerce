import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import type { CategoryGroup } from '@/lib/generated/prisma/client'

const VALID_GROUPS: CategoryGroup[] = ['ROPA', 'ACCESORIOS', 'NONE']

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

  const { name, group } = body as Record<string, unknown>
  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'El campo name es requerido' }, { status: 400 })
  }

  const resolvedGroup: CategoryGroup =
    typeof group === 'string' && VALID_GROUPS.includes(group as CategoryGroup)
      ? (group as CategoryGroup)
      : 'NONE'

  const slug = toSlug(name.trim())
  if (!slug) {
    return NextResponse.json({ error: 'El nombre no genera un slug válido' }, { status: 400 })
  }

  try {
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) {
      // Update group if provided
      const updated = await prisma.category.update({
        where: { slug },
        data: { group: resolvedGroup },
        select: { id: true, name: true, slug: true, group: true },
      })
      return NextResponse.json(updated, { status: 200 })
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug, group: resolvedGroup },
      select: { id: true, name: true, slug: true, group: true },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/categories]', err)
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

  const { id, group } = body as Record<string, unknown>
  if (typeof id !== 'string' || !id.trim()) {
    return NextResponse.json({ error: 'El campo id es requerido' }, { status: 400 })
  }
  if (typeof group !== 'string' || !VALID_GROUPS.includes(group as CategoryGroup)) {
    return NextResponse.json({ error: 'El campo group debe ser ROPA, ACCESORIOS o NONE' }, { status: 400 })
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { group: group as CategoryGroup },
      select: { id: true, name: true, slug: true, group: true },
    })
    return NextResponse.json(category, { status: 200 })
  } catch (err) {
    console.error('[PATCH /api/admin/categories]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 503 })
  }
}
