'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useCartStore from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import ArrowIcon from '@/components/ui/ArrowIcon'

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, getTotal, getItemCount } =
    useCartStore()

  const total = getTotal()
  const itemCount = getItemCount()
  const [mounted, setMounted] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.paddingRight = `${scrollbarWidth}px`
      document.body.style.overflow = 'hidden'
      setTimeout(() => closeButtonRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      closeCart()
      return
    }
    if (e.key !== 'Tab') return
    const drawer = drawerRef.current
    if (!drawer) return
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last?.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first?.focus() }
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-foreground/25 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Carrito de compras"
        aria-modal="true"
        onKeyDown={handleKeyDown}
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-background shadow-2xl transition-transform duration-300 ease-out sm:w-[420px] sm:border-l sm:border-border ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              Carrito
            </p>
            {mounted && itemCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </div>
          <button
            ref={closeButtonRef}
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-border" aria-hidden>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <line x1="3" x2="21" y1="6" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                Tu carrito está vacío
              </p>
              <p className="mt-1.5 text-sm text-muted">
                Agregá productos para comenzar.
              </p>
            </div>
            <button
              onClick={closeCart}
              className="mt-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-opacity hover:opacity-60"
            >
              Explorar tienda <ArrowIcon className="text-gold" />
            </button>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-y-auto">
            {items.map((item) => {
              const key = `${item.product.id}-${item.size ?? ''}`
              return (
                <li key={key} className="flex gap-4 px-6 py-5">
                  {/* Image */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    onClick={closeCart}
                    className="relative h-20 w-20 shrink-0 overflow-hidden bg-surface"
                  >
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover object-center"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                          {item.product.category}
                        </p>
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="mt-0.5 block truncate text-[11px] font-medium uppercase tracking-wide text-foreground hover:opacity-70 transition-opacity"
                        >
                          {item.product.name}
                        </Link>
                        {item.size && (
                          <p className="mt-0.5 text-[10px] text-muted">
                            Talle {item.size}
                          </p>
                        )}
                      </div>
                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        aria-label={`Eliminar ${item.product.name}`}
                        className="shrink-0 text-muted transition-colors hover:text-foreground"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                          <path d="M1 1l10 10M11 1L1 11" />
                        </svg>
                      </button>
                    </div>

                    {/* Quantity + Price */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)}
                          aria-label="Reducir"
                          className="flex h-7 w-7 items-center justify-center text-xs text-foreground transition-colors hover:bg-surface"
                        >
                          −
                        </button>
                        <span className="flex h-7 w-6 items-center justify-center text-xs font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                          aria-label="Aumentar"
                          className="flex h-7 w-7 items-center justify-center text-xs text-foreground transition-colors hover:bg-surface"
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
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-border px-6 py-6">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                Subtotal
              </p>
              <p className="text-base font-semibold text-foreground">
                {formatPrice(total)}
              </p>
            </div>
            <p className="mt-1 text-[10px] text-muted">
              Envío calculado en el checkout
            </p>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-5 flex w-full items-center justify-center gap-3 bg-foreground py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80"
            >
              Ir al checkout <ArrowIcon className="shrink-0 text-gold" />
            </Link>

            {/* Continue shopping */}
            <button
              onClick={closeCart}
              className="mt-3 w-full text-center text-[10px] font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
            >
              Seguir comprando
            </button>
          </div>
        )}

      </div>
    </>
  )
}
