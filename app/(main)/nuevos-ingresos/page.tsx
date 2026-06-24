import Image from 'next/image'
import Link from 'next/link'
import { getNewProducts } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'

export const metadata = { title: 'Nuevos Ingresos' }

export default async function NuevosIngresosPage() {
  const products = await getNewProducts()

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-[11px] font-black uppercase tracking-[0.28em] text-foreground">
          Nuevos Ingresos
        </h1>
        <p className="mt-2 text-[11px] text-muted uppercase tracking-[0.15em]">
          {products.length} producto{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
          No hay nuevos productos disponibles por el momento.
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
          {products.map((product) => (
            <div key={product.id} className="aspect-square w-full">
            <Link href={`/product/${product.slug}`} className="group">
              <div className="relative aspect-square w-full overflow-hidden bg-surface">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                  className={`object-cover transition duration-500 [@media(hover:hover)]:group-hover:scale-105${product.images[1] ? ' [@media(hover:hover)]:group-hover:opacity-0' : ''}`}
                />
                {product.images[1] && (
                  <Image
                    src={product.images[1]}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                    className="object-cover opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-100"
                  />
                )}
                <div className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/15" />
              </div>
              <div className="mt-3.5">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-foreground">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
