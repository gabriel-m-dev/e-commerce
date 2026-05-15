import type { Metadata } from 'next'
import Image from 'next/image'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { getProducts } from '@/lib/queries/products'
import ProductsWithFilters from '@/components/product/ProductsWithFilters'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Explorá toda la colección LUXE. Zapatillas, hoodies, remeras, pantalones, gorras y mochilas premium. Filtros por categoría y búsqueda instantánea.',
  openGraph: {
    title: `Tienda — ${SITE_NAME}`,
    description: 'Toda la colección LUXE. en un solo lugar. Diseño premium, calidad que se siente.',
    url: '/products',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Tienda — ${SITE_NAME}`,
    description: 'Toda la colección LUXE. Diseño premium, calidad que se siente.',
  },
  alternates: { canonical: '/products' },
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string }>
}) {
  const { category, brand } = await searchParams
  const brandFilter = brand ? brand.toUpperCase() : undefined
  const products = await getProducts({ brand: brandFilter })

  const BRAND_LABELS: Record<string, string> = {
    NIKE: 'Nike',
    JORDAN: 'Jordan',
    ADIDAS: 'Adidas',
  }
  const sectionLabel = brandFilter && BRAND_LABELS[brandFilter]
    ? BRAND_LABELS[brandFilter]
    : 'Todos los productos'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITE_URL}/products` },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Tienda ${SITE_NAME}`,
            description: 'Catálogo completo de productos LUXE.',
            numberOfItems: products.length,
            itemListElement: products.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Product',
                name: p.name,
                url: `${SITE_URL}/product/${p.slug}`,
                image: p.image,
                offers: {
                  '@type': 'Offer',
                  price: p.price.toString(),
                  priceCurrency: 'ARS',
                  availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                },
              },
            })),
          }),
        }}
      />
      <main>
      <section className="relative overflow-hidden bg-background">

        {/* Nike bg — desktop only, positioned right */}
        {brandFilter === 'NIKE' && (
          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[320px] xl:w-[400px] lg:block" aria-hidden>
            <Image
              src="/nike_bg.png"
              alt=""
              fill
              sizes="400px"
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-screen-xl px-6 py-16 lg:px-10">

          {/* Section label */}
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              {sectionLabel}
            </p>
          </div>

          <ProductsWithFilters
            products={products}
            initialCategory={category ?? 'Todo'}
          />

        </div>
      </section>
    </main>
    </>
  )
}
