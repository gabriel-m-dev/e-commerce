'use client'

import Link from 'next/link'
import { useState } from 'react'
import AdminNav from './AdminNav'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">

      {/* Backdrop mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-foreground transition-transform duration-300',
          'md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-8 pb-6">
          <div>
            <span className="text-[15px] font-black uppercase tracking-[0.22em] text-background">
              LUXE.
            </span>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-background/40">
              Admin
            </p>
          </div>
          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center text-background/40 hover:text-background transition-colors md:hidden"
            aria-label="Cerrar menú"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M1 1l10 10M11 1L1 11"/>
            </svg>
          </button>
        </div>

        <div className="mx-4 border-t border-background/10" />

        {/* Navigation */}
        <div className="mt-4 flex-1">
          <AdminNav onNavigate={() => setSidebarOpen(false)} />
        </div>

        <div className="mx-4 border-t border-background/10" />

        {/* Back to store */}
        <div className="px-4 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-background/40 transition-colors hover:text-background"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-surface">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-4 sm:px-8">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:opacity-70 md:hidden"
            aria-label="Abrir menú"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M0 1h18M0 6h18M0 11h18"/>
            </svg>
          </button>

          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-foreground md:block">
            Panel de administración
          </span>

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-foreground" />
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground sm:block">
              Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
