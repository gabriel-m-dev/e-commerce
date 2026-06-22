import { prisma } from '@/lib/prisma'
import { MOCK_PRODUCTS, type MockProduct } from '@/lib/data/products'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DbProduct = {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  /** Primary category name (e.g. "Zapatillas") — backward compat */
  category: string
  /** Primary category slug — backward compat */
  categorySlug: string
  /** All category names (primary first) */
  categorySlugs: string[]
  /** First image — used as the primary thumbnail */
  image: string
  images: string[]
  description: string
  featured: boolean
  featuredOrder: number | null
  active: boolean
  stock: number
  brand: string
  colors: string[]
  sizes: string[]
  createdAt: string
}

// ─── Prisma include shape (reused across all queries) ────────────────────────

const productInclude = {
  category: true,
  categories: {
    include: { category: true },
    orderBy: { isPrimary: 'desc' as const },
  },
} as const

// ─── Mappers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbProduct(p: any): DbProduct {
  // Primary category: first entry after orderBy isPrimary desc.
  // Fall back to the legacy category relation when join table rows are absent
  // (e.g. products created before the migration).
  const primaryRow = p.categories?.[0]
  const primaryCategory = primaryRow?.category ?? p.category

  return {
    id: p.id as string,
    name: p.name as string,
    slug: p.slug as string,
    price: Number(p.price),
    comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
    category: primaryCategory.name as string,
    categorySlug: primaryCategory.slug as string,
    categorySlugs: (p.categories ?? []).map(
      (r: { category: { slug: string } }) => r.category.slug
    ),
    image: (p.images as string[])[0] ?? '',
    images: p.images as string[],
    description: p.description as string,
    featured: p.featured as boolean,
    featuredOrder: p.featuredOrder != null ? Number(p.featuredOrder) : null,
    active: p.active as boolean,
    stock: Number(p.stock),
    brand: p.brand as string,
    colors: (p.colors as string[]) ?? [],
    sizes: (p.sizes as string[]) ?? [],
    createdAt: (p.createdAt as Date).toISOString(),
  }
}

function mockToDb(p: MockProduct): DbProduct {
  const mockCategorySlug = p.category.toLowerCase()
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    comparePrice: null,
    category: p.category,
    categorySlug: mockCategorySlug,
    categorySlugs: [mockCategorySlug],
    image: p.image,
    images: p.images,
    description: p.description,
    featured: p.featured ?? false,
    featuredOrder: null,
    stock: 99,
    brand: 'OTROS',
    colors: [],
    sizes: [],
    active: true,
    createdAt: new Date().toISOString(),
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getProducts(options?: {
  categorySlug?: string
  search?: string
  sort?: string
  brand?: string
}): Promise<DbProduct[]> {
  const { categorySlug, search, sort, brand } = options ?? {}

  const orderBy = (() => {
    if (sort === 'price_asc') return { price: 'asc' as const }
    if (sort === 'price_desc') return { price: 'desc' as const }
    return { createdAt: 'desc' as const }
  })()

  try {
    const results = await prisma.product.findMany({
      where: {
        active: true,
        ...(categorySlug
          ? { categories: { some: { category: { slug: categorySlug } } } }
          : {}),
        ...(search
          ? { name: { contains: search, mode: 'insensitive' as const } }
          : {}),
        ...(brand ? { brand: brand as import('../generated/prisma/client').Brand } : {}),
      },
      include: productInclude,
      orderBy,
    })
    return results.map(toDbProduct)
  } catch (e) {
    console.error('[getProducts] DB unavailable, using mock data:', e)
    return MOCK_PRODUCTS.map(mockToDb)
  }
}

export async function getFeaturedProducts(limit = 10): Promise<DbProduct[]> {
  try {
    const results = await prisma.product.findMany({
      where: { featured: true, active: true },
      include: productInclude,
      take: limit,
      orderBy: [{ featuredOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return results.map(toDbProduct)
  } catch (e) {
    console.error('[getFeaturedProducts] DB unavailable, using mock data:', e)
    return MOCK_PRODUCTS.filter(p => p.featured).map(mockToDb).slice(0, limit)
  }
}

export async function getProductBySlug(slug: string): Promise<DbProduct | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    })
    if (!product) return null
    return toDbProduct(product)
  } catch (e) {
    console.error('[getProductBySlug] DB unavailable, using mock data:', e)
    const mock = MOCK_PRODUCTS.find(p => p.slug === slug) ?? null
    return mock ? mockToDb(mock) : null
  }
}

export async function getSaleProducts(): Promise<DbProduct[]> {
  try {
    const results = await prisma.product.findMany({
      where: { active: true, comparePrice: { not: null } },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    })
    // Filter en JS porque Prisma no soporta comparación de dos campos nativamente
    return results.filter(p => p.comparePrice! > p.price).map(toDbProduct)
  } catch (e) {
    console.error('[getSaleProducts] DB unavailable:', e)
    return []
  }
}

export async function getNewProducts(limit = 20, brand?: string, customIds?: string[]): Promise<DbProduct[]> {
  if (customIds && customIds.length > 0) {
    try {
      const brandFilter = brand ? { brand: brand as import('../generated/prisma/client').Brand } : {}
      const results = await prisma.product.findMany({
        where: { id: { in: customIds }, active: true, ...brandFilter },
        include: productInclude,
      })
      const mapped = results.map(toDbProduct)
      return customIds.map((id) => mapped.find((p) => p.id === id)).filter(Boolean) as DbProduct[]
    } catch (e) {
      console.error('[getNewProducts] DB unavailable:', e)
      return []
    }
  }

  const since = new Date()
  since.setDate(since.getDate() - 30)
  const brandFilter = brand ? { brand: brand as import('../generated/prisma/client').Brand } : {}
  try {
    const results = await prisma.product.findMany({
      where: { active: true, createdAt: { gte: since }, ...brandFilter },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    if (results.length === 0) {
      const fallback = await prisma.product.findMany({
        where: { active: true, ...brandFilter },
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
      return fallback.map(toDbProduct)
    }
    return results.map(toDbProduct)
  } catch (e) {
    console.error('[getNewProducts] DB unavailable:', e)
    return []
  }
}

export async function getProductById(id: string): Promise<DbProduct | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id, active: true },
      include: productInclude,
    })
    if (!product) return null
    return toDbProduct(product)
  } catch (e) {
    console.error('[getProductById] DB unavailable:', e)
    return null
  }
}

export async function getProductsByIds(ids: string[]): Promise<DbProduct[]> {
  if (!ids.length) return []
  try {
    const results = await prisma.product.findMany({
      where: { id: { in: ids }, active: true },
      include: productInclude,
    })
    const map = new Map(results.map((p) => [p.id, toDbProduct(p)]))
    return ids.map((id) => map.get(id)).filter((p): p is DbProduct => p !== undefined)
  } catch (e) {
    console.error('[getProductsByIds] DB unavailable:', e)
    return []
  }
}

export async function getCategories(): Promise<{ id: string; name: string; slug: string; group: string }[]> {
  try {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, group: true },
    })
  } catch (e) {
    console.error('[getCategories] DB unavailable, using mock data:', e)
    return [
      { id: '1', name: 'Gorras',     slug: 'gorras',     group: 'ACCESORIOS' },
      { id: '2', name: 'Buzos',      slug: 'buzos',      group: 'ROPA'       },
      { id: '3', name: 'Mochilas',   slug: 'mochilas',   group: 'ACCESORIOS' },
      { id: '4', name: 'Pantalones', slug: 'pantalones', group: 'ROPA'       },
      { id: '5', name: 'Remeras',    slug: 'remeras',    group: 'ROPA'       },
      { id: '6', name: 'Zapatillas', slug: 'zapatillas', group: 'NONE'       },
    ]
  }
}
