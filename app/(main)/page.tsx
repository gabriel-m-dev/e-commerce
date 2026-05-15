import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { SITE_DESCRIPTION } from '@/lib/constants'
import { getProducts, getFeaturedProducts, getNewProducts } from '@/lib/queries/products'
import FeaturedProductsGrid from '@/components/product/FeaturedProductsGrid'
import ProductsWithFilters from '@/components/product/ProductsWithFilters'
import ProductFeature from '@/components/product/ProductFeature'
import NewArrivalsSection from '@/components/product/NewArrivalsSection'
import ArrowIcon from '@/components/ui/ArrowIcon'
import HeroSection from '@/components/layout/HeroSection'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'LUXE. — Moda Premium Argentina' },
  description: 'Descubrí la nueva colección LUXE. Zapatillas, hoodies, remeras y accesorios de diseño premium. Envíos a todo el país.',
  openGraph: {
    title: 'LUXE. — Moda Premium Argentina',
    description: 'Descubrí la nueva colección LUXE. Zapatillas, hoodies, remeras y accesorios de diseño premium.',
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
  const [featuredProducts, allProducts, newProducts] = await Promise.all([
    getFeaturedProducts(4),
    getProducts(),
    getNewProducts(4),
  ])

  return (
    <>
      {/* ─── Hero ─── */}
      <HeroSection />

      {/* ─── Featured Products ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10">

          {/* Section header */}
          <div>
            <div className="flex items-center gap-2">
              <div className="h-px w-6 bg-gold" aria-hidden />
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">
                CURATED SELECTION
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground leading-tight mt-3">
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

          {/* Product grid */}
          <FeaturedProductsGrid products={featuredProducts} />

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
        </div>
      </section>

      {/* ─── Product Feature ─── */}
      <ProductFeature />

      {/* ─── Features Strip ─── */}
      <section className="bg-surface">
        <div className="mx-auto max-w-screen-xl px-6 py-14 lg:px-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">

            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-foreground" aria-hidden>
                <rect x="2" y="7" width="28" height="18" rx="2" />
                <path d="M2 13h28M7 19h5M7 22h3" />
              </svg>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">Pagá como quieras</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted">Tarjetas, transferencia o efectivo. Con Mercado Pago.</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-foreground" aria-hidden>
                <rect x="1" y="11" width="18" height="13" rx="1" />
                <path d="M19 15h5l5 5v5h-10V15z" />
                <circle cx="7" cy="26" r="2" />
                <circle cx="24" cy="26" r="2" />
              </svg>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">Envíos a todo el país</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted">Recibí tu pedido en la puerta de tu casa.</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-foreground" aria-hidden>
                <path d="M16 2 4 7v10c0 7.2 5.4 12 12 13 6.6-1 12-5.8 12-13V7L16 2z" />
              </svg>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">Compra segura</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted">Tus datos están protegidos en todo momento.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Nuevos Ingresos ─── */}
      <NewArrivalsSection products={newProducts} />

      {/* ─── Todos los Productos ─── */}
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10">

          {/* Section header */}
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

          <ProductsWithFilters products={allProducts} />

          {/* Bottom CTA */}
          <div className="mt-14 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 border border-foreground px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Ver catálogo completo <ArrowIcon className="shrink-0 text-gold" />
            </Link>
          </div>

        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        className="relative h-[90px] overflow-hidden lg:h-[115px]"
        style={{ background: '#e3d9e2' }}
      >
        {/* Mochila — decorativa, desborda hacia la derecha */}
        <div
          className="absolute z-0 h-[170%] w-40 lg:w-56"
          style={{ right: '-60px', top: '50%', transform: 'translateY(-50%)' }}
          aria-hidden
        >
          <Image
            src="https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&auto=format&fit=crop&q=80"
            alt=""
            fill
            sizes="(max-width: 1024px) 160px, 224px"
            className="object-cover object-center"
          />
        </div>

        {/* Contenido */}
        <div className="relative z-10 flex h-full flex-col items-start justify-center gap-3 pl-6 pr-[45%] sm:items-center sm:pl-0 sm:pr-0">
          <h2 className="text-left text-[11px] font-medium uppercase tracking-[0.18em] text-foreground sm:text-center sm:text-[13px] lg:text-base">
            Listo para comprar sin complicaciones.
          </h2>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 bg-foreground px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-80"
          >
            Ver productos <ArrowIcon className="shrink-0 text-gold" size={14} />
          </Link>
        </div>
      </section>

      {/* ─── Categorías ─── */}
      <section className="flex flex-col lg:flex-row" style={{ minHeight: '92vh' }} aria-label="Explorar por categoría">

        {/* Zapatillas */}
        <Link href="/products?category=Zapatillas" className="group relative flex-1 overflow-hidden" style={{ minHeight: '260px' }}>
          <Image
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85"
            alt="Zapatillas"
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/45 transition-colors duration-500 group-hover:bg-foreground/60" />
          <div className="absolute right-0 top-0 hidden h-full w-px bg-background/15 lg:block" />
          <div className="absolute bottom-0 left-8 lg:left-10 h-0 w-px bg-gold transition-all duration-700 ease-out group-hover:h-24" />
          <span className="absolute left-8 top-8 lg:left-10 lg:top-10 text-[10px] font-medium tabular-nums text-background/40">01</span>
          <div className="absolute bottom-8 left-8 right-8 lg:bottom-10 lg:left-10 lg:right-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Nueva colección</p>
            <h2 className="mt-2 font-black uppercase leading-none tracking-tight text-background transition-transform duration-500 group-hover:-translate-y-1" style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)' }}>
              Zapatillas
            </h2>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-background/50 group-hover:text-background/70 transition-colors duration-300">5 modelos</p>
            <p className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-background/0 group-hover:text-background/90 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
              Ver colección <ArrowIcon className="shrink-0 text-gold transition-transform duration-300 group-hover:translate-x-1" />
            </p>
          </div>
        </Link>

        {/* Ropa */}
        <Link href="/products?category=Hoodies" className="group relative flex-1 overflow-hidden" style={{ minHeight: '260px' }}>
          <Image
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=85"
            alt="Ropa"
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/45 transition-colors duration-500 group-hover:bg-foreground/60" />
          <div className="absolute right-0 top-0 hidden h-full w-px bg-background/15 lg:block" />
          <div className="absolute bottom-0 left-8 lg:left-10 h-0 w-px bg-gold transition-all duration-700 ease-out group-hover:h-24" />
          <span className="absolute left-8 top-8 lg:left-10 lg:top-10 text-[10px] font-medium tabular-nums text-background/40">02</span>
          <div className="absolute bottom-8 left-8 right-8 lg:bottom-10 lg:left-10 lg:right-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Temporada actual</p>
            <h2 className="mt-2 font-black uppercase leading-none tracking-tight text-background transition-transform duration-500 group-hover:-translate-y-1" style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)' }}>
              Ropa
            </h2>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-background/50 group-hover:text-background/70 transition-colors duration-300">Hoodies · Remeras · Pantalones</p>
            <p className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-background/0 group-hover:text-background/90 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
              Ver colección <ArrowIcon className="shrink-0 text-gold transition-transform duration-300 group-hover:translate-x-1" />
            </p>
          </div>
        </Link>

        {/* Accesorios */}
        <Link href="/products?category=Gorras" className="group relative flex-1 overflow-hidden" style={{ minHeight: '260px' }}>
          <Image
            src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=85"
            alt="Accesorios"
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/45 transition-colors duration-500 group-hover:bg-foreground/60" />
          <div className="absolute bottom-0 left-8 lg:left-10 h-0 w-px bg-gold transition-all duration-700 ease-out group-hover:h-24" />
          <span className="absolute left-8 top-8 lg:left-10 lg:top-10 text-[10px] font-medium tabular-nums text-background/40">03</span>
          <div className="absolute bottom-8 left-8 right-8 lg:bottom-10 lg:left-10 lg:right-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Esenciales</p>
            <h2 className="mt-2 font-black uppercase leading-none tracking-tight text-background transition-transform duration-500 group-hover:-translate-y-1" style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)' }}>
              Accesorios
            </h2>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-background/50 group-hover:text-background/70 transition-colors duration-300">Gorras · Mochilas</p>
            <p className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-background/0 group-hover:text-background/90 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
              Ver colección <ArrowIcon className="shrink-0 text-gold transition-transform duration-300 group-hover:translate-x-1" />
            </p>
          </div>
        </Link>

      </section>
    </>
  )
}
