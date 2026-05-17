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

        if (!link.children) {
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`relative text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-150 hover:text-foreground
                after:absolute after:bottom-[-3px] after:left-0 after:h-px after:bg-gold after:transition-all after:duration-300
                ${isActive ? 'text-foreground after:w-full' : 'text-foreground after:w-0 hover:after:w-full'}`}
            >
              {link.label}
            </Link>
          )
        }

        return (
          <div key={link.label} className="group relative">
            {/* Trigger */}
            <Link
              href={link.href}
              className={`relative flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-150 hover:text-foreground
                after:absolute after:bottom-[-3px] after:left-0 after:h-px after:bg-gold after:transition-all after:duration-300
                ${isActive ? 'text-foreground after:w-full' : 'text-foreground after:w-0 hover:after:w-full'}`}
            >
              {link.label}
              <svg
                width="7"
                height="4"
                viewBox="0 0 7 4"
                fill="currentColor"
                className="mt-px shrink-0 transition-transform duration-200 group-hover:rotate-180"
                aria-hidden
              >
                <path d="M0 0l3.5 4L7 0z" />
              </svg>
            </Link>

            {/* Dropdown panel — pt-2 creates transparent bridge so hover doesn't break */}
            <div className="nav-dropdown pointer-events-none absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 pt-4 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="border border-border bg-background">
                <div className="h-0.5 w-full bg-gold" />
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="flex items-center px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted transition-colors duration-150 hover:bg-surface hover:text-foreground border-b border-border last:border-b-0"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
