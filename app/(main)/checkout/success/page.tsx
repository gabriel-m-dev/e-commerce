'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ArrowIcon from '@/components/ui/ArrowIcon'
import useCartStore from '@/store/cart'

{/* ─── Inner component (uses useSearchParams — must be inside Suspense) ─── */}

function SuccessContent() {
  const clearCart = useCartStore((s) => s.clearCart)
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (paymentId) {
      clearCart()
    }
    const stored = sessionStorage.getItem('luxe-last-order-id')
    if (stored) {
      setOrderId(stored)
      sessionStorage.removeItem('luxe-last-order-id')
    }
  }, [clearCart, paymentId])

  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-24 flex flex-col items-center text-center">

      {/* ─── Label ─── */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold mb-6">
        Pago confirmado
      </p>

      {/* ─── Title ─── */}
      <h1
        className="font-black uppercase tracking-tight text-foreground mb-4"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
      >
        ¡Gracias por tu compra!
      </h1>

      {/* ─── Subtitle ─── */}
      {orderId && (
        <p className="text-sm leading-relaxed text-muted max-w-sm mb-2">
          N° de pedido:{' '}
          <span className="font-semibold text-foreground">{orderId.slice(0, 8).toUpperCase()}</span>
        </p>
      )}

      <p className="text-sm leading-relaxed text-muted max-w-sm mb-10">
        Recibirás un email con la confirmación y los detalles de tu pedido.
      </p>

      {/* ─── CTA ─── */}
      <Link
        href="/products"
        className="inline-flex items-center gap-3 bg-foreground text-background px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
      >
        Volver a la tienda <ArrowIcon className="shrink-0 text-gold" />
      </Link>

    </div>
  )
}

{/* ─── Page ─── */}

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </main>
  )
}
