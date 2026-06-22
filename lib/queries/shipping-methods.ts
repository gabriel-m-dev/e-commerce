import { prisma } from '@/lib/prisma'

export type ShippingMethodRow = {
  id: string
  name: string
  price: number
  active: boolean
  createdAt: Date
}

/** All shipping methods, ordered by price ASC (admin use) */
export async function getAllShippingMethods(): Promise<ShippingMethodRow[]> {
  return prisma.shippingMethod.findMany({
    orderBy: { price: 'asc' },
    select: { id: true, name: true, price: true, active: true, createdAt: true },
  })
}

/** Active shipping methods only, ordered by price ASC (public checkout use) */
export async function getActiveShippingMethods(): Promise<ShippingMethodRow[]> {
  return prisma.shippingMethod.findMany({
    where: { active: true },
    orderBy: { price: 'asc' },
    select: { id: true, name: true, price: true, active: true, createdAt: true },
  })
}

/** Single shipping method by id */
export async function getShippingMethodById(
  id: string
): Promise<ShippingMethodRow | null> {
  return prisma.shippingMethod.findUnique({
    where: { id },
    select: { id: true, name: true, price: true, active: true, createdAt: true },
  })
}

/** Create a new shipping method */
export async function createShippingMethod(data: {
  name: string
  price: number
}): Promise<ShippingMethodRow> {
  return prisma.shippingMethod.create({
    data: { name: data.name, price: data.price },
    select: { id: true, name: true, price: true, active: true, createdAt: true },
  })
}

/** Update an existing shipping method (partial) */
export async function updateShippingMethod(
  id: string,
  data: Partial<{ name: string; price: number; active: boolean }>
): Promise<ShippingMethodRow> {
  return prisma.shippingMethod.update({
    where: { id },
    data,
    select: { id: true, name: true, price: true, active: true, createdAt: true },
  })
}

/**
 * Delete strategy:
 * - Hard-delete when no Orders reference the method
 * - Soft-delete (active=false) when at least one Order references it
 */
export async function deleteShippingMethod(
  id: string
): Promise<{ deleted: true } | { softDeleted: true }> {
  const orderCount = await prisma.order.count({
    where: { shippingMethodId: id },
  })

  if (orderCount > 0) {
    await prisma.shippingMethod.update({
      where: { id },
      data: { active: false },
    })
    return { softDeleted: true }
  }

  await prisma.shippingMethod.delete({ where: { id } })
  return { deleted: true }
}
