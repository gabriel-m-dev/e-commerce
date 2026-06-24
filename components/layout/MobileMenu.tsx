'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NAV_LINKS } from '@/lib/constants'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function handleClose() {
    setOpen(false)
    setActiveIndex(null)
  }

  function toggleItem(index: number) {
    setActiveIndex((prev) => (prev === index ? null : index))
  }

  return (
    <>
      {/* ─── Hamburger trigger ─── */}
      <button
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] text-foreground transition-opacity hover:opacity-60 md:hidden cursor-pointer"
      >
        <span className={`block h-[1.5px] w-5 bg-current transition-all duration-300 ${open ? 'translate-y-[6.5px] rotate-45' : ''}`} />
        <span className={`block h-[1.5px] w-5 bg-current transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
        <span className={`block h-[1.5px] w-5 bg-current transition-all duration-300 ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
      </button>

      {/* ─── Overlay panel ─── */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-foreground transition-transform duration-300 ease-in-out ${
          open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* ─── Close button ─── */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6">
          <span className="select-none text-lg font-black tracking-tighter text-background opacity-0">
            eMe
          </span>
          <button
            aria-label="Cerrar menú"
            onClick={handleClose}
            className="text-background transition-opacity hover:opacity-60 cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ─── Nav links ─── */}
        <nav
          aria-label="Navegación mobile"
          className="flex-1 overflow-y-auto px-6 pt-10 pb-24"
        >
          {NAV_LINKS.map((link, i) => (
            <div key={link.label} className="border-b border-background/10">

              {link.children ? (
                <>
                  {/* Título con sub-menú — botón que hace toggle */}
                  <button
                    onClick={() => toggleItem(i)}
                    className="group flex w-full items-baseline gap-3 py-3 text-left cursor-pointer"
                  >
                    <span className="text-[10px] font-semibold tracking-widest text-background/40 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-4xl font-black uppercase tracking-tight text-background transition-colors duration-200 group-hover:text-gold">
                      {link.label}
                    </span>
                    {/* Indicador +/− */}
                    <span className={`text-background/40 text-xl font-light transition-transform duration-200 ${activeIndex === i ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>

                  {/* Sub-links accordion con transición */}
                  <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${activeIndex === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className="mb-5 ml-9">
                        <div className="mb-4 h-px w-8 bg-gold" />
                        <div className="flex flex-col gap-3">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={handleClose}
                              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-background/50 transition-colors duration-150 hover:text-background"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Título sin sub-menú — link directo */
                <Link
                  href={link.href}
                  onClick={handleClose}
                  className="group flex items-baseline gap-3 py-3"
                >
                  <span className="text-[10px] font-semibold tracking-widest text-background/40 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-4xl font-black uppercase tracking-tight text-background transition-colors duration-200 group-hover:text-gold">
                    {link.label}
                  </span>
                </Link>
              )}

            </div>
          ))}
        </nav>

        {/* ─── Social icons ─── */}
        <div className="shrink-0 flex items-center gap-6 px-6 pb-10">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-background/60 transition-colors duration-200 hover:text-background">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-background/60 transition-colors duration-200 hover:text-background">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}
