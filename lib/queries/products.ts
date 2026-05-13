import { prisma } from '@/lib/prisma'
import { MOCK_PRODUCTS, type MockProduct } from '@/lib/data/products'

function mockToDb(p: MockProduct): DbProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    category: p.category,
    categorySlug: p.category.toLowerCase(),
    image: p.image,
    images: p.images,
    description: p.description,
    featured: p.featured ?? false,
    stock: 99,
  }
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbProduct(p: any): DbProduct {
  return {
    id: p.id as string,
    name: p.name as string,
    slug: p.slug as string,
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

  try {
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
  } catch (e) {
    console.error('[getProducts] DB unavailable, using mock data:', e)
    return MOCK_PRODUCTS.map(mockToDb)
  }
}

export async function getFeaturedProducts(limit = 4): Promise<DbProduct[]> {
  try {
    const results = await prisma.product.findMany({
      where: { featured: true, active: true },
      include: { category: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
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
      include: { category: true },
    })
    if (!product) return null
    return toDbProduct(product)
  } catch (e) {
    console.error('[getProductBySlug] DB unavailable, using mock data:', e)
    const mock = MOCK_PRODUCTS.find(p => p.slug === slug) ?? null
    return mock ? mockToDb(mock) : null
  }
}

export async function getCategories(): Promise<{ id: string; name: string; slug: string }[]> {
  try {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    })
  } catch (e) {
    console.error('[getCategories] DB unavailable, using mock data:', e)
    return [
      { id: '1', name: 'Gorras',     slug: 'gorras'     },
      { id: '2', name: 'Hoodies',    slug: 'hoodies'    },
      { id: '3', name: 'Mochilas',   slug: 'mochilas'   },
      { id: '4', name: 'Pantalones', slug: 'pantalones' },
      { id: '5', name: 'Remeras',    slug: 'remeras'    },
      { id: '6', name: 'Zapatillas', slug: 'zapatillas' },
    ]
  }
}
