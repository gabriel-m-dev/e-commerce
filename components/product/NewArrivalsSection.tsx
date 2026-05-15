import Image from 'next/image'
import Link from 'next/link'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'
import ArrowIcon from '@/components/ui/ArrowIcon'

export default function NewArrivalsSection({ products }: { products: DbProduct[] }) {
  if (!products.length) return null

  return (
    <section className="bg-background border-t border-border">
      <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-6 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
            Nuevos ingresos
          </span>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-foreground leading-tight">
          Nuevos ingresos
        </h2>
        <p className="mt-2 text-[12px] text-muted">
          Descubrí lo último que llegó a LUXE.
        </p>

        {/* Product list */}
        <ul className="mt-8 divide-y divide-border">
          {products.map((product) => (
            <li key={product.id} className="flex items-center gap-4 py-5">
              {/* Image */}
              <Link href={`/product/${product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden bg-surface block">
                <Image src={product.image} alt={product.name} fill sizes="96px" className="object-cover" />
                <span className="absolute top-0 left-0 bg-foreground px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-gold">
                  Nuevo
                </span>
              </Link>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
                  {product.category}
                </span>
                <Link href={`/product/${product.slug}`} className="text-[14px] font-medium uppercase tracking-[0.1em] text-foreground leading-tight hover:opacity-70 transition-opacity truncate">
                  {product.name}
                </Link>
                <p className="text-[15px] font-semibold text-foreground">
                  {formatPrice(product.price)}
                </p>
                <Link href={`/product/${product.slug}`} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors mt-0.5">
                  Ver producto <ArrowIcon size={12} className="text-gold" />
                </Link>
              </div>

              {/* Heart — decorativo */}
              <button aria-label="Guardar" className="shrink-0 text-muted hover:text-foreground transition-colors cursor-pointer" tabIndex={-1}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/nuevos-ingresos"
          className="mt-6 flex w-full items-center justify-center gap-3 border border-foreground py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          Ver todos los nuevos ingresos <ArrowIcon size={14} className="text-gold" />
        </Link>

      </div>
    </section>
  )
}
