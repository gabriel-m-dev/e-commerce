'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { DbProduct } from '@/lib/queries/products'

const TOP_EMBERS = [
  { left: "32%",   delay: "0.1s",  dur: "3.4s", dx: "5px",  dx2: "-7px"  },
  { left: "36%",   delay: "0.7s",  dur: "2.9s", dx: "-8px", dx2: "4px"   },
  { left: "40%",   delay: "1.3s",  dur: "3.7s", dx: "7px",  dx2: "-5px"  },
  { left: "44%",   delay: "0.5s",  dur: "2.6s", dx: "-4px", dx2: "9px"   },
  { left: "50%",   delay: "1.9s",  dur: "3.1s", dx: "6px",  dx2: "-8px"  },
  { left: "56%",   delay: "0.3s",  dur: "3.8s", dx: "-9px", dx2: "5px"   },
  { left: "62%",   delay: "1.1s",  dur: "2.7s", dx: "8px",  dx2: "-3px"  },
  { left: "68%",   delay: "1.7s",  dur: "3.3s", dx: "-5px", dx2: "7px"   },
]

const EMBERS = [
  { left: "25%",   delay: "0s",    dur: "3.2s", dx: "6px",  dx2: "-4px"  },
  { left: "28.3%", delay: "0.4s",  dur: "2.8s", dx: "-8px", dx2: "5px"   },
  { left: "31.7%", delay: "0.8s",  dur: "3.6s", dx: "10px", dx2: "-7px"  },
  { left: "35%",   delay: "1.2s",  dur: "2.5s", dx: "-5px", dx2: "8px"   },
  { left: "38.3%", delay: "0.2s",  dur: "3.9s", dx: "7px",  dx2: "-3px"  },
  { left: "41.7%", delay: "1.6s",  dur: "2.7s", dx: "-9px", dx2: "6px"   },
  { left: "45%",   delay: "0.6s",  dur: "3.3s", dx: "4px",  dx2: "-8px"  },
  { left: "48.3%", delay: "1.0s",  dur: "2.9s", dx: "-6px", dx2: "7px"   },
  { left: "51.7%", delay: "1.8s",  dur: "3.5s", dx: "8px",  dx2: "-5px"  },
  { left: "55%",   delay: "0.3s",  dur: "2.6s", dx: "-7px", dx2: "4px"   },
  { left: "58.3%", delay: "1.4s",  dur: "3.8s", dx: "5px",  dx2: "-9px"  },
  { left: "61.7%", delay: "0.7s",  dur: "3.1s", dx: "-4px", dx2: "6px"   },
  { left: "65%",   delay: "2.0s",  dur: "2.4s", dx: "9px",  dx2: "-6px"  },
  { left: "68.3%", delay: "1.5s",  dur: "3.7s", dx: "-3px", dx2: "8px"   },
  { left: "71.7%", delay: "2.2s",  dur: "2.8s", dx: "6px",  dx2: "-5px"  },
  { left: "75%",   delay: "0.9s",  dur: "3.4s", dx: "-8px", dx2: "3px"   },
]

export default function BrandMasPedido({ product, bgColor = '#0a0a0a' }: { product: DbProduct | null; bgColor?: string }) {
  const [activeThumb, setActiveThumb] = useState(0)
  const touchStartX = useRef(0)

  if (!product) return null

  const isDark = bgColor === '#0a0a0a'
  const textPrimary = isDark ? 'text-white' : 'text-[#0a0a0a]'
  const textMuted = isDark ? 'text-white/50' : 'text-[#0a0a0a]/50'
  const borderColor = isDark ? 'border-white' : 'border-[#0a0a0a]'
  const hoverBg = isDark ? 'hover:bg-white hover:text-[#0a0a0a]' : 'hover:bg-[#0a0a0a] hover:text-white'

  const images = product.images && product.images.length > 0 ? product.images : [product.image]
  const total = images.length

  function prev() {
    setActiveThumb((i) => Math.max(0, i - 1))
  }
  function next() {
    setActiveThumb((i) => Math.min(total - 1, i + 1))
  }

  return (
    <div className="relative overflow-hidden w-full px-6 lg:px-10 py-12" style={{ backgroundColor: bgColor }}>
      {/* Pure CSS ember layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              bottom: "0",
              left: e.left,
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: i % 3 === 0 ? "#ffd700" : i % 3 === 1 ? "#f5a623" : "#ffc107",
              animation: `ember-rise ${e.dur} ease-in infinite`,
              animationDelay: e.delay,
              ["--dx" as string]: e.dx,
              ["--dx2" as string]: e.dx2,
            }}
          />
        ))}
        {TOP_EMBERS.map((e, i) => (
          <span
            key={`top-${i}`}
            style={{
              position: "absolute",
              top: "0",
              left: e.left,
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: i % 3 === 0 ? "#ffd700" : i % 3 === 1 ? "#f5a623" : "#ffc107",
              animation: `ember-rise ${e.dur} ease-in infinite`,
              animationDelay: e.delay,
              ["--dx" as string]: e.dx,
              ["--dx2" as string]: e.dx2,
            }}
          />
        ))}
      </div>

      {/* Section title — matches "NUEVOS INGRESOS" style */}
      <p className={`relative z-10 text-[22px] font-medium uppercase tracking-[0.18em] leading-none mb-8 text-center ${textPrimary}`}>
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
                  className="object-cover lg:object-contain object-center"
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
            className={`text-[11px] font-semibold uppercase tracking-[0.12em] hover:opacity-80 transition-opacity line-clamp-2 ${textPrimary}`}
          >
            {product.name}
          </Link>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[13px] font-semibold" style={{ color: '#c9a96e' }}>
              {formatPrice(product.price)}
            </span>
            {product.comparePrice != null && product.comparePrice > product.price && (
              <span className={`text-[11px] font-normal line-through ${textMuted}`}>
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          <div className="mt-3">
            <Link
              href={`/product/${product.slug}`}
              className={`inline-block px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors border ${borderColor} ${textPrimary} ${hoverBg}`}
            >
              VER PRODUCTO
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
