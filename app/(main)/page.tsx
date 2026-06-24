import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { SITE_DESCRIPTION } from '@/lib/constants'
import { getProducts, getFeaturedProducts, getNewProducts, getProductById, getProductsByIds } from '@/lib/queries/products'
import { getSiteConfig } from '@/lib/queries/site-config'
import FeaturedProductsGrid from '@/components/product/FeaturedProductsGrid'
import ProductsWithFilters from '@/components/product/ProductsWithFilters'
import ProductFeature from '@/components/product/ProductFeature'
import NewArrivalsSection from '@/components/product/NewArrivalsSection'
import NuestraSeleccionSection from '@/components/product/NuestraSeleccionSection'
import BrandCarousel from '@/components/product/BrandCarousel'
import CategoryShowcase from '@/components/product/CategoryShowcase'
import ArrowIcon from '@/components/ui/ArrowIcon'
import HeroSection from '@/components/layout/HeroSection'
import ScrollReveal from '@/components/ui/ScrollReveal'
import BenefitCardsSection from '@/components/BenefitCardsSection'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'LUXE. — Moda Premium Argentina' },
  description: 'Descubrí la nueva colección LUXE. Zapatillas, buzos, remeras y accesorios de diseño premium. Envíos a todo el país.',
  openGraph: {
    title: 'LUXE. — Moda Premium Argentina',
    description: 'Descubrí la nueva colección LUXE. Zapatillas, buzos, remeras y accesorios de diseño premium.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LUXE. — Moda Premium Argentina',
    description: 'Descubrí la nueva colección LUXE. Diseño premium, calidad que se siente.',
  },
  alternates: { canonical: '/' },
}


export default async function HomePage() {
  const [featuredProducts, allProducts, newProducts, heroConfig, productFeatureConfig, categoryCardsConfig, nuestraSeleccionConfig] = await Promise.all([
    getFeaturedProducts(10),
    getProducts(),
    getNewProducts(4),
    getSiteConfig('hero'),
    getSiteConfig('productFeature'),
    getSiteConfig('categoryCards'),
    getSiteConfig('nuestraSeleccion'),
  ])

  const featureProduct = productFeatureConfig?.productId
    ? await getProductById(productFeatureConfig.productId)
    : null

  const nuestraSeleccionProducts = await getProductsByIds(nuestraSeleccionConfig?.productIds ?? [])

  return (
    <>
      {/* ─── Hero ─── */}
      <HeroSection slides={heroConfig?.slides} />

      <div className="h-24 bg-white" aria-hidden />

      {/* ─── Categorías ─── */}
      <ScrollReveal>
        <CategoryShowcase cards={categoryCardsConfig?.cards} />
      </ScrollReveal>

      <div className="h-2 bg-white" aria-hidden />

      {/* ─── Featured Products ─── */}
      <section className="bg-[#f5f5f7]">
        <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10">

          {/* Section header */}
          <ScrollReveal>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-px w-6 bg-gold" aria-hidden />
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">
                  CURATED SELECTION
                </span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-foreground leading-tight mt-3">
                PRODUCTOS DESTACADOS
              </h2>
              <p className="text-[11px] text-muted mt-1.5">
                Elegidos para elevar tu estilo, todos los días.
              </p>
              <Link
                href="/products"
                className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-muted transition-colors duration-150 hover:text-foreground md:flex mt-4"
              >
                Ver todos <ArrowIcon className="shrink-0 text-gold" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Product grid */}
          <ScrollReveal delay={180}>
            <FeaturedProductsGrid products={featuredProducts} />
          </ScrollReveal>

          {/* Mobile — view all */}
          <div className="mt-10 md:hidden">
            <Link
              href="/products"
              className="text-[11px] font-medium uppercase tracking-widest text-muted transition-colors hover:text-foreground"
            >
              Ver todos <ArrowIcon className="shrink-0 text-gold" />
            </Link>
          </div>

        </div>
      </section>

      {/* ─── Brand Callout ─── */}
      <section className="bg-foreground">
        <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10">
          <ScrollReveal>
          <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:justify-between">

            {/* Left — copy */}
            <div>
              <div className="mb-8 h-px w-8 bg-gold" aria-hidden />
              <h2 className="text-4xl font-black uppercase leading-tight tracking-tight text-background lg:text-5xl">
                No es solo<br />un producto.
              </h2>
              <p className="mt-3 text-3xl font-black italic text-gold lg:text-4xl">
                Es una experiencia.
              </p>
            </div>

            {/* Right — 3 value props */}
            <div className="flex flex-col gap-10 sm:flex-row sm:gap-16 lg:gap-14">
              <div className="flex flex-col items-center gap-4 text-center">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#c9a96e" strokeWidth="1.3" aria-hidden>
                  <path d="M17 3 31 14 17 31 3 14z" />
                  <path d="M3 14h28M17 3l-7 11M17 3l7 11M3 14l14 17M31 14L17 31" />
                </svg>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background">
                  Materiales<br />Premium
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 text-center">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#c9a96e" strokeWidth="1.3" aria-hidden>
                  <circle cx="17" cy="21" r="10" />
                  <path d="M12 10 9 4h16l-3 6" />
                  <path d="M17 16v5M14 21h6" />
                </svg>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background">
                  Diseño<br />Exclusivo
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 text-center">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#c9a96e" strokeWidth="1.3" aria-hidden>
                  <rect x="7" y="15" width="20" height="16" rx="1.5" />
                  <path d="M11 15v-4a6 6 0 0 1 12 0v4" />
                </svg>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background">
                  Compra<br />Segura
                </p>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Product Feature ─── */}
      <ScrollReveal>
        <ProductFeature product={featureProduct} />
      </ScrollReveal>

      <div className="h-2 bg-white" aria-hidden />

      {/* ─── Features Strip ─── */}
      <ScrollReveal>
        <BenefitCardsSection />
      </ScrollReveal>

      <div className="h-2 bg-white" aria-hidden />

      {/* ─── Brand Carousel ─── */}
      <ScrollReveal>
        <BrandCarousel />
      </ScrollReveal>

      <div className="h-2 bg-white" aria-hidden />

      {/* ─── Nuevos Ingresos ─── */}
      <ScrollReveal>
        <NewArrivalsSection products={newProducts} />
      </ScrollReveal>

      <div className="h-2 bg-white" aria-hidden />

      {/* ─── Nuestra Selección ─── */}
      <ScrollReveal>
        <NuestraSeleccionSection products={nuestraSeleccionProducts} />
      </ScrollReveal>

      <div className="h-2 bg-white" aria-hidden />

      {/* ─── Todos los Productos ─── */}
      <section className="bg-[#f5f5f7]">
        <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10">

          {/* Section header */}
          <ScrollReveal>
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-gold" aria-hidden />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                  Todos los Productos
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-muted transition-colors duration-150 hover:text-foreground md:flex"
              >
                Ver catálogo <ArrowIcon className="shrink-0 text-gold" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={180}>
            <ProductsWithFilters products={allProducts.slice(0, 12)} totalProducts={allProducts.length} />
          </ScrollReveal>

          <div className="flex justify-center mt-10">
            <Link
              href="/products"
              className="border border-foreground text-foreground px-8 py-3 text-sm uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors"
            >
              VER TODOS
            </Link>
          </div>

        </div>
      </section>

    </>
  )
}
