'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavbarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isHome = pathname === '/'
  const heroMode = isHome && !scrolled

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[background-color] duration-300 ${
        heroMode
          ? 'bg-black nav-hero'
          : isHome
            ? 'bg-background'
            : 'border-b border-border bg-background'
      }`}
    >
      {children}
    </header>
  )
}
