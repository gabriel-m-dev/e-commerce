'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const BRANDS = [
  {
    id: 'NIKE',
    name: 'Nike',
    logo: '/nike_logo.png',
    image: '/nike_bg.png',
    href: '/products?brand=NIKE',
    cta: 'IR A NIKE',
  },
  {
    id: 'JORDAN',
    name: 'Jordan',
    logo: '/jordan_logo.png',
    image: '/jordan_page_hero.jpg',
    href: '/products?brand=JORDAN',
    cta: 'IR A JORDAN',
  },
  {
    id: 'ADIDAS',
    name: 'Adidas',
    logo: '/adidas_logo.png',
    image: '/adidas_bg.png',
    href: '/products?brand=ADIDAS',
    cta: 'IR A ADIDAS',
  },
] as const

const GAP = 12

const WHITE_FILTER = 'brightness(0) invert(1)'

export default function BrandCarousel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef   = useRef(1)
  const [active, setActive]           = useState(1)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const slideWidth = useMemo(() => {
    if (!containerWidth) return 0
    return containerWidth >= 1024 ? containerWidth * 0.62 : containerWidth * 0.82
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
    activeRef.current = idx
    setActive(idx)
  }, [])

  return (
    <section className="bg-background overflow-hidden py-14 lg:py-20">
      <style>{`
        @keyframes brand-cta-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="mx-auto mb-10 max-w-screen-xl px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="h-px w-6 bg-gold" aria-hidden />
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Tu marca favorita
          </p>
        </div>
      </div>

      {/* Carousel */}
      <div ref={containerRef} className="overflow-hidden">
        {containerWidth > 0 && (
          <div
            className="flex"
            style={{
              transform:       `translate3d(${trackOffset}px, 0, 0)`,
              transition:      'transform 480ms cubic-bezier(0.4, 0, 0.2, 1)',
              gap:             `${GAP}px`,
              willChange:      'transform',
              backfaceVisibility: 'hidden',
            }}
          >
            {BRANDS.map((brand, i) => {
              const isActive = i === active
              return (
                <div
                  key={brand.id}
                  className="relative flex-shrink-0 overflow-hidden"
                  style={{
                    width:      `${slideWidth}px`,
                    height:     `${slideHeight}px`,
                    opacity:    isActive ? 1 : 0.5,
                    transition: 'opacity 480ms cubic-bezier(0.4, 0, 0.2, 1)',
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
                    {/* Logo */}
                    <div className="relative h-10 w-20 md:h-14 md:w-28 lg:h-16 lg:w-36">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-contain"
                        style={{ filter: WHITE_FILTER }}
                      />
                    </div>

                    {/* Brand name */}
                    <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/60">
                      {brand.name}
                    </p>

                    {/* CTA — only on active, delayed fade-in */}
                    {isActive && (
                      <Link
                        href={brand.href}
                        className="border border-white px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-foreground"
                        style={{ animation: 'brand-cta-in 350ms ease 500ms both' }}
                        onClick={e => e.stopPropagation()}
                      >
                        {brand.cta}
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
