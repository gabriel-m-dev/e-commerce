import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { type DbProduct } from '@/lib/queries/products'
import FeaturedOrderManager from '@/components/admin/FeaturedOrderManager'

export const dynamic = 'force-dynamic'

async function getFeaturedForAdmin(): Promise<DbProduct[]> {
  try {
    const results = await prisma.product.findMany({
      where: { featured: true },
      include: {
        categories: {
          include: { category: true },
          orderBy: { isPrimary: 'desc' },
        },
      },
      orderBy: [{ featuredOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return results.map((p) => {
      const primaryCategory = p.categories[0]?.category
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
        category: primaryCategory?.name ?? '',
        categorySlug: primaryCategory?.slug ?? '',
        categorySlugs: p.categories.map((r) => r.category.slug),
        image: p.images[0] ?? '',
        images: p.images,
        description: p.description,
        featured: p.featured,
        featuredOrder: p.featuredOrder ?? null,
        active: p.active,
        stock: Number(p.stock),
        brand: p.brand,
        colors: p.colors ?? [],
        sizes: p.sizes ?? [],
        createdAt: p.createdAt.toISOString(),
      }
    })
  } catch {
    return []
  }
}

export default async function DestacadosSubPage() {
  const products = await getFeaturedForAdmin()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/personalizar" className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors">
          Personalizar web
        </Link>
        <span className="text-muted/40">/</span>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Orden de Destacados</h1>
      </div>

      <FeaturedOrderManager products={products} />
    </div>
  )
}
