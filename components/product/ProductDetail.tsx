'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { SIZES_BY_CATEGORY } from '@/lib/data/products'
import { type DbProduct } from '@/lib/queries/products'
import useCartStore from '@/store/cart'
import ArrowIcon from '@/components/ui/ArrowIcon'
import { toast } from 'sonner'

export default function ProductDetail({ product }: { product: DbProduct }) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)

  const [activeThumb, setActiveThumb] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const sizes = SIZES_BY_CATEGORY[product.categorySlug] ?? []
  const mainImage = product.images[activeThumb] ?? product.image

  function handleAddToCart() {
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
      },
      quantity,
      selectedSize ?? undefined
    )
    toast.success('Agregado al carrito')
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  function handleBuyNow() {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Seleccioná un talle para continuar')
      return
    }
    const size = selectedSize ?? undefined
    const alreadyInCart = cartItems.some(
      (i) => i.product.id === product.id && i.size === size
    )
    if (!alreadyInCart) {
      addItem(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.image,
          category: product.category,
        },
        quantity,
        size
      )
    }
    router.push('/checkout')
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_460px] lg:gap-20">

      {/* ── Gallery ── */}
      <div className="flex flex-col gap-3 lg:flex-row">

        {/* Vertical thumbnails — desktop only */}
        <div className="hidden lg:flex lg:flex-col lg:gap-2.5">
          {product.images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveThumb(i)}
              aria-label={`Vista ${i + 1}`}
              className={`relative h-[76px] w-[76px] shrink-0 overflow-hidden bg-surface transition-opacity ${
                i === activeThumb
                  ? 'ring-1 ring-foreground'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              <Image
                src={src}
                alt={`${product.name} — vista ${i + 1}`}
                fill
                sizes="76px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div className="relative min-w-0 flex-1 overflow-hidden bg-surface" style={{ aspectRatio: '4/5' }}>
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center transition-opacity duration-300"
            priority
          />
        </div>

        {/* Horizontal thumbnails — mobile only */}
        <div className="flex gap-2 lg:hidden">
          {product.images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveThumb(i)}
              aria-label={`Vista ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden bg-surface transition-opacity ${
                i === activeThumb
                  ? 'ring-1 ring-foreground'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              <Image
                src={src}
                alt={`${product.name} — vista ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>

      </div>

      {/* ── Product info ── */}
      <div className="flex flex-col">

        {/* Category */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
          {product.category}
        </p>

        {/* Name */}
        <h1 className="mt-2 text-4xl font-black uppercase leading-none tracking-tight text-foreground lg:text-5xl">
          {product.name}
        </h1>

        {/* Price */}
        <p className="mt-4 text-2xl font-semibold text-foreground">
          {formatPrice(product.price)}
        </p>

        {/* Divider */}
        <div className="my-6 h-px bg-border" />

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted">
          {product.description}
        </p>

        {/* Size selector */}
        {sizes.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
                Talle
              </p>
              <button className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted underline underline-offset-2 hover:text-foreground transition-colors">
                Guía de talles
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                  className={`h-9 min-w-[2.75rem] border px-2 text-xs font-medium transition-colors ${
                    size === selectedSize
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:border-foreground'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {selectedSize === null && (
              <p className="mt-2 text-[10px] text-muted">Seleccioná un talle para continuar</p>
            )}
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
              aria-label="Reducir cantidad"
              className="px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface"
            >
              −
            </button>
            <span className="min-w-[2.5rem] px-3 text-center text-sm font-medium text-foreground">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Aumentar cantidad"
              disabled={quantity >= product.stock}
              className="px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          {quantity === product.stock && (
            <p className="mt-2 text-[10px] text-muted">Stock disponible: {product.stock}</p>
          )}
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-3 bg-foreground py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80"
          >
            {added ? 'Agregado ✓' : 'Agregar al carrito'}
          </button>
          <button
            onClick={handleBuyNow}
            className="flex flex-1 items-center justify-center gap-3 border border-foreground py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Comprar ahora <ArrowIcon className="shrink-0 text-gold" />
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted" aria-hidden>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-[11px] text-muted">Envío gratis a partir de $50.000</span>
          </div>
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted" aria-hidden>
              <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
              <path d="M16.5 9.4 7.55 4.24M3.29 7 12 12l8.71-5" />
              <path d="M12 22V12" />
              <path d="M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM21.7 16.4l-1.5 1.3-1-1" />
            </svg>
            <span className="text-[11px] text-muted">Devoluciones gratis en 30 días</span>
          </div>
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted" aria-hidden>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[11px] text-muted">Pago 100% seguro con Mercado Pago</span>
          </div>
        </div>

      </div>
    </div>
  )
}
