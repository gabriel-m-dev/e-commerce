'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SIZES_BY_CATEGORY } from '@/lib/data/products'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'
import useCartStore from '@/store/cart'
import ProductColorSelector from './ProductColorSelector'
import BrandCollectionBanner from './BrandCollectionBanner'

const PRODUCT_CATEGORIES = [
  'Todo',
  'Gorras',
  'Hoodies',
  'Remeras',
  'Mochilas',
  'Zapatillas',
  'Pantalones',
] as const

const NAV_GROUPS: { label: string; category: string | null; sub: string[] | null }[] = [
  { label: 'TODO',        category: 'Todo',      sub: null },
  { label: 'ACCESORIOS',  category: null,        sub: ['Gorras', 'Mochilas'] },
  { label: 'ROPA',        category: null,        sub: ['Remeras', 'Hoodies', 'Pantalones'] },
  { label: 'ZAPATILLAS',  category: 'Zapatillas', sub: null },
]

type SortKey = 'relevancia' | 'precio-asc' | 'precio-desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
]

export default function ProductsWithFilters({
  products,
  initialCategory = 'Todo',
  dark = false,
  brand,
}: {
  products: DbProduct[]
  initialCategory?: string
  dark?: boolean
  brand?: string
}) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory)
  const [sort, setSort] = useState<SortKey>('relevancia')
  const [search, setSearch] = useState('')
  const mobileNavSentinelRef = useRef<HTMLDivElement>(null)
  const [isMobileNavPinned, setIsMobileNavPinned] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  const [openProductId, setOpenProductId] = useState<string | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})
  const [addedProductId, setAddedProductId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    if (!dark) return

    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          ([entry]) => {
            setIsMobileNavPinned(!entry.isIntersecting && !mediaQuery.matches)
          },
          { threshold: 0 },
        )
      : null

    const handleViewportChange = () => {
      if (mediaQuery.matches) {
        setIsMobileNavPinned(false)
      }
    }

    if (mobileNavSentinelRef.current && observer) {
      observer.observe(mobileNavSentinelRef.current)
    }

    mediaQuery.addEventListener('change', handleViewportChange)

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange)
      observer?.disconnect()
    }
  }, [dark])

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
      {dark ? (
        // === DARK (Jordan) layout ===
        <>
          <div ref={mobileNavSentinelRef} className="h-px w-full lg:hidden" aria-hidden />

          {/* Overlay para cerrar submenú al tocar afuera */}
          {openMenu && (
            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} aria-hidden />
          )}

          {/* Grouped nav — hasta lg */}
          <div
            data-jordan-mobile-nav
            className="sticky z-40 pb-1 lg:hidden"
            style={{
              top: 'var(--jordan-logo-height, 77px)',
              marginLeft: 'calc(50% - 50vw)',
              marginRight: 'calc(50% - 50vw)',
              paddingLeft: 'calc(50vw - 50%)',
              paddingRight: 'calc(50vw - 50%)',
            }}
          >
            <div
              className={`absolute inset-0 bg-[#0a0a0a] transition-opacity duration-200 ${
                isMobileNavPinned ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden
            />
            <div className="relative flex flex-wrap gap-2">
            {NAV_GROUPS.map((group) => {
              const isActive = group.sub
                ? group.sub.includes(activeCategory)
                : activeCategory === group.category

              const activeSubLabel = isActive && group.sub
                ? group.sub.find(s => s === activeCategory) ?? group.label
                : group.label

              const pillBase = 'shrink-0 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors cursor-pointer border-b-2'
              const pillActive = 'text-gold border-gold'
              const pillInactive = 'text-white/70 hover:text-white border-transparent'

              if (!group.sub) {
                return (
                  <button
                    key={group.label}
                    onClick={() => { setActiveCategory(group.category!); setOpenMenu(null) }}
                    className={`${pillBase} ${isActive ? pillActive : pillInactive}`}
                  >
                    {group.label}
                  </button>
                )
              }

              return (
                <div key={group.label} className="relative z-20">
                  <button
                    onClick={() => setOpenMenu(openMenu === group.label ? null : group.label)}
                    className={`${pillBase} flex items-center gap-1.5 ${isActive ? pillActive : pillInactive}`}
                  >
                    {activeSubLabel}
                    <svg
                      width="9" height="9" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points={openMenu === group.label ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                    </svg>
                  </button>

                  {openMenu === group.label && (
                    <div className="absolute left-0 top-full bg-[#1a1a1a] p-1 min-w-[130px]">
                      {group.sub.map((subCat) => (
                        <button
                          key={subCat}
                          onClick={() => { setActiveCategory(subCat); setOpenMenu(null) }}
                          className={`block w-full text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] rounded-md transition-colors cursor-pointer ${
                            activeCategory === subCat
                              ? 'text-white bg-white/10'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {subCat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          </div>

          {/* Flat nav — lg+ */}
          <div className="hidden lg:flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenMenu(null) }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                  activeCategory === cat ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </>
      ) : (
        // === LIGHT (default) layout — UNCHANGED ===
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
      )}

      {/* Search + sort (dark only) / Search alone (light) */}
      {dark ? (
        <div className="mt-24 flex items-center gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-[#1a1a1a] border border-white/10 pl-9 pr-3 py-2.5 text-[11px] uppercase tracking-[0.15em] text-white placeholder:text-white/30 outline-none focus:border-white/30 rounded-md"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-px bg-white/10" aria-hidden />
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                Ordenar
              </span>
              <div className="flex items-center gap-1">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="bg-transparent text-[11px] font-semibold uppercase tracking-[0.15em] text-white outline-none cursor-pointer appearance-none pr-0"
                  style={{ colorScheme: 'dark' }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#1a1a1a] text-white">
                      {o.label}
                    </option>
                  ))}
                </select>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                  aria-hidden
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full border border-border bg-transparent px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-foreground placeholder:text-muted outline-none transition-colors focus:border-foreground sm:max-w-xs"
          />
        </div>
      )}

      {/* Banner colección (solo Jordan dark) */}
      {dark && brand === 'JORDAN' && <BrandCollectionBanner brand="JORDAN" />}

      {/* Result count */}
      <p
        className={`mt-4 text-[10px] uppercase tracking-[0.18em] ${
          dark ? 'text-white/40' : 'text-muted'
        }`}
      >
        {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
      </p>

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div
          className={`mt-6 grid grid-cols-2 ${
            dark ? 'gap-3 lg:grid-cols-4' : 'mt-8 gap-x-5 gap-y-10 lg:grid-cols-4'
          }`}
        >
          {filtered.map((product, index) => {
            const sizes = SIZES_BY_CATEGORY[product.categorySlug] ?? []
            const selectedSize = selectedSizes[product.id]
            const isAdded = addedProductId === product.id
            const needsSize = sizes.length > 0 && !selectedSize
            const isOpen = openProductId === product.id

            function handleAddToCart() {
              if (needsSize) {
                toast.error('Seleccioná un talle para continuar')
                return
              }
              addItem(
                {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image: product.image,
                  category: product.category,
                  stock: product.stock,
                },
                1,
                selectedSize,
                selectedColors[product.id],
              )
              toast.success('Agregado al carrito')
              setAddedProductId(product.id)
              setTimeout(() => {
                setAddedProductId(null)
                setOpenProductId(null)
              }, 1500)
            }

            function handleBuyNow() {
              if (needsSize) {
                toast.error('Seleccioná un talle para continuar')
                return
              }
              addItem(
                {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image: product.image,
                  category: product.category,
                  stock: product.stock,
                },
                1,
                selectedSize,
                selectedColors[product.id],
              )
              router.push('/checkout')
            }

            if (dark) {
              return (
                <div
                  key={product.id}
                  className="group bg-[#1a1a1a] rounded-lg p-3 flex flex-col"
                >
                  {/* Imagen — wrapper clickable que navega al producto */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/product/${product.slug}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/product/${product.slug}`)
                      }
                    }}
                    className="relative block aspect-square w-full overflow-hidden rounded-md cursor-pointer"
                    aria-label={`Ver ${product.name}`}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      priority={index < 4}
                    />
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="absolute bottom-2 left-2 bg-destructive px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                        {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                      </span>
                    )}

                    {/* Cart icon top-right */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenProductId(isOpen ? null : product.id)
                      }}
                      aria-label={`Agregar ${product.name} al carrito`}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-md bg-white/10 backdrop-blur-sm text-white border border-white/15 hover:bg-white/20 transition cursor-pointer"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <line x1="3" x2="21" y1="6" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </button>
                  </div>

                  {/* Info: nombre + precio + colores */}
                  <div className="mt-3 flex flex-col gap-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white hover:opacity-80 transition-opacity line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-end justify-between gap-2">
                      <p className="text-[13px] font-semibold text-white">
                        {formatPrice(product.price)}
                      </p>
                      {product.colors.length > 0 && (
                        <ProductColorSelector
                          colors={product.colors}
                          selected={selectedColors[product.id]}
                          onChange={(c) =>
                            setSelectedColors((prev) => ({ ...prev, [product.id]: c }))
                          }
                          dark
                        />
                      )}
                    </div>
                  </div>

                  {/* Panel expandible — siempre renderizado, anima con grid-template-rows */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] mt-3' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                        {sizes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {sizes.map((s) => (
                              <button
                                key={s}
                                onClick={() =>
                                  setSelectedSizes((prev) => ({ ...prev, [product.id]: s }))
                                }
                                className={`h-7 min-w-[2rem] px-2 text-[9px] font-semibold uppercase tracking-[0.15em] border transition-colors cursor-pointer rounded-sm ${
                                  selectedSize === s
                                    ? 'border-white bg-white text-black'
                                    : 'border-white/20 text-white/60 hover:border-white/60'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={handleAddToCart}
                          className="flex h-9 w-full items-center justify-center gap-2 bg-white text-[10px] font-semibold uppercase tracking-[0.18em] text-black transition-opacity hover:opacity-80 cursor-pointer rounded-sm"
                        >
                          {isAdded ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            'Agregar al carrito'
                          )}
                        </button>

                        <button
                          onClick={handleBuyNow}
                          className="flex h-9 w-full items-center justify-center border border-gold text-[10px] font-semibold uppercase tracking-[0.18em] text-gold transition-opacity hover:opacity-70 cursor-pointer rounded-sm"
                        >
                          Comprar ahora
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            // === LIGHT (default) card — UNCHANGED ===
            return (
              <div key={product.id} className="group">
                {/* Imagen — Link individual */}
                <Link
                  href={`/product/${product.slug}`}
                  className="relative block aspect-square w-full overflow-hidden bg-surface"
                >
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
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                      {product.category}
                    </p>
                    <Link
                      href={`/product/${product.slug}`}
                      className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide text-foreground hover:opacity-70 transition-opacity"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  {/* Botón + */}
                  <button
                    onClick={() => setOpenProductId(isOpen ? null : product.id)}
                    aria-label={`Agregar ${product.name} al carrito`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center border border-border text-foreground transition-colors hover:border-foreground cursor-pointer"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <line x1="3" x2="21" y1="6" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </button>
                </div>

                {/* Panel expandible (light) */}
                {isOpen && (
                  <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                    {sizes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {sizes.map((s) => (
                          <button
                            key={s}
                            onClick={() =>
                              setSelectedSizes((prev) => ({ ...prev, [product.id]: s }))
                            }
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

                    <button
                      onClick={handleAddToCart}
                      className="flex h-9 w-full items-center justify-center gap-2 bg-foreground text-[10px] font-semibold uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-80 cursor-pointer"
                    >
                      {isAdded ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        'Agregar al carrito'
                      )}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="flex h-9 w-full items-center justify-center border border-gold text-[10px] font-semibold uppercase tracking-[0.18em] text-gold transition-opacity hover:opacity-70 cursor-pointer"
                    >
                      Comprar ahora
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center gap-3 text-center">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
              dark ? 'text-white' : 'text-foreground'
            }`}
          >
            Sin resultados
          </p>
          <p className={`text-sm ${dark ? 'text-white/50' : 'text-muted'}`}>
            {search.trim()
              ? `No hay resultados para "${search}".`
              : 'No hay productos en esta categoría.'}
          </p>
        </div>
      )}
    </div>
  )
}
