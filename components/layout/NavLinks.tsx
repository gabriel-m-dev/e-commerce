'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from '@/lib/constants'

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <>
      {NAV_LINKS.map((link) => {
        const isActive =
          link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`relative text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-150 hover:text-foreground
  after:absolute after:bottom-[-3px] after:left-0 after:h-px after:bg-gold after:transition-all after:duration-300
  ${isActive
    ? 'text-foreground after:w-full'
    : 'text-muted after:w-0 hover:after:w-full'
  }`}
          >
            {link.label}
          </Link>
        )
      })}
    </>
  )
}
