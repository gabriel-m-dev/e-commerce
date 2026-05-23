'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { DbProduct } from '@/lib/queries/products'

export default function BrandMasPedido({ product }: { product: DbProduct | null }) {
  if (!product) return null

  return (
    <div className="w-full bg-[#0a0a0a] text-white">
      <div className="flex flex-col md:flex-row">
        {/* Image — full width on mobile, left half on desktop */}
        <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:min-h-[480px]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
            priority={false}
          />
        </div>

        {/* Info panel */}
        <div className="flex w-full flex-col justify-center gap-6 px-8 py-12 md:w-1/2 md:px-14 md:py-16 lg:px-20 lg:py-20">
          {/* Label */}
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: '#c9a96e' }}
          >
            MAS PEDIDO
          </p>

          {/* Brand */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
            {product.brand}
          </p>

          {/* Product name */}
          <h2 className="text-2xl font-black uppercase leading-tight tracking-tight md:text-3xl lg:text-4xl">
            {product.name}
          </h2>

          {/* Price */}
          <p
            className="text-xl font-bold uppercase tracking-wider md:text-2xl"
            style={{ color: '#c9a96e' }}
          >
            {formatPrice(product.price)}
          </p>

          {/* CTA */}
          <div className="pt-2">
            <Link
              href={`/product/${product.slug}`}
              className="inline-block border border-white px-10 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-[#0a0a0a]"
            >
              VER PRODUCTO
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
