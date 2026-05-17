'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'
import { SIZES_BY_CATEGORY } from '@/lib/data/products'
import useCartStore from '@/store/cart'

interface FeaturedProductsGridProps {
  products: DbProduct[]
}

const SECONDARY_BADGES = ['BEST SELLER', 'NUEVO DROP']

export default function FeaturedProductsGrid({ products }: FeaturedProductsGridProps) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const heroProduct = products[0]
  const secondaryProducts = products.slice(1, 3)

  if (!heroProduct) return null

  return (
    <div className="mt-8 md:flex md:flex-row md:gap-4 lg:gap-6">
      {/* Hero card */}
      <div className="relative overflow-hidden shadow-sm md:w-3/5 lg:w-1/2 md:shrink-0">
        <div className="relative aspect-[4/5] w-full md:aspect-auto md:h-full">
          <Image
            src={heroProduct.image}
            alt={heroProduct.name}
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        </div>

        <div className="absolute top-4 left-4 bg-foreground px-2.5 py-1">
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">
            DESTACADO
          </span>
        </div>

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
            className="w-full bg-foreground border border-gold/60 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-background flex items-center justify-center gap-2 lg:w-fit lg:px-10 cursor-pointer"
          >
            COMPRAR AHORA →
          </button>
        </div>
      </div>

      {/* Secondary cards */}
      <div className="flex flex-col gap-3 mt-4 md:mt-0 md:flex-1 lg:flex-row lg:gap-4">
        {secondaryProducts.map((product, index) => {
          const hasDiscount = product.comparePrice != null && product.comparePrice > product.price
          const discountPct = hasDiscount
            ? Math.round((1 - product.price / product.comparePrice!) * 100)
            : 0
          const badge = SECONDARY_BADGES[index]

          return (
            <div key={product.id} className="flex gap-0 overflow-hidden bg-surface shadow-sm md:flex-col lg:flex-1">
              {/* Image */}
              <div className="relative w-36 shrink-0 md:w-full md:aspect-[5/4] md:shrink-0 lg:aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 768px) 40vw, 112px"
                  className="object-cover h-full"
                />
                {badge && (
                  <span className="absolute top-2 left-2 z-10 bg-foreground px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">
                    {badge}
                  </span>
                )}
                {hasDiscount && (
                  <span className="absolute bottom-2 left-2 z-10 bg-destructive text-white text-[9px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5">
                    {discountPct}% OFF
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between py-4 px-4 md:flex-none md:px-5 md:py-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">
                    {product.category}
                  </span>
                </div>

                <h3 className="text-[15px] font-medium uppercase tracking-[0.12em] text-foreground leading-tight mt-2 md:text-[14px]">
                  {product.name}
                </h3>

                <div className="h-px bg-gold w-1/5 mt-2.5" />

                <p className="text-[15px] font-normal tracking-[0.1em] text-foreground mt-2">
                  {formatPrice(product.price)}
                </p>

                {(() => {
                  const sizes = SIZES_BY_CATEGORY[product.categorySlug] ?? []
                  const selectedSize = selectedSizes[product.id]
                  return (
                    <>
                      {sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {sizes.map((s) => (
                            <button
                              key={s}
                              onClick={() => setSelectedSizes((prev) => ({ ...prev, [product.id]: prev[product.id] === s ? '' : s }))}
                              className={`h-7 min-w-[2rem] border px-1.5 text-[10px] font-medium transition-colors ${
                                selectedSize === s
                                  ? 'border-foreground bg-foreground text-background'
                                  : 'border-border text-foreground hover:border-foreground'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (sizes.length > 0 && !selectedSize) {
                            toast.error('Seleccioná un talle para continuar')
                            return
                          }
                          addItem(
                            {
                              id: product.id,
                              name: product.name,
                              slug: product.slug,
                              price: product.price,
                              image: product.image,
                              category: product.category,
                              stock: product.stock,
                            },
                            1,
                            selectedSize || undefined
                          )
                          toast.success('Agregado al carrito')
                        }}
                        className="text-[11px] uppercase tracking-[0.25em] font-semibold text-foreground mt-3 flex items-center gap-1.5 w-fit border-b border-foreground pb-px cursor-pointer"
                      >
                        Añadir al carrito
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </button>
                    </>
                  )
                })()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
