import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'
import NavLinks from './NavLinks'
import NavbarActions from './NavbarActions'
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

        {/* Nav — centered, desktop only */}
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navegación principal"
        >
          <NavLinks />
        </nav>

        {/* Actions: search + account + cart + mobile menu */}
        <NavbarActions isLoggedIn={user !== null} />

      </div>
    </header>
  )
}
