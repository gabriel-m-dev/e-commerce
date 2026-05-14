'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'
import useCartStore from '@/store/cart'

interface FeaturedProductsGridProps {
  products: DbProduct[]
}

export default function FeaturedProductsGrid({ products }: FeaturedProductsGridProps) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)

  const heroProduct = products[0]
  const secondaryProducts = products.slice(1, 3)

  if (!heroProduct) return null

  return (
    <div className="mt-8">
      {/* Hero card */}
      <div className="relative rounded-xl overflow-hidden shadow-sm">
        {/* Image */}
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={heroProduct.image}
            alt={heroProduct.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4 bg-foreground px-2.5 py-1">
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">
            DESTACADO
          </span>
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-medium">
            {heroProduct.category}
          </p>
          <h3 className="text-xl font-black uppercase tracking-tight text-white leading-tight mt-1">
            {heroProduct.name}
          </h3>
          <p className="text-[22px] font-bold text-white mt-2">
            {formatPrice(heroProduct.price)}
          </p>
          <div className="h-px bg-gold w-10 mt-3 mb-4" />
          <button
            onClick={() => router.push(`/product/${heroProduct.slug}`)}
            className="w-full bg-foreground border border-gold/60 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-background flex items-center justify-center gap-2"
          >
            COMPRAR AHORA →
          </button>
        </div>
      </div>

      {/* Secondary cards */}
      <div className="flex flex-col gap-3 mt-4">
        {secondaryProducts.map((product) => {
          const hasDiscount = product.comparePrice != null && product.comparePrice > product.price
          const discountPct = hasDiscount
            ? Math.round((1 - product.price / product.comparePrice!) * 100)
            : 0

          return (
            <div key={product.id} className="flex gap-0 rounded-xl overflow-hidden bg-surface shadow-sm">
              {/* Image */}
              <div className="relative w-36 shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="112px"
                  className="object-cover h-full"
                />
                {hasDiscount && (
                  <span className="absolute bottom-1.5 left-1.5 bg-destructive text-white text-[9px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5">
                    {discountPct}% OFF
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between py-4 px-4">
                {/* Top row — category only */}
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">
                    {product.category}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-[15px] font-medium uppercase tracking-[0.12em] text-foreground leading-tight mt-2">
                  {product.name}
                </h3>

                {/* Golden line */}
                <div className="h-px bg-gold w-1/5 mt-2.5" />

                {/* Price */}
                <p className="text-[15px] font-normal tracking-[0.1em] text-foreground mt-2">
                  {formatPrice(product.price)}
                </p>

                {/* CTA */}
                <button
                  onClick={() => {
                    addItem(
                      {
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        image: product.image,
                        category: product.category,
                      },
                      1,
                      undefined
                    )
                    toast.success('Agregado al carrito')
                  }}
                  className="text-[11px] uppercase tracking-[0.25em] font-semibold text-foreground mt-3 flex items-center gap-1.5 w-fit border-b border-foreground pb-px"
                >
                  Añadir al carrito
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
