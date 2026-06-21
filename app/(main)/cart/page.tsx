'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useCartStore from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import ArrowIcon from '@/components/ui/ArrowIcon'
import ShippingNotice from '@/components/ui/ShippingNotice'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getItemCount } =
    useCartStore()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const total = getTotal()
  const itemCount = getItemCount()

  {/* ─── Empty State ─── */}
  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-border"
          aria-hidden
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <line x1="3" x2="21" y1="6" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-foreground">
            Tu carrito está vacío
          </p>
          <p className="mt-2 text-sm text-muted">
            Explorá nuestra tienda y encontrá lo que buscás.
          </p>
        </div>

        <Link
          href="/products"
          className="mt-2 flex items-center gap-2.5 bg-foreground px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-80"
        >
          Ver productos <ArrowIcon className="shrink-0 text-gold" />
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">

      {/* ─── Page Title ─── */}
      <div className="mb-10">
        <h1 className="text-[11px] font-black uppercase tracking-[0.32em] text-foreground">
          Carrito
        </h1>
        <div className="mt-2 h-px w-12 bg-gold" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">

        {/* ─── Left Column — Items ─── */}
        <div className="flex-1 min-w-0">

          {/* Items header */}
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              Tu carrito
            </p>
            <span className="flex h-5 w-5 items-center justify-center bg-foreground text-[9px] font-bold text-background">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          </div>

          {/* Items list */}
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const key = `${item.product.id}-${item.size ?? ''}`
              return (
                <li key={key} className="flex gap-5 py-6">

                  {/* Image */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden bg-surface"
                  >
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover object-center"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">

                    {/* Top row: meta + remove */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                          {item.product.category}
                        </p>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="mt-0.5 block truncate text-[11px] font-semibold uppercase tracking-wide text-foreground transition-opacity hover:opacity-60"
                        >
                          {item.product.name}
                        </Link>
                        {item.size && (
                          <p className="mt-1 text-[10px] text-muted">
                            Talle {item.size}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        aria-label={`Eliminar ${item.product.name}`}
                        className="shrink-0 text-muted transition-colors hover:text-foreground"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          aria-hidden
                        >
                          <path d="M1 1l12 12M13 1L1 13" />
                        </svg>
                      </button>
                    </div>

                    {/* Bottom row: quantity + line total */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center border border-border">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1, item.size)
                          }
                          aria-label="Reducir cantidad"
                          className="flex h-8 w-8 items-center justify-center text-sm text-foreground transition-colors hover:bg-surface"
                        >
                          −
                        </button>
                        <span className="flex h-8 w-8 items-center justify-center border-x border-border text-xs font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1, item.size)
                          }
                          aria-label="Aumentar cantidad"
                          className="flex h-8 w-8 items-center justify-center text-sm text-foreground transition-colors hover:bg-surface"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-foreground">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Clear cart */}
          <div className="mt-2 border-t border-border pt-5">
            <button
              onClick={clearCart}
              className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted transition-colors hover:text-foreground border border-border px-5 py-2.5"
            >
              Vaciar carrito
            </button>
          </div>
        </div>

        {/* ─── Right Column — Summary ─── */}
        <aside className="w-full lg:w-[380px] lg:sticky lg:top-24">

          {/* Summary header */}
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-foreground">
              Resumen
            </p>
            <div className="mt-2 h-px w-8 bg-gold" />
          </div>

          <div className="border border-border p-6">

            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                Subtotal
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatPrice(total)}
              </p>
            </div>

            {/* Shipping */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                Envío
              </p>
              <p className="text-[10px] text-muted">
                Calculado al confirmar
              </p>
            </div>

            {/* Total */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-foreground">
                Total
              </p>
              <p className="text-xl font-black text-foreground">
                {formatPrice(total)}
              </p>
            </div>

            {/* Shipping notice */}
            <div className="mt-6">
              <ShippingNotice variant="cart" />
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="mt-4 flex w-full items-center justify-center gap-3 bg-foreground py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-80"
            >
              Ir al checkout <ArrowIcon className="shrink-0 text-gold" />
            </Link>

            {/* Continue shopping */}
            <Link
              href="/products"
              className="mt-3 block w-full text-center text-[10px] font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
            >
              Seguir comprando
            </Link>
          </div>
        </aside>

      </div>
    </main>
  )
}
