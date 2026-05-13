import Link from 'next/link'
import ArrowIcon from '@/components/ui/ArrowIcon'

export default function CheckoutPendingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-24 flex flex-col items-center text-center">

        {/* ─── Label ─── */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold mb-6">
          Pago pendiente
        </p>

        {/* ─── Title ─── */}
        <h1
          className="font-black uppercase tracking-tight text-foreground mb-4"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
        >
          Tu pago está siendo procesado
        </h1>

        {/* ─── Body ─── */}
        <p className="text-sm leading-relaxed text-muted max-w-sm mb-10">
          Tu pago está pendiente de acreditación. Recibirás un email en cuanto
          se confirme. Esto puede demorar algunas horas según el medio de pago
          elegido.
        </p>

        {/* ─── CTA ─── */}
        <Link
          href="/account"
          className="inline-flex items-center gap-3 bg-foreground text-background px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
        >
          Ver mis pedidos <ArrowIcon className="shrink-0 text-gold" />
        </Link>

      </div>
    </main>
  )
}
