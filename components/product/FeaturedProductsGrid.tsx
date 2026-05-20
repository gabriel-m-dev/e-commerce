'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'

interface FeaturedProductsGridProps {
  products: DbProduct[]
}

const CARD_BADGES = ['DESTACADO', 'BEST SELLER', 'NUEVO DROP', 'TOP PICK', 'EDICIÓN LIMITADA', 'TRENDING']

function ProductCard({
  product,
  badge,
  priority,
  onNavigate,
}: {
  product: DbProduct
  badge: string
  priority?: boolean
  onNavigate: () => void
}) {
  const hasDiscount = product.comparePrice != null && product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice!) * 100)
    : 0

  return (
    <div className="relative overflow-hidden bg-transparent shadow-sm">
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 33vw, 85vw"
          className="object-cover object-top"
          priority={priority}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute top-4 left-4 bg-foreground px-2.5 py-1">
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">{badge}</span>
      </div>

      {hasDiscount && (
        <span className="absolute top-4 right-4 bg-destructive px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white">
          {discountPct}% OFF
        </span>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-base md:text-xl font-normal uppercase tracking-tight text-white leading-tight">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[22px] font-bold text-white">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-[15px] font-normal text-white/50 line-through">
              {formatPrice(product.comparePrice!)}
            </span>
          )}
        </div>
        <div className="h-px bg-gold w-10 mt-3 mb-4" />
        <button
          onClick={onNavigate}
          className="w-full bg-white/10 backdrop-blur-sm py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white flex items-center justify-center gap-2 lg:w-fit lg:px-10 cursor-pointer"
        >
          COMPRAR AHORA →
        </button>
      </div>
    </div>
  )
}

export default function FeaturedProductsGrid({ products }: FeaturedProductsGridProps) {
  const router = useRouter()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList())
      setSelectedIndex(emblaApi.selectedScrollSnap())
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }

    emblaApi.on('reInit', onInit)
    emblaApi.on('select', onSelect)
    onInit()

    return () => {
      emblaApi.off('reInit', onInit)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  if (!products.length) return null

  const showControls = scrollSnaps.length > 1

  return (
    <div className="relative mt-8">
      {/* Carousel viewport — px-10 leaves room for arrows on desktop */}
      <div className="overflow-hidden md:px-0" ref={emblaRef}>
        <div className="flex -ml-4">
          {products.map((product, index) => (
            <div key={product.id} className="shrink-0 pl-4 basis-[85%] md:basis-1/3">
              <ProductCard
                product={product}
                badge={CARD_BADGES[index % CARD_BADGES.length]}
                priority={index === 0}
                onNavigate={() => router.push(`/product/${product.slug}`)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows — only visible when scrollable */}
      {showControls && (
        <>
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 hidden md:flex h-10 w-10 items-center justify-center bg-foreground text-white disabled:opacity-20 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Siguiente"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 hidden md:flex h-10 w-10 items-center justify-center bg-foreground text-white disabled:opacity-20 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {showControls && (
        <div className="mt-6 flex justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Ir a slide ${index + 1}`}
              className={`h-[3px] transition-all duration-300 ${
                index === selectedIndex ? 'w-6 bg-foreground' : 'w-3 bg-border'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
