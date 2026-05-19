import Image from 'next/image'
import Link from 'next/link'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'

export default function NuestraSeleccionSection({ products }: { products: DbProduct[] }) {
  if (!products.length) return null

  return (
    <section className="bg-[#f5f5f7]">
      <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-6 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
            Nuestra selección
          </span>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-foreground leading-tight">
          Nuestra Selección
        </h2>
        <p className="mt-2 text-[12px] text-muted">
          Los mejores picks del equipo LUXE.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:gap-x-6">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/products/${product.slug}`}
                className="relative block aspect-[3/4] overflow-hidden bg-surface"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </Link>
              <div className="mt-3 flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
                  {product.category}
                </span>
                <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-foreground leading-tight">
                  {product.name}
                </p>
                <p className="text-[14px] font-semibold text-foreground">
                  {formatPrice(product.price)}
                </p>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
