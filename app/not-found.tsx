import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-screen-xl flex-col items-center justify-center px-6 py-40 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">404</p>
      <h1 className="mt-4 text-3xl font-black uppercase tracking-tight">Página no encontrada</h1>
      <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted">
        La página que buscás no existe o fue movida. Volvé al inicio para seguir explorando.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex h-11 items-center gap-3 border border-foreground px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-opacity duration-150 hover:opacity-70"
      >
        Volver al inicio
      </Link>
    </section>
  )
}
