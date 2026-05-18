import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { getProductBySlug, getProducts } from '@/lib/queries/products'

export const dynamic = 'force-dynamic'

import { formatPrice } from '@/lib/utils'
import ProductDetail from '@/components/product/ProductDetail'
import ArrowIcon from '@/components/ui/ArrowIcon'
import AddToCartButton from '@/components/product/AddToCartButton'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Producto no encontrado' }

  return {
    title: product.name,
    description: product.description,
    keywords: [product.name, product.category, 'comprar online', 'Argentina', 'LUXE'],
    openGraph: {
      title: `${product.name} — ${SITE_NAME}`,
      description: product.description,
      url: `/product/${product.slug}`,
      type: 'website',
      images: [{ url: product.images[0], alt: product.name, width: 900, height: 900 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ${SITE_NAME}`,
      description: product.description,
      images: [product.images[0]],
    },
    alternates: { canonical: `/product/${product.slug}` },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
  ])
  if (!product) notFound()

  const sameCategory = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const selectedIds = new Set([product.id, ...sameCategory.map((p) => p.id)])

  const fillProducts = allProducts
    .filter((p) => !selectedIds.has(p.id))
    .slice(0, 4 - sameCategory.length)

  const related = [...sameCategory, ...fillProducts]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.images,
            brand: { '@type': 'Brand', name: 'LUXE.' },
            offers: {
              '@type': 'Offer',
              price: product.price.toString(),
              priceCurrency: 'ARS',
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              seller: { '@type': 'Organization', name: 'LUXE.' },
              url: `${SITE_URL}/product/${product.slug}`,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITE_URL}/products` },
              { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}/product/${product.slug}` },
            ],
          }),
        }}
      />
      <main>

      {/* ── Breadcrumb ── */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-screen-xl items-center gap-2 px-6 py-3 lg:px-10">
          <Link
            href="/"
            className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
          >
            {SITE_NAME}
          </Link>
          <span className="text-[10px] text-border">/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
          >
            {product.category}
          </Link>
          <span className="text-[10px] text-border">/</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground">
            {product.name}
          </span>
        </div>
      </div>

      {/* ── Product detail ── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 pt-0 pb-12 lg:px-10 lg:py-16">
          <ProductDetail product={product} />
        </div>
      </section>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <section className="border-t border-border bg-background">
          <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">

            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-gold" aria-hidden />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                  También te puede gustar
                </h2>
              </div>
              <Link
                href={`/products?category=${product.category}`}
                className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-muted transition-colors hover:text-foreground md:flex"
              >
                Ver {product.category} <ArrowIcon className="shrink-0 text-gold" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
              {related.map((rel) => (
                <Link key={rel.id} href={`/product/${rel.slug}`} className="group">
                  <div className="relative aspect-square w-full overflow-hidden bg-surface">
                    <Image
                      src={rel.image}
                      alt={rel.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3.5 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                        {rel.category}
                      </p>
                      <h3 className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-foreground">
                        {rel.name}
                      </h3>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-sm font-semibold text-foreground">{formatPrice(rel.price)}</span>
                        {rel.comparePrice != null && rel.comparePrice > rel.price && (
                          <span className="text-xs font-normal text-muted line-through">{formatPrice(rel.comparePrice)}</span>
                        )}
                      </div>
                    </div>
                    <AddToCartButton
                      product={{
                        id: rel.id,
                        name: rel.name,
                        slug: rel.slug,
                        price: rel.price,
                        image: rel.image,
                        category: rel.category,
                        stock: rel.stock,
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>
      )}

    </main>
    </>
  )
}
