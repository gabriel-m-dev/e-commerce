'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'

interface BrandNewArrivalsSliderProps {
  products: DbProduct[]
  theme: 'dark' | 'light'
}

export default function BrandNewArrivalsSlider({ products, theme }: BrandNewArrivalsSliderProps) {
  const isDark = theme === 'dark'
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', dragFree: false, containScroll: 'keepSnaps' })
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
    <div className="py-12">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px w-8 bg-gold shrink-0" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
          Lo nuevo
        </span>
      </div>
      <h2 className={`mb-8 text-[22px] font-black uppercase tracking-[0.18em] leading-none ${isDark ? 'text-white' : 'text-foreground'}`}>
        Nuevos ingresos
      </h2>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {products.map((product, index) => {
              const hasDiscount = product.comparePrice != null && product.comparePrice > product.price
              const discountPct = hasDiscount
                ? Math.round((1 - product.price / product.comparePrice!) * 100)
                : 0

              return (
                <div key={product.id} className="shrink-0 pl-4 basis-[46%] md:basis-1/3">
                  <Link href={`/product/${product.slug}`} className="flex flex-col">
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 768px) 33vw, 85vw"
                        className="object-cover object-top"
                        priority={index === 0}
                      />
                      {hasDiscount && (
                        <span className="absolute top-4 right-4 bg-destructive px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-center text-center gap-1 pt-2">
                      <h3 className={`text-sm font-normal uppercase tracking-tight leading-tight ${isDark ? 'text-white' : 'text-foreground'}`}>
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>{formatPrice(product.price)}</span>
                        {hasDiscount && (
                          <span className="text-[10px] font-normal text-muted line-through">
                            {formatPrice(product.comparePrice!)}
                          </span>
                        )}
                      </div>
                      <span
                        className={`mt-1 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${isDark ? 'bg-white/10 text-white' : 'bg-foreground text-white'}`}
                      >
                        VER PRODUCTO →
                      </span>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {showControls && (
          <>
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Anterior"
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 hidden md:flex h-10 w-10 items-center justify-center disabled:opacity-20 transition-opacity cursor-pointer ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-foreground text-white hover:opacity-80'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Siguiente"
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 hidden md:flex h-10 w-10 items-center justify-center disabled:opacity-20 transition-opacity cursor-pointer ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-foreground text-white hover:opacity-80'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {showControls && (
        <div className="mt-6 flex justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Ir a slide ${index + 1}`}
              className={`h-[3px] transition-all duration-300 cursor-pointer ${
                index === selectedIndex
                  ? `w-6 ${isDark ? 'bg-white' : 'bg-foreground'}`
                  : 'w-3 bg-border'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
