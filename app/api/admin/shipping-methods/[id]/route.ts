import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateShippingMethod, deleteShippingMethod } from '@/lib/queries/shipping-methods'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
  if (user.app_metadata?.role !== 'admin') return { error: 'Forbidden', status: 403 }
  return { user }
}

/** PUT /api/admin/shipping-methods/[id] — partial update (name, formula fields, active) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { name, active, description, baseWeightKg, baseCostUsd, additionalCostPerKgUsd, additionalUnitKg } =
    body as Record<string, unknown>
  const updates: Partial<{
    name: string
    description: string | null
    baseWeightKg: number
    baseCostUsd: number
    additionalCostPerKgUsd: number
    additionalUnitKg: number
    active: boolean
  }> = {}

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'El campo name no puede estar vacío' }, { status: 400 })
    }
    updates.name = name.trim()
  }

  if (baseWeightKg !== undefined) {
    const parsed = parseFloat(String(baseWeightKg))
    if (isNaN(parsed) || parsed < 0) {
      return NextResponse.json({ error: 'baseWeightKg debe ser un número mayor o igual a 0' }, { status: 400 })
    }
    updates.baseWeightKg = parsed
  }

  if (baseCostUsd !== undefined) {
    const parsed = parseFloat(String(baseCostUsd))
    if (isNaN(parsed) || parsed <= 0) {
      return NextResponse.json({ error: 'baseCostUsd debe ser un número mayor a 0' }, { status: 400 })
    }
    updates.baseCostUsd = parsed
  }

  if (additionalCostPerKgUsd !== undefined) {
    const parsed = parseFloat(String(additionalCostPerKgUsd))
    if (isNaN(parsed) || parsed < 0) {
      return NextResponse.json({ error: 'additionalCostPerKgUsd debe ser un número mayor o igual a 0' }, { status: 400 })
    }
    updates.additionalCostPerKgUsd = parsed
  }

  if (additionalUnitKg !== undefined) {
    const parsed = parseFloat(String(additionalUnitKg))
    if (isNaN(parsed) || parsed <= 0) {
      return NextResponse.json({ error: 'additionalUnitKg debe ser un número mayor a 0' }, { status: 400 })
    }
    updates.additionalUnitKg = parsed
  }

  if (active !== undefined) {
    if (typeof active !== 'boolean') {
      return NextResponse.json({ error: 'El campo active debe ser boolean' }, { status: 400 })
    }
    updates.active = active
  }

  if (description !== undefined) {
    updates.description = typeof description === 'string' ? description.trim() || null : null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No se enviaron campos para actualizar' }, { status: 400 })
  }

  try {
    const method = await updateShippingMethod(id, updates)
    return NextResponse.json(method)
  } catch (err) {
    console.error('[PUT /api/admin/shipping-methods/[id]]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/** DELETE /api/admin/shipping-methods/[id] — hard-delete if no orders, soft-delete otherwise */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params

  try {
    const result = await deleteShippingMethod(id)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[DELETE /api/admin/shipping-methods/[id]]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
