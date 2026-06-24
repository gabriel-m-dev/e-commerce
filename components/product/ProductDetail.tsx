'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { SIZES_BY_CATEGORY } from '@/lib/data/products'
import { type DbProduct } from '@/lib/queries/products'
import useCartStore from '@/store/cart'
import ArrowIcon from '@/components/ui/ArrowIcon'
import ShippingNotice from '@/components/ui/ShippingNotice'
import { toast } from 'sonner'

export default function ProductDetail({ product }: { product: DbProduct }) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)

  const [activeThumb, setActiveThumb] = useState(0)
  const touchStartX = useRef(0)
  const galleryRef = useRef<HTMLDivElement>(null)
  const [galleryHeight, setGalleryHeight] = useState('100svh')

  useEffect(() => {
    if (!galleryRef.current) return
    const absoluteTop = galleryRef.current.getBoundingClientRect().top + window.scrollY
    setGalleryHeight(`${window.innerHeight - absoluteTop}px`)
  }, [])
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors && product.colors.length > 0 ? product.colors[0] : null
  )
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const sizes = (product.sizes && product.sizes.length > 0)
    ? product.sizes
    : SIZES_BY_CATEGORY[product.categorySlug] ?? []
  const mainImage = product.images[activeThumb] ?? product.image

  function handleAddToCart() {
    if (product.stock === 0) return
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
        colors: product.colors ?? undefined,
        supplier: product.supplier ?? undefined,
      },
      quantity,
      selectedSize ?? undefined,
      selectedColor ?? undefined
    )
    toast.success('Agregado al carrito')
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  function handleBuyNow() {
    if (product.stock === 0) return
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Seleccioná un talle para continuar')
      return
    }
    const size = selectedSize ?? undefined
    const color = selectedColor ?? undefined
    const currentItems = useCartStore.getState().items
    const alreadyInCart = currentItems.some(
      (i) =>
        i.product.id === product.id &&
        (i.size ?? '') === (size ?? '') &&
        (i.color ?? '') === (color ?? '')
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
          stock: product.stock,
          colors: product.colors ?? undefined,
          supplier: product.supplier ?? undefined,
        },
        quantity,
        size,
        color
      )
    }
    router.push('/checkout')
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_460px] lg:gap-20">

      {/* ── Gallery — mobile (full-screen swipeable) ── */}
      <div
        ref={galleryRef}
        className="lg:hidden -mx-6 relative overflow-hidden"
        style={{ height: galleryHeight }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          const delta = e.changedTouches[0].clientX - touchStartX.current
          if (delta > 40) setActiveThumb((i) => Math.max(0, i - 1))
          else if (delta < -40) setActiveThumb((i) => Math.min(product.images.length - 1, i + 1))
        }}
      >
        {product.images.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-[opacity,transform] duration-500"
            style={{
              opacity: i === activeThumb ? 1 : 0,
              transform: i === activeThumb ? 'scale(1)' : 'scale(1.04)',
              pointerEvents: i === activeThumb ? 'auto' : 'none',
            }}
          >
            <Image
              src={src}
              alt={`${product.name} — vista ${i + 1}`}
              fill
              sizes="100vw"
              className="object-contain object-center"
              priority={i === 0}
            />
          </div>
        ))}
        {product.images.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-2 rounded-full px-3 py-2 backdrop-blur-md bg-black/25">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  aria-label={`Vista ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeThumb ? 'h-1.5 w-4 bg-white' : 'h-1.5 w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Gallery — desktop (thumbnails + main) ── */}
      <div className="hidden lg:flex lg:flex-row lg:gap-3">

        {/* Vertical thumbnails */}
        <div className="flex flex-col gap-2.5">
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
            sizes="55vw"
            className="object-cover object-center transition-opacity duration-300"
            priority
          />
        </div>

      </div>

      {/* ── Product info ── */}
      <div className="flex flex-col items-center text-center">

        {/* Category */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
          {product.category}
        </p>

        {/* Name */}
        <h1 className="mt-2 text-3xl font-black uppercase leading-none tracking-tight text-foreground lg:text-4xl">
          {product.name}
        </h1>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-foreground">{formatPrice(product.price)}</span>
          {product.comparePrice != null && product.comparePrice > product.price && (
            <span className="text-base font-normal text-muted line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-border" />

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted">
          {product.description}
        </p>

        {/* Color selector */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-8 w-full">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
              Color
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Seleccionar color ${color}`}
                  className={`h-6 w-6 rounded-full border transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-1 ring-foreground border-transparent'
                      : 'border-border hover:border-foreground/60'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size selector */}
        {sizes.length > 0 && (
          <div className="mt-8 w-full">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
              Talle
            </p>
            <div className="flex flex-wrap justify-center gap-2">
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

        {/* Shipping notice */}
        <div className="mt-6 w-full">
          <ShippingNotice variant="pdp" />
          {product.supplier && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
              Proveedor: <span className="text-gold">{product.supplier}</span>
            </p>
          )}
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex flex-1 items-center justify-center gap-3 bg-foreground py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 ${product.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {product.stock === 0 ? 'SIN STOCK' : added ? 'Agregado ✓' : 'Agregar al carrito'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className={`flex flex-1 items-center justify-center gap-3 border border-foreground py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background ${product.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Comprar ahora <ArrowIcon className="shrink-0 text-gold" />
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex w-full flex-col gap-3 border-t border-border pt-6">
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
