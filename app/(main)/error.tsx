'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[LUXE.]', error)
  }, [error])

  return (
    <main className="mx-auto flex max-w-screen-xl flex-col items-center justify-center px-6 py-40 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-destructive">Error</p>
      <h1 className="mt-4 text-3xl font-black uppercase tracking-tight">Algo salió mal.</h1>
      <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted">
        Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <button
          onClick={reset}
          className="inline-flex h-11 items-center gap-3 bg-foreground px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-3 border border-foreground px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-opacity hover:opacity-70"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  )
}
