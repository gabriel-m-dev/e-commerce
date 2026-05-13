import { prisma } from '@/lib/prisma'

// Flat product shape used by all components — mirrors MockProduct
// but sourced from the real database.
export type DbProduct = {
  id: string
  name: string
  slug: string
  price: number
  /** Category name as a plain string (e.g. "Zapatillas") */
  category: string
  categorySlug: string
  /** First image — used as the primary thumbnail */
  image: string
  images: string[]
  description: string
  featured: boolean
  stock: number
}

// ─── Internal mapper ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbProduct(p: any): DbProduct {
  return {
    id: p.id as string,
    name: p.name as string,
    slug: p.slug as string,
    // Prisma 7 returns Int fields as Decimal at the type level — coerce to number
    price: Number(p.price),
    category: p.category.name as string,
    categorySlug: p.category.slug as string,
    image: (p.images as string[])[0] ?? '',
    images: p.images as string[],
    description: p.description as string,
    featured: p.featured as boolean,
    stock: Number(p.stock),
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getProducts(options?: {
  categorySlug?: string
  search?: string
  sort?: string
}): Promise<DbProduct[]> {
  const { categorySlug, search, sort } = options ?? {}

  const orderBy = (() => {
    if (sort === 'price_asc') return { price: 'asc' as const }
    if (sort === 'price_desc') return { price: 'desc' as const }
    return { createdAt: 'desc' as const }
  })()

  const results = await prisma.product.findMany({
    where: {
      active: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(search
        ? { name: { contains: search, mode: 'insensitive' as const } }
        : {}),
    },
    include: { category: true },
    orderBy,
  })

  return results.map(toDbProduct)
}

export async function getFeaturedProducts(limit = 4): Promise<DbProduct[]> {
  const results = await prisma.product.findMany({
    where: { featured: true, active: true },
    include: { category: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })

  return results.map(toDbProduct)
}

export async function getProductBySlug(slug: string): Promise<DbProduct | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!product) return null
  return toDbProduct(product)
}

export async function getCategories(): Promise<{ id: string; name: string; slug: string }[]> {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })
}
