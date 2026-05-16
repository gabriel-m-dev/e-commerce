import type { Metadata } from 'next'
import Image from 'next/image'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { getProducts } from '@/lib/queries/products'
import ProductsWithFilters from '@/components/product/ProductsWithFilters'
import BrandBgImage from '@/components/product/BrandBgImage'
import BrandTagline from '@/components/product/BrandTagline'

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
  const BRAND_LOGOS: Record<string, { src: string; width: number; height: number }> = {
    NIKE:   { src: '/nike_logo.png',   width: 62, height: 31 },
    JORDAN: { src: '/jordan_logo.png', width: 51, height: 51 },
    ADIDAS: { src: '/adidas_logo.png', width: 60, height: 36 },
  }
  const sectionLabel = brandFilter && BRAND_LABELS[brandFilter]
    ? BRAND_LABELS[brandFilter]
    : 'Todos los productos'
  const brandLogo = brandFilter ? BRAND_LOGOS[brandFilter] : null

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
      <section className="relative bg-background overflow-hidden">

        {/* Jordan editorial watermark — first in DOM = behind bg image */}
        {/* wrapper width = font-size → visual right edge lands flush at right-0 */}
        {brandFilter === 'JORDAN' && (
          <div
            className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-[80px] lg:w-[110px] overflow-hidden flex items-center justify-center"
            aria-hidden
          >
            <span
              className="text-[80px] lg:text-[110px]"
              style={{
                fontWeight: 900,
                color: 'transparent',
                WebkitTextStroke: '1.5px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
                lineHeight: 1,
                letterSpacing: '0.12em',
                filter: 'blur(0.3px)',
                transform: 'rotate(-90deg)',
                display: 'block',
              }}
            >
              JORDAN
            </span>
          </div>
        )}

        {/* BrandBgImage — second in DOM = above watermark */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {(brandFilter === 'NIKE' || brandFilter === 'JORDAN' || brandFilter === 'ADIDAS') && (
            <BrandBgImage
              key={brandFilter}
              brand={brandFilter}
              objectPosition={brandFilter === 'NIKE' ? 'center top' : 'right top'}
            />
          )}
        </div>

        <div className="relative z-10 mx-auto max-w-screen-xl px-6 py-16 lg:px-10">

          {/* Section label */}
          <div className="mb-10">
            {/* Row 1: logo + name. Desktop adds gold line before. */}
            <div className="flex items-center gap-4">
              <div className={brandLogo ? 'hidden md:block h-px w-8 bg-gold' : 'h-px w-8 bg-gold'} aria-hidden />
              {brandLogo && (
                <Image
                  src={brandLogo.src}
                  alt={sectionLabel}
                  width={brandLogo.width}
                  height={brandLogo.height}
                  className="object-contain"
                />
              )}
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                {sectionLabel}
              </p>
              {/* Tagline inline — desktop only */}
              {(brandFilter === 'NIKE' || brandFilter === 'JORDAN' || brandFilter === 'ADIDAS') && (
                <span className="hidden md:flex">
                  <BrandTagline key={brandFilter} brand={brandFilter} />
                </span>
              )}
            </div>

            {/* Row 2: gold line + large tagline — mobile only */}
            {(brandFilter === 'NIKE' || brandFilter === 'JORDAN' || brandFilter === 'ADIDAS') && (
              <div className="flex items-center gap-3 mt-3 md:hidden">
                <div className="h-px w-8 bg-gold shrink-0" aria-hidden />
                <BrandTagline key={`${brandFilter}-lg`} brand={brandFilter} large />
              </div>
            )}
          </div>

          <div className={brandFilter ? 'lg:pr-[200px] xl:pr-[240px]' : ''}>
            <ProductsWithFilters
              products={products}
              initialCategory={category ?? 'Todo'}
            />
          </div>

        </div>
      </section>
    </main>
    </>
  )
}
