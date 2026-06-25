import Image from '@/components/ui/AppImage'
import Link from 'next/link'
import { getSaleProducts } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'

export const metadata = { title: 'Ofertas' }

export default async function OfertasPage() {
  const products = await getSaleProducts()

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-[11px] font-black uppercase tracking-[0.28em] text-foreground">
          Ofertas
        </h1>
        <p className="mt-2 text-[11px] text-muted uppercase tracking-[0.15em]">
          {products.length} producto{products.length !== 1 ? 's' : ''} en oferta
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center gap-6">
          <span className="w-10 h-px bg-border block" />
          <div className="flex flex-col items-center gap-1">
            <p className="text-3xl font-black uppercase tracking-[0.22em] leading-tight text-foreground">
              SIN OFERTAS
            </p>
            <p className="text-3xl font-black uppercase tracking-[0.22em] leading-tight text-foreground">
              DISPONIBLES
            </p>
          </div>
          <p className="text-[11px] text-muted uppercase tracking-[0.15em] leading-relaxed">
            No hay descuentos activos en este momento.<br />
            Revisá seguido — las ofertas cambian.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 border border-foreground px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Explorá nuestros productos
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 5h14M10 1l4 4-4 4" />
            </svg>
          </Link>
          <span className="w-10 h-px bg-border block" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {products.map((product) => {
            const discount = product.comparePrice
              ? Math.round((1 - product.price / product.comparePrice) * 100)
              : null
            return (
              <Link key={product.id} href={`/product/${product.slug}`} className="group">
                <div className="relative aspect-square w-full overflow-hidden bg-surface">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/15" />
                  {discount && (
                    <span className="absolute bottom-2 right-2 bg-destructive px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                <div className="mt-3.5">
                  <h3 className="text-[11px] font-medium uppercase tracking-wide text-foreground">
                    {product.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {formatPrice(product.price)}
                    </p>
                    {product.comparePrice && (
                      <p className="text-[11px] font-normal text-muted line-through">
                        {formatPrice(product.comparePrice)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
