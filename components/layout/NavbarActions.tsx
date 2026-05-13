'use client'

import { useState } from 'react'
import Link from 'next/link'
import NavbarSearch from './NavbarSearch'
import CartIconButton from './CartIconButton'
import MobileMenu from './MobileMenu'

export default function NavbarActions({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="flex items-center gap-5">
      <NavbarSearch onOpenChange={setSearchOpen} />

      {/* Estos ítems se ocultan en mobile cuando el search está abierto */}
      <div className={`flex items-center gap-5 ${searchOpen ? 'hidden sm:flex' : ''}`}>
        {isLoggedIn ? (
          <Link
            href="/account"
            aria-label="Mi cuenta"
            className="text-foreground transition-opacity hover:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
          >
            Ingresar
          </Link>
        )}

        <CartIconButton />

        <MobileMenu />
      </div>
    </div>
  )
}
