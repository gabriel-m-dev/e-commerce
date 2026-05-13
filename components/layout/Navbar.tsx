import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'
import CartIconButton from './CartIconButton'
import MobileMenu from './MobileMenu'
import NavbarSearch from './NavbarSearch'
import NavLinks from './NavLinks'
import { createClient } from '@/lib/supabase/server'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6 lg:px-10">

        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-black tracking-tighter text-foreground transition-opacity hover:opacity-70"
        >
          {SITE_NAME}
        </Link>

        {/* Nav — centered */}
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navegación principal"
        >
          <NavLinks />
        </nav>

        {/* ─── Actions ─── */}
        <div className="flex items-center gap-5">
          {/* Search */}
          <NavbarSearch />

          {/* Account */}
          {user !== null ? (
            <Link
              href="/account"
              aria-label="Mi cuenta"
              className="text-foreground transition-opacity hover:opacity-60"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
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

          {/* Cart */}
          <CartIconButton />

          {/* Mobile menu */}
          <MobileMenu />
        </div>

      </div>
    </header>
  )
}
