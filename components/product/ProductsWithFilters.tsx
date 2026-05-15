'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SIZES_BY_CATEGORY } from '@/lib/data/products'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'
import useCartStore from '@/store/cart'

const PRODUCT_CATEGORIES = [
  'Todo',
  'Gorras',
  'Hoodies',
  'Remeras',
  'Mochilas',
  'Zapatillas',
  'Pantalones',
] as const

type SortKey = 'relevancia' | 'precio-asc' | 'precio-desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
]

export default function ProductsWithFilters({
  products,
  initialCategory = 'Todo',
}: {
  products: DbProduct[]
  initialCategory?: string
}) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory)
  const [sort, setSort] = useState<SortKey>('relevancia')
  const [search, setSearch] = useState('')

  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  const [openProductId, setOpenProductId] = useState<string | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [addedProductId, setAddedProductId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = activeCategory === 'Todo'
      ? products
      : products.filter((p) => p.category === activeCategory)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }

    if (sort === 'precio-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'precio-desc') list = [...list].sort((a, b) => b.price - a.price)

    return list
  }, [products, activeCategory, sort, search])

  return (
    <div>
      {/* Header row: tabs + sort + count */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-0 border-b border-border">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`-mb-px px-4 pb-3 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-150 cursor-pointer ${
                activeCategory === cat
                  ? 'border-b-2 border-foreground text-foreground'
                  : 'border-b-2 border-transparent text-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex shrink-0 items-center gap-2 pb-0 sm:pb-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
            Ordenar:
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-transparent text-[11px] font-medium uppercase tracking-[0.12em] text-foreground outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full border border-border bg-transparent px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-foreground placeholder:text-muted outline-none transition-colors focus:border-foreground sm:max-w-xs"
        />
      </div>

      {/* Result count */}
      <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-muted">
        {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
      </p>

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {filtered.map((product, index) => (
            <div key={product.id} className="group">
              {/* Imagen — Link individual */}
              <Link href={`/product/${product.slug}`} className="relative block aspect-square w-full overflow-hidden bg-surface">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  priority={index < 4}
                />
                <div className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/15" />
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="absolute bottom-2 right-2 bg-destructive px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                    {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                  </span>
                )}
              </Link>

              {/* Info row */}
              <div className="mt-3.5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted">{product.category}</p>
                  <Link href={`/product/${product.slug}`} className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide text-foreground hover:opacity-70 transition-opacity">
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm font-semibold text-foreground">{formatPrice(product.price)}</p>
                </div>

                {/* Botón + */}
                <button
                  onClick={() => setOpenProductId(openProductId === product.id ? null : product.id)}
                  aria-label={`Agregar ${product.name} al carrito`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center border border-border text-foreground transition-colors hover:border-foreground cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <line x1="3" x2="21" y1="6" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </button>
              </div>

              {/* Panel expandible */}
              {openProductId === product.id && (() => {
                const sizes = SIZES_BY_CATEGORY[product.category] ?? []
                const selectedSize = selectedSizes[product.id]
                const isAdded = addedProductId === product.id
                const needsSize = sizes.length > 0 && !selectedSize

                function handleAddToCart() {
                  if (needsSize) { toast.error('Seleccioná un talle para continuar'); return }
                  addItem({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.image, category: product.category, stock: product.stock }, 1, selectedSize)
                  toast.success('Agregado al carrito')
                  setAddedProductId(product.id)
                  setTimeout(() => {
                    setAddedProductId(null)
                    setOpenProductId(null)
                  }, 1500)
                }

                function handleBuyNow() {
                  if (needsSize) { toast.error('Seleccioná un talle para continuar'); return }
                  addItem({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.image, category: product.category, stock: product.stock }, 1, selectedSize)
                  router.push('/checkout')
                }

                return (
                  <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                    {/* Selector de talles */}
                    {sizes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {sizes.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSizes((prev) => ({ ...prev, [product.id]: s }))}
                            className={`h-7 min-w-[2rem] px-2 text-[9px] font-semibold uppercase tracking-[0.15em] border transition-colors cursor-pointer ${
                              selectedSize === s
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border text-muted hover:border-foreground hover:text-foreground'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Agregar al carrito */}
                    <button
                      onClick={handleAddToCart}
                      className="flex h-9 w-full items-center justify-center gap-2 bg-foreground text-[10px] font-semibold uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-80 cursor-pointer"
                    >
                      {isAdded ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        'Agregar al carrito'
                      )}
                    </button>

                    {/* Comprar ahora */}
                    <button
                      onClick={handleBuyNow}
                      className="flex h-9 w-full items-center justify-center border border-gold text-[10px] font-semibold uppercase tracking-[0.18em] text-gold transition-opacity hover:opacity-70 cursor-pointer"
                    >
                      Comprar ahora
                    </button>
                  </div>
                )
              })()}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center gap-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
            Sin resultados
          </p>
          <p className="text-sm text-muted">
            {search.trim() ? `No hay resultados para "${search}".` : 'No hay productos en esta categoría.'}
          </p>
        </div>
      )}
    </div>
  )
}
