'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Dashboard',      href: '/admin'            },
  { label: 'Productos',      href: '/admin/products'   },
  { label: 'Categorías',     href: '/admin/categories' },
  { label: 'Envíos',         href: '/admin/shipping'   },
  { label: 'Personalizar web', href: '/admin/personalizar' },
  { label: 'Órdenes',        href: '/admin/orders'     },
]

export default function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {NAV_LINKS.map(({ label, href }) => {
        const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={[
              'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors',
              isActive
                ? 'bg-gold text-foreground'
                : 'text-white opacity-80 hover:opacity-100',
            ].join(' ')}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
