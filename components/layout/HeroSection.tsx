'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ArrowIcon from '@/components/ui/ArrowIcon'

const SLIDES = [
  { mobile: '/hero-1.webp', desktop: '/hero-1.webp' },
  { mobile: '/hero-2.webp', desktop: '/hero-2.webp' },
  { mobile: '/hero-3.webp', desktop: '/hero-3.webp' },
  { mobile: '/hero-4.webp', desktop: '/hero-4.webp' },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const currentLabel = String(current + 1).padStart(2, '0')
  const totalLabel = String(SLIDES.length).padStart(2, '0')

  return (
    <section className="relative overflow-hidden bg-black">

      {/* Slide indicator — mobile only, pinned to bottom */}
      <div className="absolute bottom-4 left-6 z-10 flex items-center gap-3 lg:hidden">
        <span className="text-[11px] font-medium text-background/60">{currentLabel}</span>
        <div className="h-px w-10 bg-gold" aria-hidden />
        <span className="text-[11px] font-medium text-background/25">{totalLabel}</span>
      </div>

      {/* Mobile — shoe floating at bottom-right as depth element */}
      <div className="absolute bottom-10 right-[-30px] h-[65%] w-[100%] lg:hidden" aria-hidden>
        {SLIDES.map((slide, i) => (
          <Image
            key={i}
            src={slide.mobile}
            alt=""
            fill
            sizes="85vw"
            className={`object-contain transition-opacity duration-[800ms] ${i === current ? 'opacity-100' : 'opacity-0'}`}
            style={{ objectPosition: i === 0 ? 'calc(100% - 20px) bottom' : 'right bottom' }}
            priority={i === 0}
          />
        ))}
      </div>

      <div className="mx-auto max-w-screen-xl px-6 lg:px-10">
        <div className="grid min-h-[88svh] grid-cols-1 items-start lg:grid-cols-[1fr_460px] lg:items-center xl:grid-cols-[1fr_540px]">

          {/* Left — copy */}
          <div className="relative z-10 pt-5 pb-10 sm:pt-10 md:pt-20 lg:py-0 lg:pr-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              Nueva Colección
            </p>
            <h1
              className="mt-4 font-black uppercase leading-[0.88] tracking-tighter text-background lg:mt-5"
              style={{ fontSize: 'clamp(2.6rem, 7.5vw, 5.8rem)' }}
            >
              Diseño que<br />se siente.
            </h1>
            <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-background/55 lg:mt-5 lg:text-base">
              Calidad que se nota.
            </p>
            <div className="mt-5 lg:mt-10">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border border-background/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-background transition-colors duration-200 hover:border-background hover:bg-background hover:text-foreground lg:gap-3 lg:px-7 lg:py-3.5 lg:text-[11px]"
              >
                Comprar ahora <ArrowIcon className="shrink-0 text-gold" size={14} />
              </Link>
            </div>
            {/* Slide indicator — desktop only (inline flow) */}
            <div className="mt-20 hidden items-center gap-3 lg:flex">
              <span className="text-[11px] font-medium text-background/60">{currentLabel}</span>
              <div className="h-px w-10 bg-gold" aria-hidden />
              <span className="text-[11px] font-medium text-background/25">{totalLabel}</span>
            </div>
          </div>

          {/* Right — hero image (desktop only) */}
          <div className="relative hidden h-[88svh] lg:block overflow-hidden">
            {SLIDES.map((slide, i) => (
              <Image
                key={i}
                src={slide.desktop}
                alt={i === 0 ? 'Hero — nueva colección' : ''}
                fill
                sizes="(max-width: 1280px) 460px, 540px"
                className={`object-contain object-center transition-opacity duration-[800ms] ${i === current ? 'opacity-100' : 'opacity-0'}`}
                priority={i === 0}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
