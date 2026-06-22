'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SIZES_BY_CATEGORY, MOCK_PRODUCTS } from '@/lib/data/products'
import { formatPrice } from '@/lib/utils'
import useCartStore from '@/store/cart'
import type { DbProduct } from '@/lib/queries/products'

const DEFAULT_PRODUCT: DbProduct = {
  id: 'luxe-air-default',
  name: 'LUXE AIR',
  slug: 'luxe-air',
  price: 119900,
  comparePrice: null,
  category: 'Zapatillas',
  categorySlug: 'zapatillas',
  categorySlugs: ['zapatillas'],
  image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=85',
  images: MOCK_PRODUCTS.find(p => p.slug === 'luxe-air')?.images ?? [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85',
  ],
  description: 'Diseñadas para quienes buscan estilo, comodidad y calidad en cada paso. Suela ultraligera, upper de malla técnica.',
  featured: false,
  featuredOrder: null,
  active: true,
  stock: 10,
  brand: 'NIKE',
  colors: [],
  sizes: [],
  createdAt: new Date().toISOString(),
}

export default function ProductFeature({ product: productProp }: { product?: DbProduct | null }) {
  const product = productProp ?? DEFAULT_PRODUCT
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)

  const thumbnails = product.images.length > 0 ? product.images : [product.image]
  const sizes = (product.sizes && product.sizes.length > 0)
    ? product.sizes
    : SIZES_BY_CATEGORY[product.categorySlug] ?? []

  const [activeThumb, setActiveThumb] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const mainImage = thumbnails[activeThumb] ?? product.image

  function handleAddToCart() {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Seleccioná un talle para continuar')
      return
    }
    addItem({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.image, category: product.category, stock: product.stock }, quantity, selectedSize ?? undefined)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  function handleBuyNow() {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Seleccioná un talle para continuar')
      return
    }
    addItem({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.image, category: product.category, stock: product.stock }, quantity, selectedSize ?? undefined)
    router.push('/checkout')
  }

  return (
    <section className="bg-[#f5f5f7]">
      <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">

          {/* Left — image gallery */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            <div className="flex flex-col gap-2.5">
              {thumbnails.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-surface transition-opacity cursor-pointer ${
                    i === activeThumb
                      ? 'ring-1 ring-foreground ring-offset-0'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Vista ${i + 1}`}
                >
                  <Image
                    src={src}
                    alt={`Vista ${i + 1}`}
                    fill
                    sizes="72px"
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="relative aspect-square min-w-0 flex-1 overflow-hidden bg-surface">
              <Image
                src={mainImage}
                alt={`${product.name} — vista principal`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Right — product info */}
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              {product.category}
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-tight text-foreground">
              {product.name}
            </h2>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatPrice(product.price)}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {product.description}
            </p>

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
                    Talle
                  </p>
                  {selectedSize === null && (
                    <p className="text-[10px] text-muted">Seleccioná un talle</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                      className={`h-9 w-11 border text-xs font-medium transition-colors cursor-pointer ${
                        size === selectedSize
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-background text-foreground hover:border-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
                Cantidad
              </p>
              <div className="inline-flex items-center border border-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface cursor-pointer"
                  aria-label="Reducir cantidad"
                >
                  −
                </button>
                <span className="min-w-[2rem] px-3 text-center text-sm font-medium text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface cursor-pointer"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-foreground py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-40 cursor-pointer"
              >
                {added ? 'Agregado ✓' : 'Agregar al carrito'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 border border-foreground py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background cursor-pointer"
              >
                Comprar ahora
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
