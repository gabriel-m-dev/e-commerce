import { prisma } from '@/lib/prisma'
import { type DbProduct } from '@/lib/queries/products'
import FeaturedOrderManager from '@/components/admin/FeaturedOrderManager'

export const dynamic = 'force-dynamic'

async function getFeaturedForAdmin(): Promise<DbProduct[]> {
  try {
    const results = await prisma.product.findMany({
      where: { featured: true },
      include: { category: true },
      orderBy: [{ featuredOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return results.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
      category: p.category.name,
      categorySlug: p.category.slug,
      image: p.images[0] ?? '',
      images: p.images,
      description: p.description,
      featured: p.featured,
      featuredOrder: p.featuredOrder ?? null,
      active: p.active,
      stock: Number(p.stock),
      brand: p.brand,
      colors: p.colors ?? [],
      createdAt: p.createdAt.toISOString(),
    }))
  } catch {
    return []
  }
}

export default async function DestacadosPage() {
  const products = await getFeaturedForAdmin()

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Destacados</h1>
        <p className="text-[11px] text-muted uppercase tracking-[0.15em]">
          {products.length} producto{products.length !== 1 ? 's' : ''} destacado{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      <FeaturedOrderManager products={products} />
    </div>
  )
}
