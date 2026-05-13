'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NAV_LINKS } from '@/lib/constants'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* ─── Hamburger trigger ─── */}
      <button
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] text-foreground transition-opacity hover:opacity-60 md:hidden"
      >
        <span
          className={`block h-[1.5px] w-5 bg-current transition-all duration-300 ${
            open ? 'translate-y-[6.5px] rotate-45' : ''
          }`}
        />
        <span
          className={`block h-[1.5px] w-5 bg-current transition-all duration-300 ${
            open ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block h-[1.5px] w-5 bg-current transition-all duration-300 ${
            open ? '-translate-y-[6.5px] -rotate-45' : ''
          }`}
        />
      </button>

      {/* ─── Overlay panel ─── */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-foreground transition-transform duration-300 ease-in-out ${
          open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* ─── Close button ─── */}
        <div className="flex h-16 items-center justify-between px-6">
          <span className="text-lg font-black tracking-tighter text-background opacity-0 select-none">
            LUXE.
          </span>
          <button
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="text-background transition-opacity hover:opacity-60"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ─── Nav links ─── */}
        <nav
          aria-label="Navegación mobile"
          className="flex flex-col gap-2 px-6 pt-10"
        >
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="group flex items-baseline gap-3 py-3 border-b border-background/10"
            >
              <span className="text-[10px] font-semibold tracking-widest text-background/40 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-4xl font-black uppercase tracking-tight text-background transition-colors duration-200 group-hover:text-gold">
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* ─── Social icons ─── */}
        <div className="absolute bottom-10 left-6 flex items-center gap-6">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-background/60 transition-colors duration-200 hover:text-background"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="text-background/60 transition-colors duration-200 hover:text-background"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}
