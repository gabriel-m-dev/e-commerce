'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Productos', href: '/admin/products' },
  { label: 'Personalizar web', href: '/admin/personalizar' },
  { label: 'Órdenes', href: '/admin/orders' },
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
                ? 'text-gold'
                : 'text-background/60 hover:text-background',
            ].join(' ')}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
