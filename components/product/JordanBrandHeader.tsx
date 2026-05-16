'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface JordanBrandHeaderProps {
  brand?: 'JORDAN'
}

export default function JordanBrandHeader({ brand = 'JORDAN' }: JordanBrandHeaderProps) {
  const logoRowRef = useRef<HTMLDivElement>(null)
  const stickySentinelRef = useRef<HTMLDivElement>(null)
  const [isLogoPinned, setIsLogoPinned] = useState(false)
  const [isLogoCollapsed, setIsLogoCollapsed] = useState(false)

  void brand

  useEffect(() => {
    const rootStyle = document.documentElement.style
    const navbar = document.querySelector('header')
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const previousNavbarPosition = navbar instanceof HTMLElement ? navbar.style.position : ''

    const syncNavbarPosition = () => {
      if (!(navbar instanceof HTMLElement)) return
      navbar.style.position = mediaQuery.matches ? previousNavbarPosition : 'relative'
    }

    const syncLogoHeight = () => {
      if (!logoRowRef.current) return
      rootStyle.setProperty('--jordan-logo-height', `${logoRowRef.current.offsetHeight}px`)
    }

    const syncCollapsedState = () => {
      if (!logoRowRef.current || mediaQuery.matches) {
        setIsLogoCollapsed(false)
        return
      }

      const mobileNav = document.querySelector('[data-jordan-mobile-nav]')

      if (!(mobileNav instanceof HTMLElement)) {
        setIsLogoCollapsed(false)
        return
      }

      const logoRect = logoRowRef.current.getBoundingClientRect()
      const navRect = mobileNav.getBoundingClientRect()
      const navTouchesLogo = navRect.top <= logoRect.bottom + 1

      setIsLogoCollapsed(navTouchesLogo)
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
            setIsLogoPinned(!entry.isIntersecting && !mediaQuery.matches)
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
      if (mediaQuery.matches) {
        setIsLogoPinned(false)
        setIsLogoCollapsed(false)
      }
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
      rootStyle.removeProperty('--jordan-logo-height')

      if (navbar instanceof HTMLElement) {
        navbar.style.position = previousNavbarPosition
      }
    }
  }, [])

  return (
    <>
      <style>{`
        @keyframes jordan-row1-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes jordan-row2-in {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes jordan-bg-img-in {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .jordan-row1 { animation: jordan-row1-in 0.5s ease-out 0s both; }
        .jordan-row2 { animation: jordan-row2-in 0.5s ease-out 0.15s both; }
        .jordan-bg-img { animation: jordan-bg-img-in 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both; }
      `}</style>
      <div ref={stickySentinelRef} className="h-px w-full" aria-hidden />

      {/* Row 1: logo dorado + JORDAN dorado */}
      <div
        ref={logoRowRef}
        className="jordan-row1 sticky top-0 z-50 pt-2 lg:static"
        style={{
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
          paddingLeft: 'calc(50vw - 50%)',
          paddingRight: 'calc(50vw - 50%)',
        }}
      >
        <div
          className={`absolute inset-0 bg-[#0a0a0a] transition-opacity duration-200 ${
            isLogoPinned ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ bottom: '-1px' }}
          aria-hidden
        />
        <div className="relative flex items-center">
          <div
            className={`relative h-[53px] w-[53px] shrink-0 transition-opacity duration-150 max-[374px]:h-[40px] max-[374px]:w-[40px] sm:h-[64px] sm:w-[64px] md:h-[76px] md:w-[76px] lg:h-[88px] lg:w-[88px] ${
              isLogoCollapsed ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Image
              src="/jordan_logo.png"
              alt="Jordan"
              fill
              sizes="(max-width: 374px) 40px, (max-width: 640px) 53px, (max-width: 768px) 64px, (max-width: 1024px) 76px, 88px"
              className="object-contain"
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(76%) sepia(28%) saturate(700%) hue-rotate(358deg)',
              }}
            />
          </div>
          <p
            className={`ml-3 text-[12px] font-semibold uppercase tracking-[0.28em] text-gold transition-all duration-150 max-[374px]:ml-2 max-[374px]:text-[10px] sm:ml-4 sm:text-[14px] md:text-[16px] lg:text-[19px] ${
              isLogoCollapsed
                ? 'pointer-events-none max-w-0 translate-x-2 opacity-0'
                : 'max-w-[240px] translate-x-0 opacity-100'
            }`}
          >
            JORDAN
          </p>
          <div
            className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-180 ${
              isLogoCollapsed ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}
            aria-hidden
          >
            <div className="relative h-[100.7px] w-[100.7px] max-[374px]:h-[76px] max-[374px]:w-[76px] sm:h-[121.6px] sm:w-[121.6px] md:h-[144.4px] md:w-[144.4px]">
              <Image
                src="/jordan_logo.png"
                alt=""
                fill
                sizes="(max-width: 374px) 76px, (max-width: 640px) 100px, (max-width: 768px) 122px, 144px"
                className="object-contain"
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(76%) sepia(28%) saturate(700%) hue-rotate(358deg)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        {/* Row 2: gold line + frase uppercase */}
        <div className="jordan-row2 mt-3 flex items-center gap-3 max-[374px]:mt-2 sm:mt-4 sm:gap-4">
          <div className="h-px w-8 max-[374px]:w-6 sm:w-10 md:w-12 bg-gold shrink-0" aria-hidden />
          <p className="text-3xl max-[374px]:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-[0.07em] text-white leading-tight">
            <span className="max-[470px]:block">DREAM IT,</span>
            <span className="max-[470px]:block">DO IT<span className="text-gold ml-1"> .</span></span>
          </p>
        </div>
      </div>
    </>
  )
}
