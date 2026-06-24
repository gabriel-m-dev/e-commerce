import Link from 'next/link'
import NavLinks from './NavLinks'
import NavbarActions from './NavbarActions'
import NavbarShell from './NavbarShell'
import { createClient } from '@/lib/supabase/server'
import { getProducts } from '@/lib/queries/products'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const allProducts = await getProducts()
  const searchProducts = allProducts.map(({ id, name, slug, category }) => ({ id, name, slug, category }))
  return (
    <NavbarShell>
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6 lg:px-10">

        {/* Logo */}
        <Link href="/" className="transition-opacity hover:opacity-70">
          <span className="text-2xl font-bold tracking-tight">eMe</span>
        </Link>

        {/* Nav — centered, desktop only */}
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navegación principal"
        >
          <NavLinks />
        </nav>

        {/* Actions: search + account + cart + mobile menu */}
        <NavbarActions isLoggedIn={user !== null} products={searchProducts} />

      </div>
    </NavbarShell>
  )
}
