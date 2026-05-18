import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

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

  const { ids, reset } = body as { ids?: string[]; reset?: boolean }

  try {
    if (reset) {
      await prisma.product.updateMany({
        where: { featured: true },
        data: { featuredOrder: null },
      })
      return NextResponse.json({ ok: true })
    }

    if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'ids debe ser un array de strings' }, { status: 400 })
    }

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.product.update({
          where: { id },
          data: { featuredOrder: index },
        })
      )
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/admin/featured-order]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 503 })
  }
}
