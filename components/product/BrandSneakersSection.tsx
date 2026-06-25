'use client'

import Image from '@/components/ui/AppImage'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type DbProduct } from '@/lib/queries/products'

interface BrandSneakersSectionProps {
  products: DbProduct[]
  brand: string
  theme?: 'dark' | 'light'
}

interface SneakerItem {
  id: string
  name: string
  price: number
  image: string
  slug: string
}

function toSneakerItem(p: DbProduct): SneakerItem {
  return { id: p.id, name: p.name, price: p.price, image: p.image, slug: p.slug }
}

export default function BrandSneakersSection({ products, theme = 'light' }: BrandSneakersSectionProps) {
  const items: SneakerItem[] = products.map(toSneakerItem)
  const isDark = theme === 'dark'

  const scrollRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Track active index via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    const itemEls = Array.from(inner.children) as HTMLElement[]
    if (itemEls.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the highest intersection ratio
        let best = -1
        let bestRatio = -1
        entries.forEach((entry) => {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio
            best = itemEls.indexOf(entry.target as HTMLElement)
          }
        })
        if (best >= 0) setActiveIndex(best)
      },
      { root: container, threshold: 0.5 }
    )

    itemEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items.length])

  const scrollTo = useCallback((index: number) => {
    const container = scrollRef.current
    const inner = innerRef.current
    if (!container || !inner) return
    const item = inner.children[index] as HTMLElement | undefined
    if (!item) return
    // Use offsetLeft relative to the inner flex container + container's own scrollLeft offset
    container.scrollTo({ left: item.offsetLeft, behavior: 'smooth' })
  }, [])

  const scrollPrev = useCallback(() => {
    scrollTo(Math.max(0, activeIndex - 1))
  }, [activeIndex, scrollTo])

  const scrollNext = useCallback(() => {
    scrollTo(Math.min(items.length - 1, activeIndex + 1))
  }, [activeIndex, items.length, scrollTo])

  const canPrev = activeIndex > 0
  const canNext = activeIndex < items.length - 1

  if (products.length === 0) return null

  return (
    <div className="py-10">
      <div className="mb-5 flex items-center gap-4">
        <div className="h-px w-8 bg-gold shrink-0" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
          Zapatillas
        </span>
      </div>
      <h2 className={`mb-6 text-[20px] font-black uppercase tracking-[0.18em] leading-none ${isDark ? 'text-white' : 'text-foreground'}`}>
        ZAPATILLAS
      </h2>

      {/* Carousel wrapper — relative for arrow positioning */}
      <div className="relative">
        {/* Left arrow */}
        {canPrev && (
          <button
            onClick={scrollPrev}
            aria-label="Anterior"
            className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-1 flex h-11 w-11 items-center justify-center transition-opacity md:hidden ${isDark ? 'text-white' : 'text-foreground'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Right arrow */}
        {canNext && (
          <button
            onClick={scrollNext}
            aria-label="Siguiente"
            className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1 flex h-11 w-11 items-center justify-center transition-opacity md:hidden ${isDark ? 'text-white' : 'text-foreground'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="overflow-x-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory',
          }}
        >
          <div ref={innerRef} className="flex gap-3" style={{ width: 'max-content' }}>
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                className="shrink-0 w-[42vw] max-w-[200px] sm:w-[26vw] md:w-[22vw] lg:w-[180px] block"
                aria-label={item.name}
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 180px, (min-width: 768px) 22vw, (min-width: 640px) 26vw, 42vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="mt-2 text-center px-1">
                  <p className={`text-[11px] font-medium uppercase tracking-[0.06em] leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-foreground'}`}>
                    {item.name}
                  </p>
                  <p className={`text-[12px] font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-foreground'}`}>
                    ${item.price.toLocaleString('es-AR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Dots — only show if more than 1 item */}
      {items.length > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              aria-label={`Ir al producto ${index + 1}`}
              className={`h-[3px] transition-all duration-300 ${
                index === activeIndex
                  ? 'w-6 bg-gold'
                  : 'w-3 bg-muted'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
