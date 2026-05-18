import type { Metadata } from 'next'
import Image from 'next/image'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { unstable_cache } from 'next/cache'
import { getProducts } from '@/lib/queries/products'
import ProductsWithFilters from '@/components/product/ProductsWithFilters'
import BrandBgImage from '@/components/product/BrandBgImage'
import BrandEditorialHeader from '@/components/product/BrandEditorialHeader'

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
  const getCachedProducts = unstable_cache(
    () => getProducts({ brand: brandFilter }),
    ['products', brandFilter ?? 'all'],
    { revalidate: 60, tags: ['products'] }
  )
  const products = await getCachedProducts()
  const isEditorialBrand = brandFilter === 'JORDAN' || brandFilter === 'NIKE' || brandFilter === 'ADIDAS'
  const isJordan = brandFilter === 'JORDAN'

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
      <section
        className={`relative ${
          isJordan
            ? 'overflow-x-clip overflow-y-visible bg-[#0a0a0a] text-white'
            : isEditorialBrand
              ? 'overflow-x-clip overflow-y-visible bg-[#f5f5f7]'
              : 'overflow-hidden bg-[#f5f5f7]'
        }`}
      >

        {/* Editorial watermark for brand pages */}
        {brandFilter === 'JORDAN' && (
          <div
            className="pointer-events-none select-none absolute right-[-16px] top-0 bottom-0 w-[80px] lg:w-[110px] overflow-hidden flex items-center justify-center"
            aria-hidden
          >
            <div
              style={{
                transform: 'rotate(-90deg)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '16px',
                whiteSpace: 'nowrap',
              }}
            >
              {/* Nike logo — dorado semitransparente, justo antes de la J */}
              <Image
                src="/nike_logo.webp"
                alt=""
                width={2400}
                height={2399}
                className="object-contain shrink-0"
                style={{
                  width: '52px',
                  height: 'auto',
                  filter: 'brightness(0) saturate(100%) invert(76%) sepia(28%) saturate(700%) hue-rotate(358deg)',
                }}
              />
              <span
                className="text-[80px] lg:text-[110px]"
                style={{
                  fontWeight: 900,
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(255,255,255,0.16)',
                  lineHeight: 1,
                  letterSpacing: '0.12em',
                  filter: 'blur(0.3px)',
                  display: 'block',
                }}
              >
                JORDAN
              </span>
            </div>
          </div>
        )}
        {brandFilter === 'NIKE' && (
          <div
            className="pointer-events-none select-none absolute right-[-16px] top-0 bottom-0 w-[80px] lg:w-[110px] overflow-hidden flex items-center justify-center"
            aria-hidden
          >
            <span
              className="text-[80px] lg:text-[110px]"
              style={{
                fontWeight: 900,
                color: 'transparent',
                WebkitTextStroke: '1px rgba(10,10,10,0.45)',
                lineHeight: 1,
                letterSpacing: '0.12em',
                filter: 'blur(0.3px)',
                display: 'block',
                transform: 'rotate(-90deg)',
              }}
            >
              NIKE
            </span>
          </div>
        )}
        {brandFilter === 'ADIDAS' && (
          <div
            className="pointer-events-none select-none absolute right-[-18px] top-0 bottom-0 w-[90px] lg:w-[120px] overflow-hidden flex items-center justify-center"
            aria-hidden
          >
            <span
              className="text-[74px] lg:text-[104px]"
              style={{
                fontWeight: 900,
                color: 'transparent',
                WebkitTextStroke: '1px rgba(10,10,10,0.45)',
                lineHeight: 1,
                letterSpacing: '0.12em',
                filter: 'blur(0.3px)',
                display: 'block',
                transform: 'rotate(-90deg)',
              }}
            >
              ADIDAS
            </span>
          </div>
        )}

        {/* Jordan sneaker image — top-right, flush to window edge, behind content */}
        {isJordan && (
          <div
            className="pointer-events-none select-none absolute right-0 top-0 w-[160px] h-[220px] max-[374px]:w-[120px] max-[374px]:h-[170px] sm:w-[200px] sm:h-[275px] md:w-[250px] md:h-[340px] lg:w-[310px] lg:h-[420px] z-[2] jordan-bg-img"
            aria-hidden
          >
            <Image
              src="/jordan_bg.webp"
              alt=""
              fill
              sizes="160px"
              className="object-contain object-right-top"
              priority
            />
          </div>
        )}

        {/* BrandBgImage — for NIKE / ADIDAS editorial pages */}
        {!isJordan && isEditorialBrand && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            {(brandFilter === 'NIKE' || brandFilter === 'ADIDAS') && (
              <BrandBgImage
                key={brandFilter}
                brand={brandFilter}
                objectPosition={brandFilter === 'NIKE' ? 'center top' : 'right top'}
              />
            )}
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-screen-xl px-6 py-16 lg:px-10">

          {isEditorialBrand && brandFilter ? (
            <BrandEditorialHeader key={brandFilter} brand={brandFilter as 'NIKE' | 'JORDAN' | 'ADIDAS'} theme={isJordan ? 'dark' : 'light'} />
          ) : (
            /* Section label — light / non-Jordan */
            <div className="mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                Todos los productos
              </p>
            </div>
          )}

          <div className={!isEditorialBrand && brandFilter ? 'lg:pr-[200px] xl:pr-[240px]' : ''}>
            <ProductsWithFilters
              products={products}
              initialCategory={category ?? 'Todo'}
              dark={isJordan}
              brand={brandFilter}
              editorialTheme={isEditorialBrand ? (isJordan ? 'dark' : 'light') : undefined}
            />
          </div>

        </div>
      </section>
    </main>
    </>
  )
}
