'use client'

import { toast } from 'sonner'
import useCartStore, { type CartProduct } from '@/store/cart'

type Props = {
  product: CartProduct
  size?: string
  className?: string
}

export default function AddToCartButton({ product, size, className }: Props) {
  const addItem = useCartStore((s) => s.addItem)

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        addItem(product, 1, size)
        toast.success('Agregado al carrito')
      }}
      aria-label={`Agregar ${product.name} al carrito`}
      className={
        className ??
        'flex h-7 w-7 shrink-0 items-center justify-center border border-border text-muted transition-colors hover:border-foreground hover:text-foreground'
      }
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
        <path d="M5.5 0h-1v4.5H0v1h4.5V10h1V5.5H10v-1H5.5z" />
      </svg>
    </button>
  )
}
