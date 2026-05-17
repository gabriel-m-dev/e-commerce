'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const BRANDS = [
  {
    id: 'NIKE',
    name: 'Nike',
    logo: '/nike_logo.webp',
    image: '/nike_bg.webp',
    href: '/products?brand=NIKE',
    cta: 'IR A NIKE',
  },
  {
    id: 'JORDAN',
    name: 'Jordan',
    logo: '/jordan_logo.webp',
    image: '/jordan_page_hero.webp',
    href: '/products?brand=JORDAN',
    cta: 'IR A JORDAN',
  },
  {
    id: 'ADIDAS',
    name: 'Adidas',
    logo: '/adidas_logo.webp',
    image: '/adidas_bg.webp',
    href: '/products?brand=ADIDAS',
    cta: 'IR A ADIDAS',
  },
] as const

const GAP = 12
const WHITE_FILTER = 'brightness(0) invert(1)'

export default function BrandCarousel() {
  const containerRef   = useRef<HTMLDivElement>(null)
  const activeRef      = useRef(1)
  const exitTimerRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const touchStartX    = useRef<number | null>(null)

  const [active, setActive]               = useState(1)
  const [exiting, setExiting]             = useState<number | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    return () => clearTimeout(exitTimerRef.current)
  }, [])

  const slideWidth = useMemo(() => {
    if (!containerWidth) return 0
    return containerWidth >= 1024 ? containerWidth * 0.62 : containerWidth * 0.65
  }, [containerWidth])

  const slideHeight = useMemo(() => {
    if (!slideWidth) return 0
    return containerWidth >= 1024
      ? Math.round(slideWidth * 0.62)
      : Math.round(slideWidth * 1.32)
  }, [slideWidth, containerWidth])

  const trackOffset = useMemo(() => {
    if (!slideWidth) return 0
    return (containerWidth - slideWidth) / 2 - active * (slideWidth + GAP)
  }, [active, slideWidth, containerWidth])

  const goTo = useCallback((idx: number) => {
    clearTimeout(exitTimerRef.current)
    setExiting(activeRef.current)
    activeRef.current = idx
    setActive(idx)
    exitTimerRef.current = setTimeout(() => setExiting(null), 420)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    touchStartX.current = null
    if (Math.abs(delta) < 50) return
    const next = delta > 0
      ? Math.min(BRANDS.length - 1, activeRef.current + 1)
      : Math.max(0, activeRef.current - 1)
    if (next !== activeRef.current) goTo(next)
  }, [goTo])

  return (
    <section className="bg-background overflow-hidden py-14 lg:py-20">
      <style>{`
        @keyframes brand-content-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes brand-content-out {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(14px); }
        }
      `}</style>

      {/* Header */}
      <div className="mb-10">
        <div
          className="inline-flex items-center gap-3 bg-foreground py-4 pr-10"
          style={{ marginLeft: '-5px', paddingLeft: '29px' }}
        >
          <div className="h-px w-6 bg-gold" aria-hidden />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
            Tu marca favorita
          </p>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        {active > 0 && (
          <button
            onClick={() => goTo(active - 1)}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-black/40 transition-colors hover:text-black/70"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {active < BRANDS.length - 1 && (
          <button
            onClick={() => goTo(active + 1)}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-black/40 transition-colors hover:text-black/70"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      <div
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {containerWidth > 0 && (
          <div
            className="flex"
            style={{
              transform:  `translateX(${trackOffset}px)`,
              transition: 'transform 700ms ease-in-out',
              gap:        `${GAP}px`,
            }}
          >
            {BRANDS.map((brand, i) => {
              const isActive  = i === active
              const isExiting = i === exiting
              const showText  = isActive || isExiting

              return (
                <div
                  key={brand.id}
                  className="relative flex-shrink-0 overflow-hidden"
                  style={{
                    width:      `${slideWidth}px`,
                    height:     `${slideHeight}px`,
                    opacity:    isActive ? 1 : 0.5,
                    transform:  isActive ? 'scale(1)' : 'scale(0.96)',
                    transition: 'opacity 700ms ease, transform 700ms ease',
                    cursor:     isActive ? 'default' : 'pointer',
                  }}
                  onClick={() => { if (!isActive) goTo(i) }}
                >
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    className="object-cover object-center"
                    priority={i === 1}
                    sizes="(max-width: 1024px) 82vw, 62vw"
                  />

                  <div className="absolute inset-0 bg-black/50" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                    {/* Logo — always visible */}
                    <div className="relative h-10 w-20 md:h-14 md:w-28 lg:h-16 lg:w-36">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        sizes="(min-width: 1024px) 144px, (min-width: 768px) 112px, 80px"
                        className="object-contain"
                        style={{ filter: WHITE_FILTER }}
                      />
                    </div>

                    {/* Brand name — animated */}
                    {showText && (
                      <p
                        key={`name-${isActive ? 'in' : 'out'}`}
                        className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70"
                        style={{
                          animation: isActive
                            ? 'brand-content-in 360ms ease-out 200ms both'
                            : 'brand-content-out 300ms ease-in forwards',
                          pointerEvents: 'none',
                        }}
                      >
                        {brand.name}
                      </p>
                    )}

                    {/* CTA — animated, staggered after name */}
                    {showText && (
                      <div
                        key={`cta-${isActive ? 'in' : 'out'}`}
                        style={{
                          animation: isActive
                            ? 'brand-content-in 360ms ease-out 360ms both'
                            : 'brand-content-out 280ms ease-in 40ms forwards',
                          pointerEvents: isExiting ? 'none' : 'auto',
                        }}
                      >
                        <Link
                          href={brand.href}
                          className="block border border-white px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-foreground"
                          onClick={e => e.stopPropagation()}
                        >
                          {brand.cta}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      </div>

      {/* Dots */}
      <div className="mt-7 flex justify-center gap-2">
        {BRANDS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-[3px] transition-all duration-300 ${
              i === active ? 'w-6 bg-foreground' : 'w-3 bg-foreground/20'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
