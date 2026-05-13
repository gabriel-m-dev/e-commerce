import Link from 'next/link'
import ArrowIcon from '@/components/ui/ArrowIcon'

export default function CheckoutFailurePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-24 flex flex-col items-center text-center">

        {/* ─── Label ─── */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-destructive mb-6">
          Pago no completado
        </p>

        {/* ─── Title ─── */}
        <h1
          className="font-black uppercase tracking-tight text-foreground mb-4"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
        >
          Hubo un problema
        </h1>

        {/* ─── Body ─── */}
        <p className="text-sm leading-relaxed text-muted max-w-sm mb-10">
          No pudimos procesar tu pago. Podés reintentar o contactarnos si el
          problema persiste.
        </p>

        {/* ─── CTAs ─── */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-3 bg-foreground text-background px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
          >
            Reintentar <ArrowIcon className="shrink-0 text-gold" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 border border-foreground px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Ir a la tienda
          </Link>
        </div>

      </div>
    </main>
  )
}
