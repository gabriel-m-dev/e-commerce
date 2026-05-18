'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type SupportedBrand = 'NIKE' | 'JORDAN' | 'ADIDAS'
type ThemeMode = 'dark' | 'light'

interface BrandEditorialHeaderProps {
  brand: SupportedBrand
  theme: ThemeMode
}

const GOLD_FILTER =
  'brightness(0) saturate(100%) invert(76%) sepia(28%) saturate(700%) hue-rotate(358deg)'

const JORDAN_SLOGAN_SWEEP = [',', 'D', 'O', ' ', 'I', 'T', '.'] as const

const BRAND_COPY: Record<
  SupportedBrand,
  {
    logoSrc: string
    logoAlt: string
    line1: string
    line2: string
    punctuation: 'comma' | 'dot'
    watermarkText: string
    watermarkLogoSrc?: string
    watermarkLogoWidth?: number
    watermarkLogoHeight?: number
  }
> = {
  NIKE: {
    logoSrc: '/brands/nike/logo.webp',
    logoAlt: 'Nike',
    line1: 'JUST',
    line2: 'DO IT',
    punctuation: 'dot',
    watermarkText: 'NIKE',
  },
  JORDAN: {
    logoSrc: '/brands/jordan/logo.webp',
    logoAlt: 'Jordan',
    line1: 'DREAM IT',
    line2: 'DO IT',
    punctuation: 'comma',
    watermarkText: 'JORDAN',
    watermarkLogoSrc: '/brands/nike/logo.webp',
    watermarkLogoWidth: 52,
    watermarkLogoHeight: 26,
  },
  ADIDAS: {
    logoSrc: '/brands/adidas/logo.webp',
    logoAlt: 'Adidas',
    line1: 'IMPOSSIBLE',
    line2: 'IS NOTHING',
    punctuation: 'dot',
    watermarkText: 'ADIDAS',
  },
}

function splitSweepCharacters(line: string) {
  return line.split('')
}

function getLine2StartIndex(brand: SupportedBrand) {
  return BRAND_COPY[brand].punctuation === 'comma' ? 1 : 0
}

export default function BrandEditorialHeader({ brand, theme }: BrandEditorialHeaderProps) {
  const logoRowRef = useRef<HTMLDivElement>(null)
  const stickySentinelRef = useRef<HTMLDivElement>(null)
  const [isLogoPinned, setIsLogoPinned] = useState(false)
  const [isLogoCollapsed, setIsLogoCollapsed] = useState(false)
  const [activeSloganSweepIndex, setActiveSloganSweepIndex] = useState(0)
  const [adidasPhase, setAdidasPhase] = useState<'question' | 'answer'>('question')

  const copy = BRAND_COPY[brand]
  const isDark = theme === 'dark'
  const textColor = isDark ? 'text-white' : 'text-foreground'
  const overlayColor = isDark ? '#0a0a0a' : '#ffffff'
  const pinnedTextColor = isDark ? 'text-gold' : 'text-foreground'
  const line2Chars = splitSweepCharacters(copy.line2)
  const line2StartIndex = getLine2StartIndex(brand)

  useEffect(() => {
    const rootStyle = document.documentElement.style
    const navbar = document.querySelector('header')
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const previousNavbarPosition = navbar instanceof HTMLElement ? navbar.style.position : ''
    const heightVarName = `--${brand.toLowerCase()}-logo-height`

    const syncNavbarPosition = () => {
      if (!(navbar instanceof HTMLElement)) return
      navbar.style.position = 'relative'
    }

    const syncLogoHeight = () => {
      if (!logoRowRef.current) return
      rootStyle.setProperty(heightVarName, `${logoRowRef.current.offsetHeight}px`)
    }

    let prevCollapsed: boolean | null = null
    let alignTimeoutId: number | undefined

    const syncCollapsedState = () => {
      if (!logoRowRef.current) {
        setIsLogoCollapsed(false)
        return
      }

      const mobileNav = document.querySelector(`[data-brand-mobile-nav="${brand}"]`)

      if (!(mobileNav instanceof HTMLElement)) {
        setIsLogoCollapsed(false)
        return
      }

      const logoRect = logoRowRef.current.getBoundingClientRect()
      const navRect = mobileNav.getBoundingClientRect()
      const collapsed = navRect.top <= logoRect.bottom + 1
      setIsLogoCollapsed(collapsed)

      const navInner = mobileNav.querySelector('[data-brand-nav-inner]')
      if (navInner instanceof HTMLElement) {
        const stateChanged = prevCollapsed !== null && collapsed !== prevCollapsed
        prevCollapsed = collapsed

        if (stateChanged) {
          window.clearTimeout(alignTimeoutId)
          navInner.style.transition = 'opacity 90ms ease'
          navInner.style.opacity = '0'
          alignTimeoutId = window.setTimeout(() => {
            navInner.style.justifyContent = collapsed ? 'center' : ''
            navInner.style.opacity = '1'
          }, 90)
        } else {
          navInner.style.justifyContent = collapsed ? 'center' : ''
        }
      }

      const navCollapsedBg = mobileNav.querySelector('[data-brand-nav-collapsed-bg]')
      if (navCollapsedBg instanceof HTMLElement) {
        navCollapsedBg.style.opacity = collapsed ? '1' : '0'
      }
    }

    syncNavbarPosition()
    syncLogoHeight()
    syncCollapsedState()

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(syncLogoHeight)
      : null

    if (logoRowRef.current && resizeObserver) {
      resizeObserver.observe(logoRowRef.current)
    }

    const intersectionObserver = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          ([entry]) => {
            setIsLogoPinned(!entry.isIntersecting)
          },
          { threshold: 0 },
        )
      : null

    if (stickySentinelRef.current && intersectionObserver) {
      intersectionObserver.observe(stickySentinelRef.current)
    }

    const handleViewportChange = () => {
      syncNavbarPosition()
      syncLogoHeight()
      syncCollapsedState()
    }

    mediaQuery.addEventListener('change', handleViewportChange)
    window.addEventListener('resize', syncLogoHeight)
    window.addEventListener('resize', syncCollapsedState)
    window.addEventListener('scroll', syncCollapsedState, { passive: true })

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange)
      window.removeEventListener('resize', syncLogoHeight)
      window.removeEventListener('resize', syncCollapsedState)
      window.removeEventListener('scroll', syncCollapsedState)
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      rootStyle.removeProperty(heightVarName)

      if (navbar instanceof HTMLElement) {
        navbar.style.position = previousNavbarPosition
      }

      window.clearTimeout(alignTimeoutId)

      const mobileNav = document.querySelector(`[data-brand-mobile-nav="${brand}"]`)
      const navInner = mobileNav?.querySelector('[data-brand-nav-inner]')
      if (navInner instanceof HTMLElement) {
        navInner.style.transition = ''
        navInner.style.opacity = ''
        navInner.style.justifyContent = ''
      }
      const navCollapsedBg = mobileNav?.querySelector('[data-brand-nav-collapsed-bg]')
      if (navCollapsedBg instanceof HTMLElement) {
        navCollapsedBg.style.opacity = '0'
      }
    }
  }, [brand])

  useEffect(() => {
    if (brand !== 'JORDAN') return

    setActiveSloganSweepIndex(0)

    let intervalId: number | undefined

    const timeoutId = window.setTimeout(() => {
      let nextIndex = 1
      intervalId = window.setInterval(() => {
        setActiveSloganSweepIndex(nextIndex)

        if (nextIndex >= JORDAN_SLOGAN_SWEEP.length - 1) {
          window.clearInterval(intervalId)
        }

        nextIndex += 1
      }, 125)
    }, 600)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
      }
    }
  }, [brand])

  useEffect(() => {
    if (brand !== 'ADIDAS') return
    setAdidasPhase('question')
    const t = window.setTimeout(() => setAdidasPhase('answer'), 800)
    return () => window.clearTimeout(t)
  }, [brand])

  return (
    <>
      <style>{`
        @keyframes brand-row1-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes brand-row2-in {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .brand-row1 { animation: brand-row1-in 0.5s ease-out 0s both; }
        .brand-row2 { animation: brand-row2-in 0.5s ease-out 0.15s both; }
        @keyframes adidas-line2-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .adidas-line2-in { animation: adidas-line2-in 0.45s ease-out both; }
      `}</style>
      <div ref={stickySentinelRef} className="h-px w-full" aria-hidden />

      <div
        ref={logoRowRef}
        className="brand-row1 sticky top-0 z-50 pt-2"
        style={{
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
          paddingLeft: 'calc(50vw - 50%)',
          paddingRight: 'calc(50vw - 50%)',
        }}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${
            isLogoPinned ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundColor: overlayColor, bottom: '-1px' }}
          aria-hidden
        />
        <div className="relative flex items-center">
          <div
            className={`relative h-[53px] w-[53px] shrink-0 transition-opacity duration-150 max-[374px]:h-[40px] max-[374px]:w-[40px] sm:h-[64px] sm:w-[64px] md:h-[76px] md:w-[76px] lg:h-[88px] lg:w-[88px] ${
              isLogoCollapsed ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Image
              src={copy.logoSrc}
              alt={copy.logoAlt}
              fill
              sizes="(max-width: 374px) 40px, (max-width: 640px) 53px, (max-width: 768px) 64px, (max-width: 1024px) 76px, 88px"
              className="object-contain"
              style={isDark ? { filter: GOLD_FILTER } : undefined}
            />
          </div>
          <p
            className={`ml-3 text-[12px] font-semibold uppercase tracking-[0.28em] transition-all duration-150 max-[374px]:ml-2 max-[374px]:text-[10px] sm:ml-4 sm:text-[14px] md:text-[16px] lg:text-[19px] ${
              isLogoCollapsed
                ? 'pointer-events-none max-w-0 translate-x-2 opacity-0'
                : 'max-w-[240px] translate-x-0 opacity-100'
            } ${pinnedTextColor}`}
          >
            {brand}
          </p>
          <div
            className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-180 ${
              isLogoCollapsed ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}
            aria-hidden
          >
            <div className="relative h-[100.7px] w-[100.7px] max-[374px]:h-[76px] max-[374px]:w-[76px] sm:h-[121.6px] sm:w-[121.6px] md:h-[144.4px] md:w-[144.4px]">
              <Image
                src={copy.logoSrc}
                alt=""
                fill
                sizes="(max-width: 374px) 76px, (max-width: 640px) 100px, (max-width: 768px) 122px, 144px"
                className="object-contain"
                style={isDark ? { filter: GOLD_FILTER } : undefined}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className={`brand-row2 mt-3 flex flex-col items-start max-[374px]:mt-2 sm:mt-4 ${textColor}`}>
          <p className="text-3xl max-[374px]:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-[0.07em] leading-tight">
            {brand === 'JORDAN' ? (
              <>
                <span className="max-[470px]:block">
                  {copy.line1}
                  <span
                    className={`transition-colors duration-150 ${
                      activeSloganSweepIndex === 0 ? 'text-gold' : textColor
                    }`}
                  >
                    ,
                  </span>
                </span>
                <span className="max-[470px]:block">
                  {line2Chars.map((char, index) => {
                    const sweepIndex = line2StartIndex + index
                    return (
                      <span
                        key={`${char}-${index}`}
                        className={`transition-colors duration-150 ${
                          activeSloganSweepIndex === sweepIndex ? 'text-gold' : textColor
                        }`}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    )
                  })}
                  <span className="relative ml-1 inline-flex h-[0.8em] w-[0.8em] align-middle">
                    <span
                      className={`absolute left-1/2 top-[76%] h-[0.22em] w-[0.22em] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ${
                        activeSloganSweepIndex === JORDAN_SLOGAN_SWEEP.length - 1
                          ? 'scale-100 bg-gold opacity-100'
                          : 'scale-100 bg-white opacity-100'
                      }`}
                      aria-hidden
                    />
                  </span>
                </span>
              </>
            ) : brand === 'ADIDAS' ? (
              <>
                <span className="max-[470px]:block">
                  {copy.line1}
                  <span
                    className={`ml-2 text-gold transition-opacity duration-300 ${
                      adidasPhase === 'answer' ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    ?
                  </span>
                </span>
                {adidasPhase === 'answer' ? (
                  <span className="adidas-line2-in max-[470px]:block">
                    {copy.line2}
                    <span className="relative ml-1 inline-flex h-[0.8em] w-[0.8em] align-middle">
                      <span
                        className="absolute left-1/2 top-[76%] h-[0.22em] w-[0.22em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
                        aria-hidden
                      />
                    </span>
                  </span>
                ) : (
                  <span className="invisible max-[470px]:block" aria-hidden>
                    {copy.line2}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="max-[470px]:block">{copy.line1}</span>
                {' '}
                <span className="max-[470px]:block">
                  {copy.line2}
                  <span className="relative ml-1 inline-flex h-[0.8em] w-[0.8em] align-middle">
                    <span
                      className="absolute left-1/2 top-[76%] h-[0.22em] w-[0.22em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
                      aria-hidden
                    />
                  </span>
                </span>
              </>
            )}
          </p>
          <div className="mt-3 h-px w-8 max-[374px]:w-6 sm:mt-4 sm:w-10 md:w-12 bg-gold" aria-hidden />
        </div>
      </div>
    </>
  )
}
