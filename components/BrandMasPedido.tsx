'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Particles, { ParticlesProvider } from '@tsparticles/react'
import { loadFirePreset } from '@tsparticles/preset-fire'
import type { Engine } from '@tsparticles/engine'
import { formatPrice } from '@/lib/utils'
import type { DbProduct } from '@/lib/queries/products'

export default function BrandMasPedido({ product }: { product: DbProduct | null }) {
  const [activeThumb, setActiveThumb] = useState(0)
  const touchStartX = useRef(0)

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFirePreset(engine)
  }, [])

  if (!product) return null

  const images = product.images && product.images.length > 0 ? product.images : [product.image]
  const total = images.length

  function prev() {
    setActiveThumb((i) => Math.max(0, i - 1))
  }
  function next() {
    setActiveThumb((i) => Math.min(total - 1, i + 1))
  }

  return (
    <div className="relative overflow-hidden w-full bg-[#0a0a0a] text-white px-6 lg:px-10 py-12">
      <ParticlesProvider init={particlesInit}>
        <Particles
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
          options={{
            preset: 'fire',
            fullScreen: { enable: false },
            background: { color: { value: 'transparent' }, opacity: 0, image: '' },
            particles: {
              number: { value: 20 },
              size: { value: { min: 1, max: 3 } },
              opacity: { value: { min: 0.3, max: 0.9 } },
              move: { speed: 2 },
            },
          }}
        />
      </ParticlesProvider>

      {/* Section title — matches "NUEVOS INGRESOS" style */}
      <p className="relative z-10 text-[22px] font-medium uppercase tracking-[0.18em] leading-none text-white mb-8 text-center">
        MAS PEDIDO
      </p>

      {/* Centered card — same width as isDesktopBeat double card */}
      <div className="relative z-10 mx-auto max-w-[358px] lg:max-w-lg">
        {/* Image slider — same aspect as isDesktopBeat: 3/4 mobile, square desktop */}
        <div
          className="relative w-full overflow-hidden aspect-[3/4] lg:aspect-square"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].clientX - touchStartX.current
            if (delta > 40) prev()
            else if (delta < -40) next()
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="absolute inset-0 z-10 transition-[opacity,transform] duration-500"
              style={{
                opacity: i === activeThumb ? 1 : 0,
                transform: i === activeThumb ? 'scale(1)' : 'scale(1.04)',
                pointerEvents: i === activeThumb ? 'auto' : 'none',
              }}
            >
              <Link href={`/product/${product.slug}`} className="block w-full h-full">
                <Image
                  src={src}
                  alt={`${product.name} — vista ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 672px"
                  className="object-cover object-center"
                  priority={i === 0}
                />
              </Link>
            </div>
          ))}

          {/* Prev / Next arrows */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                disabled={activeThumb === 0}
                aria-label="Imagen anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-8 w-8 items-center justify-center text-white transition-opacity disabled:opacity-20 lg:bg-black/40 lg:backdrop-blur-sm lg:rounded-full lg:p-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={next}
                disabled={activeThumb === total - 1}
                aria-label="Imagen siguiente"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-8 w-8 items-center justify-center text-white transition-opacity disabled:opacity-20 lg:bg-black/40 lg:backdrop-blur-sm lg:rounded-full lg:p-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Dot indicators */}
          {total > 1 && (
            <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center">
              <div className="flex items-center gap-2 rounded-full px-3 py-2 backdrop-blur-md bg-black/25">
                {images.map((_, i) => (
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

        {/* Info below image — mirrors dark card info structure */}
        <div className="mt-3 flex flex-col gap-1 items-center text-center">
          <Link
            href={`/product/${product.slug}`}
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white hover:opacity-80 transition-opacity line-clamp-2"
          >
            {product.name}
          </Link>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[13px] font-semibold" style={{ color: '#c9a96e' }}>
              {formatPrice(product.price)}
            </span>
            {product.comparePrice != null && product.comparePrice > product.price && (
              <span className="text-[11px] font-normal text-white/50 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          <div className="mt-3">
            <Link
              href={`/product/${product.slug}`}
              className="inline-block border border-white px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-[#0a0a0a]"
            >
              VER PRODUCTO
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
