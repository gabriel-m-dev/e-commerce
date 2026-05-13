'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useCartStore from '@/store/cart'
import { SIZES_BY_CATEGORY } from '@/lib/data/products'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'

interface FeaturedProductsGridProps {
  products: DbProduct[]
}

export default function FeaturedProductsGrid({ products }: FeaturedProductsGridProps) {
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [addedProductId, setAddedProductId] = useState<string | null>(null)

  return (
    <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
      {products.map((product, index) => {
        const sizes = SIZES_BY_CATEGORY[product.category] ?? []
        const selectedSize = selectedSizes[product.id]
        const isAdded = addedProductId === product.id
        const needsSize = sizes.length > 0 && !selectedSize

        function handleAddToCart() {
          if (needsSize) { toast.error('Seleccioná un talle para continuar'); return }
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
            selectedSize
          )
          toast.success('Agregado al carrito')
          setAddedProductId(product.id)
          setTimeout(() => {
            setAddedProductId(null)
          }, 1500)
        }

        function handleBuyNow() {
          if (needsSize) { toast.error('Seleccioná un talle para continuar'); return }
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
            selectedSize
          )
          router.push('/checkout')
        }

        return (
          <div key={product.id} className="group">
            {/* Imagen clickeable */}
            <Link
              href={`/product/${product.slug}`}
              className="relative block aspect-square w-full overflow-hidden bg-surface"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                priority={index < 2}
              />
              <div className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/15" />
            </Link>

            {/* Info */}
            <div className="mt-3.5">
              <Link
                href={`/product/${product.slug}`}
                className="block hover:opacity-70 transition-opacity"
              >
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-foreground">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatPrice(product.price)}
                </p>
              </Link>
            </div>

            {/* Acciones — SIEMPRE visibles */}
            <div className="mt-3 flex flex-col gap-2">
              {/* MOBILE: select de altura fija (evita wrapping) */}
              <div className="sm:hidden">
                {sizes.length > 0 ? (
                  <div className="relative">
                    <select
                      value={selectedSize ?? ''}
                      onChange={(e) =>
                        setSelectedSizes((prev) => ({ ...prev, [product.id]: e.target.value }))
                      }
                      className="h-7 w-full appearance-none border border-border bg-transparent px-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground outline-none cursor-pointer"
                    >
                      <option value="" disabled>Talle</option>
                      {sizes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                      <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" className="text-muted" aria-hidden>
                        <path d="M0 0l4 5 4-5z"/>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="h-7" />
                )}
              </div>

              {/* DESKTOP sm+: botones de talle existentes (sin cambios) */}
              <div className="hidden sm:flex flex-wrap gap-1.5 min-h-[1.75rem]">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setSelectedSizes((prev) => ({ ...prev, [product.id]: s }))
                    }
                    className={`h-7 min-w-[2rem] px-2 text-[9px] font-semibold uppercase tracking-[0.15em] border transition-colors ${
                      selectedSize === s
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted hover:border-foreground hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Agregar al carrito */}
              <button
                onClick={handleAddToCart}
                className="flex h-9 w-full items-center justify-center gap-2 bg-foreground text-[10px] font-semibold uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-80"
              >
                {isAdded ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  'Agregar al carrito'
                )}
              </button>

              {/* Comprar ahora */}
              <button
                onClick={handleBuyNow}
                className="flex h-9 w-full cursor-pointer items-center justify-center border border-gold text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground transition-all duration-150 hover:bg-foreground hover:text-background hover:border-transparent"
              >
                Comprar ahora
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
