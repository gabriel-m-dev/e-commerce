import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CartItem } from '@/store/cart'
import { createClient } from '@/lib/supabase/server'
import { checkoutLimiter } from '@/lib/ratelimit'
import { computeShippingCost, resolveFormula } from '@/lib/utils/shipping'
import { sendTransferInstructionsEmail } from '@/lib/email'

type Buyer = {
  email: string
  fullName: string
  phone: string
}

type ShippingData = {
  address: string
  city: string
  province: string
  postalCode: string
}

type ShippingGroupPayload = {
  supplier: string | null
  shippingMethodId: string
}

type RequestBody = {
  items: CartItem[]
  buyer: Buyer
  shipping: ShippingData
  // Multi-group format
  shippingGroups?: ShippingGroupPayload[]
  // Legacy single-method format (backward compat)
  shippingMethodId?: string
}

export async function POST(request: NextRequest) {
  if (checkoutLimiter) {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await checkoutLimiter.limit(ip)
    if (!success) {
      return Response.json({ error: 'Demasiadas solicitudes. Intentá en unos minutos.' }, { status: 429 })
    }
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const { items, buyer, shipping, shippingGroups, shippingMethodId } = body

  // Task 2.2 — validate required fields
  if (!items || items.length === 0) {
    return Response.json({ error: 'El carrito está vacío' }, { status: 400 })
  }

  if (!buyer?.email || !buyer?.fullName) {
    return Response.json({ error: 'Datos del comprador incompletos' }, { status: 400 })
  }

  if (!shipping?.address || !shipping?.city || !shipping?.province || !shipping?.postalCode) {
    return Response.json({ error: 'Datos de envío incompletos' }, { status: 400 })
  }

  // Normalize shipping groups — same pattern as create-preference
  let normalizedGroups: ShippingGroupPayload[]
  if (Array.isArray(shippingGroups) && shippingGroups.length > 0) {
    for (const g of shippingGroups) {
      if (!g.shippingMethodId || typeof g.shippingMethodId !== 'string') {
        return Response.json({ error: 'Seleccioná un método de envío para cada grupo de productos.' }, { status: 400 })
      }
    }
    normalizedGroups = shippingGroups
  } else if (shippingMethodId && typeof shippingMethodId === 'string') {
    normalizedGroups = [{ supplier: null, shippingMethodId }]
  } else {
    return Response.json({ error: 'Seleccioná un método de envío' }, { status: 400 })
  }

  // Check if user is authenticated — link order to account if so
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let linkedUserId: string | null = null
  if (authUser) {
    await prisma.user.upsert({
      where: { id: authUser.id },
      create: {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name ?? null,
      },
      update: {},
    })
    linkedUserId = authUser.id
  }

  try {
    // Validate all products exist in DB
    const productIds = [...new Set(items.map((item) => item.product.id))]
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, stock: true, active: true, weightKg: true, supplier: true },
    })

    if (dbProducts.length !== productIds.length) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 400 })
    }

    // Validate each item: active, positive quantity, sufficient stock
    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.product.id)!
      if (!dbProduct.active) {
        return Response.json({ error: `El producto "${item.product.name}" no está disponible.` }, { status: 400 })
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return Response.json(
          { error: `Cantidad inválida para "${item.product.name}".` },
          { status: 400 }
        )
      }
      if (dbProduct.stock < item.quantity) {
        return Response.json(
          { error: `Stock insuficiente para "${item.product.name}". Disponible: ${dbProduct.stock}.` },
          { status: 400 }
        )
      }
    }

    // Compute subtotal using DB prices (never trust client prices)
    const priceMap = new Map(dbProducts.map((p) => [p.id, p.price]))
    const subtotal = items.reduce(
      (sum, item) => sum + (priceMap.get(item.product.id) as number) * item.quantity,
      0
    )

    // 6% discount — stored as integer ARS cents, floor arithmetic
    const discount = Math.floor(subtotal * 0.06)

    // Server-side shipping cost per group
    const uniqueMethodIds = [...new Set(normalizedGroups.map((g) => g.shippingMethodId))]
    const dbShippingMethods = await prisma.shippingMethod.findMany({
      where: { id: { in: uniqueMethodIds } },
      select: {
        id: true,
        name: true,
        active: true,
        baseWeightKg: true,
        baseCostUsd: true,
        additionalCostPerKgUsd: true,
        additionalUnitKg: true,
      },
    })
    const methodMap = new Map(dbShippingMethods.map((m) => [m.id, m]))

    // Group items by supplier for weight computation (mirrors checkout grouping)
    const dbProductMap = new Map(dbProducts.map((p) => [p.id, p]))
    const dbSupplierMap = new Map(dbProducts.map((p) => [p.id, p.supplier]))
    const itemsBySupplier = new Map<string, CartItem[]>()
    for (const item of items) {
      const key = item.product.supplier ?? '__null__'
      if (!itemsBySupplier.has(key)) itemsBySupplier.set(key, [])
      itemsBySupplier.get(key)!.push(item)
    }

    const perGroupCosts: number[] = []
    const shippingBreakdown: Array<{ supplier: string | null; shippingMethodId: string; shippingMethodName: string; cost: number }> = []

    for (const group of normalizedGroups) {
      const method = methodMap.get(group.shippingMethodId)
      if (!method || !method.active) {
        return Response.json({ error: 'Método de envío no disponible' }, { status: 400 })
      }

      const groupKey = group.supplier ?? '__null__'
      const groupItems = itemsBySupplier.get(groupKey) ?? items
      const groupWeightKg = groupItems.reduce(
        (sum, item) => sum + (dbProductMap.get(item.product.id)?.weightKg ?? 0) * item.quantity,
        0
      )
      const dbSupplier = dbSupplierMap.get(groupItems[0]?.product.id) ?? null
      const formula = resolveFormula(method, dbSupplier)
      const groupCost = computeShippingCost(formula, groupWeightKg)
      perGroupCosts.push(groupCost)
      shippingBreakdown.push({
        supplier: group.supplier,
        shippingMethodId: group.shippingMethodId,
        shippingMethodName: method.name,
        cost: groupCost,
      })
    }

    const totalShipping = perGroupCosts.reduce((sum, c) => sum + c, 0)

    // total = (subtotal - discount) + shipping
    const total = (subtotal - discount) + totalShipping

    // Generate order ID upfront
    const orderId = crypto.randomUUID()
    const ref = orderId.slice(0, 8).toUpperCase()

    // Persist transfer order — status PENDING_TRANSFER, no stock decrement
    await prisma.order.create({
      data: {
        id: orderId,
        userId: linkedUserId,
        email: buyer.email,
        status: 'PENDING_TRANSFER',
        paymentMethod: 'transfer',
        subtotal,
        discount,
        shipping: totalShipping,
        total,
        shippingMethodId: normalizedGroups[0].shippingMethodId,
        shippingBreakdown,
        items: {
          create: items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: priceMap.get(item.product.id) as number, // original price — discount is order-level
            quantity: item.quantity,
            size: item.size ?? null,
            color: item.color ?? null,
          })),
        },
        address: {
          create: {
            name: buyer.fullName,
            phone: buyer.phone || null,
            street: shipping.address,
            city: shipping.city,
            state: shipping.province,
            zipCode: shipping.postalCode,
            country: 'Argentina',
          },
        },
      },
    })

    // Send instructions email — fire-and-forget (non-fatal)
    sendTransferInstructionsEmail({
      to: buyer.email,
      orderId,
      total,
      cbu: process.env.TRANSFER_CBU ?? '',
      alias: process.env.TRANSFER_ALIAS ?? '',
    }).catch((err) => console.error('[create-transfer-order] instructions email failed:', err))

    return Response.json({ orderId, ref })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[create-transfer-order] error:', msg)
    return Response.json(
      { error: 'Error al crear la orden de transferencia', detail: msg },
      { status: 500 }
    )
  }
}
