import Image from 'next/image'
import Link from 'next/link'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'

export default function NuestraSeleccionSection({ products }: { products: DbProduct[] }) {
  if (!products.length) return null

  return (
    <section className="relative overflow-hidden bg-[#f5f5f7]">

      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden z-0"
      >
        <span
          className="w-full text-center font-bold uppercase tracking-[0.2em] whitespace-nowrap"
          style={{ fontSize: 'clamp(300px,50vw,800px)', WebkitTextStroke: '1.5px rgba(10,10,10,0.15)', color: 'transparent' }}
        >
          LUXE.
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-screen-xl px-6 py-16 lg:px-10">

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

        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:gap-x-6 lg:max-w-[75%] lg:mx-auto">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/product/${product.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden bg-surface"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className={`object-contain object-center transition-opacity duration-[250ms]${product.images?.[1] ? ' [@media(hover:hover)]:group-hover:opacity-0' : ''}`}
                />
                {product.images?.[1] && (
                  <Image
                    src={product.images[1]}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-contain object-center opacity-0 transition-opacity duration-[250ms] [@media(hover:hover)]:group-hover:opacity-100"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 z-10 min-h-[45%] bg-gradient-to-t from-black/70 to-transparent px-4 py-4 text-center text-white flex flex-col justify-end">
                  <span className="hidden md:block text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
                    {product.category}
                  </span>
                  <p className="mt-0.5 text-xs md:text-[13px] font-medium uppercase tracking-[0.08em] leading-tight">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs md:text-[14px] font-semibold">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
