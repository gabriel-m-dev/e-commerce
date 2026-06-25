import Image from '@/components/ui/AppImage'
import Link from 'next/link'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'
import ArrowIcon from '@/components/ui/ArrowIcon'

export default function NewArrivalsSection({ products }: { products: DbProduct[] }) {
  if (!products.length) return null

  return (
    <section className="bg-[#0a0a0a]">
      <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-6 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
            Nuevos ingresos
          </span>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-white leading-tight">
          Nuevos ingresos
        </h2>
        <p className="mt-2 text-[12px] text-muted">
          Descubrí lo último que llegó a eMe
        </p>

        {/*
          Mobile:  lista vertical, imagen izquierda 128px, contenido derecha
          sm:      imagen crece a 144px (XL phones)
          md:      grid 2 col, imagen arriba aspect-[3/4], contenido abajo
          lg:      grid 4 col
        */}
        <ul className="mt-8 divide-y divide-border md:divide-y-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-10 lg:grid-cols-4 lg:gap-x-5">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-5 py-6 md:flex-col md:items-start md:gap-0 md:py-0"
            >
              {/* Image */}
              <Link
                href={`/product/${product.slug}`}
                className="relative h-32 w-32 shrink-0 overflow-hidden block sm:h-36 sm:w-36 md:h-auto md:w-full md:aspect-[3/4]"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 144px"
                  className="object-cover"
                />
              </Link>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1.5 min-w-0 md:flex-none md:w-full md:mt-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
                  {product.category}
                </span>
                <Link
                  href={`/product/${product.slug}`}
                  className="text-[15px] font-medium uppercase tracking-[0.08em] text-white leading-tight hover:opacity-70 transition-opacity truncate md:text-[13px] md:whitespace-normal md:line-clamp-2"
                >
                  {product.name}
                </Link>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[16px] font-semibold text-white md:text-[15px]">{formatPrice(product.price)}</span>
                  {product.comparePrice != null && product.comparePrice > product.price && (
                    <span className="text-[13px] font-normal text-muted line-through md:text-[12px]">{formatPrice(product.comparePrice)}</span>
                  )}
                </div>
                <Link
                  href={`/product/${product.slug}`}
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted hover:text-white transition-colors mt-1"
                >
                  Ver producto <ArrowIcon size={12} className="text-gold" />
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/nuevos-ingresos"
          className="mt-10 mx-auto flex w-fit items-center gap-3 border border-white px-8 py-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-[#0a0a0a]"
        >
          VER TODOS LOS NUEVOS INGRESOS <ArrowIcon size={14} className="text-gold" />
        </Link>

      </div>
    </section>
  )
}
