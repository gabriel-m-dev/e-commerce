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

const JORDAN_SLIDES = [
  { image: '/jordan_page_hero.jpg',   text: 'Listo para volar' },
  { image: '/jordan_page_hero-2.jpg', text: 'Elevá tu juego' },
] as const

function JordanHeroSlider() {
  const [current, setCurrent]     = useState(0)
  const [prev, setPrev]           = useState<number | null>(null)
  const [textVisible, setTextVisible] = useState(true)
  const [textIndex, setTextIndex] = useState(0)
  const currentRef = useRef(0)

  useEffect(() => {
    let textSwapTimer: ReturnType<typeof setTimeout>
    let textShowTimer: ReturnType<typeof setTimeout>
    let prevTimer:     ReturnType<typeof setTimeout>

    const interval = setInterval(() => {
      const oldIdx = currentRef.current
      const nextIdx = (oldIdx + 1) % JORDAN_SLIDES.length
      currentRef.current = nextIdx

      setPrev(oldIdx)
      setCurrent(nextIdx)
      setTextVisible(false)

      clearTimeout(textSwapTimer)
      clearTimeout(textShowTimer)
      clearTimeout(prevTimer)

      // swap text content once it's fully invisible (after 350ms fade-out)
      textSwapTimer = setTimeout(() => setTextIndex(nextIdx), 400)
      // then fade new text in
      textShowTimer = setTimeout(() => setTextVisible(true), 600)
      prevTimer     = setTimeout(() => setPrev(null), 700)
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(textSwapTimer)
      clearTimeout(textShowTimer)
      clearTimeout(prevTimer)
    }
  }, [])

  return (
    <div className="-ml-[5px] relative w-full aspect-[3/4] md:aspect-[16/7] overflow-hidden">
      <style>{`
        @keyframes jordan-slide-out { from { transform: translateX(0); } to { transform: translateX(100%); } }
        @keyframes jordan-slide-in  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>

      {/* All slides always in DOM so images are preloaded before any transition */}
      {JORDAN_SLIDES.map((slide, i) => {
        const isCurrent = i === current
        const isPrev    = i === prev

        let style: React.CSSProperties
        if (isPrev)              style = { zIndex: 1, animation: 'jordan-slide-out 700ms ease-in-out forwards' }
        else if (isCurrent && prev !== null) style = { zIndex: 2, animation: 'jordan-slide-in 700ms ease-in-out forwards' }
        else if (isCurrent)     style = { zIndex: 1 }
        else                    style = { zIndex: 0, opacity: 0 }

        return (
          <div key={i} className="absolute inset-0" style={style}>
            <Image
              src={slide.image}
              alt={isCurrent ? 'Jordan Collection' : ''}
              fill
              className="object-cover"
              priority
            />
          </div>
        )
      })}

      <div className="absolute inset-0 bg-black/45" style={{ zIndex: 3 }} aria-hidden />

      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8" style={{ zIndex: 4 }}>
        <p
          className="text-white uppercase tracking-[0.32em] text-lg font-medium md:text-2xl leading-tight"
          style={{
            opacity: textVisible ? 1 : 0,
            transform: textVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 350ms ease, transform 350ms ease',
          }}
        >
          {JORDAN_SLIDES[textIndex].text}
        </p>
      </div>
    </div>
  )
}

function NikeHeroSlider() {
  const [logoVisible, setLogoVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLogoVisible(true), 20000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="-ml-[5px] relative w-full aspect-[3/4] md:aspect-[16/7] overflow-hidden">
      <style>{`
        @keyframes nike-logo-in {
          from { transform: translateX(-220px); opacity: 0; }
          to   { transform: translateX(0);      opacity: 1; }
        }
      `}</style>

      <video
        src="/nike_hero_video.mp4"
        autoPlay
        muted
        playsInline
        loop={false}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay — aparece con fade junto al logo */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ zIndex: 1, backgroundColor: 'rgba(0,0,0,0.45)', opacity: logoVisible ? 1 : 0 }}
        aria-hidden
      />

      {/* Logo Nike — centrado, entra desde la izquierda en el segundo 20 */}
      {logoVisible && (
        <div
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            zIndex: 2,
            pointerEvents: 'none',
            animation: 'nike-logo-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
          aria-hidden
        >
          <Image
            src="/nike_logo.png"
            alt=""
            width={62}
            height={31}
            style={{
              display: 'block',
              width: 'clamp(220px, 32vw, 420px)',
              height: 'auto',
              transform: 'translate(-50%, -50%)',
              filter: 'brightness(0) invert(1)',
            }}
          />
        </div>
      )}
    </div>
  )
}

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
  editorialTheme,
}: {
  products: DbProduct[]
  initialCategory?: string
  dark?: boolean
  brand?: string
  editorialTheme?: 'dark' | 'light'
}) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory)
  const [sort, setSort] = useState<SortKey>('relevancia')
  const [search, setSearch] = useState('')
  const mobileNavSentinelRef = useRef<HTMLDivElement>(null)
  const [isNavPinned, setIsNavPinned] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  const [openProductId, setOpenProductId] = useState<string | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})
  const [addedProductId, setAddedProductId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const isEditorialBrand = brand === 'JORDAN' || brand === 'NIKE' || brand === 'ADIDAS'
  const usesGroupedNav = isEditorialBrand && editorialTheme !== undefined
  const isLightEditorial = usesGroupedNav && editorialTheme === 'light'
  const stickyVarName = brand ? `--${brand.toLowerCase()}-logo-height` : '--brand-logo-height'

  useEffect(() => {
    if (!usesGroupedNav) return

    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          ([entry]) => { setIsNavPinned(!entry.isIntersecting) },
          { threshold: 0 },
        )
      : null

    if (mobileNavSentinelRef.current && observer) {
      observer.observe(mobileNavSentinelRef.current)
    }

    return () => { observer?.disconnect() }
  }, [usesGroupedNav])

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
      {usesGroupedNav ? (
        // === EDITORIAL BRAND layout ===
        <>
          <div ref={mobileNavSentinelRef} className="h-px w-full" aria-hidden />

          {/* Overlay para cerrar submenú al tocar afuera */}
          {openMenu && (
            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} aria-hidden />
          )}

          {/* Grouped nav — todos los breakpoints */}
          <div
            data-brand-mobile-nav={brand}
            className="sticky z-40 pb-1"
            style={{
              top: `calc(var(${stickyVarName}, 77px) - 1px)`,
              marginLeft: 'calc(50% - 50vw)',
              marginRight: 'calc(50% - 50vw)',
              paddingLeft: 'calc(50vw - 50%)',
              paddingRight: 'calc(50vw - 50%)',
            }}
          >
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                isNavPinned ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundColor: editorialTheme === 'dark' ? '#0a0a0a' : '#ffffff',
                top: '-1px',
              }}
              aria-hidden
            />
            <div
              data-brand-nav-collapsed-bg
              className="pointer-events-none absolute inset-0"
              style={{ top: '-1px', backgroundColor: editorialTheme === 'dark' ? '#0a0a0a' : '#ffffff', opacity: 0, transition: 'opacity 180ms' }}
              aria-hidden
            />
            <div data-brand-nav-inner className="relative flex flex-wrap gap-2">
            {NAV_GROUPS.map((group) => {
              const isActive = group.sub
                ? group.sub.includes(activeCategory)
                : activeCategory === group.category

              const activeSubLabel = isActive && group.sub
                ? group.sub.find(s => s === activeCategory) ?? group.label
                : group.label

              const pillBase = 'shrink-0 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors cursor-pointer border-b-2'
              const pillActive = 'text-gold border-gold'
              const pillInactive = editorialTheme === 'dark'
                ? 'text-white/70 hover:text-white border-transparent'
                : 'text-muted hover:text-foreground border-transparent'

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
                    <div className={`absolute left-0 top-full p-1 min-w-[130px] ${
                      editorialTheme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white border border-border shadow-sm'
                    }`}>
                      {group.sub.map((subCat) => (
                        <button
                          key={subCat}
                          onClick={() => { setActiveCategory(subCat); setOpenMenu(null) }}
                          className={`block w-full text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] rounded-md transition-colors cursor-pointer ${
                            activeCategory === subCat
                              ? editorialTheme === 'dark'
                                ? 'text-white bg-white/10'
                                : 'text-foreground bg-foreground/5'
                              : editorialTheme === 'dark'
                                ? 'text-white/60 hover:text-white hover:bg-white/5'
                                : 'text-muted hover:text-foreground hover:bg-foreground/3'
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

      {/* Search + sort — light editorial and default only (not Nike) */}
      {!dark && brand !== 'NIKE' && (isLightEditorial ? (
        <div className="mt-24 flex items-center gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30"
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
              className="w-full border border-border bg-white pl-9 pr-3 py-2.5 text-[11px] uppercase tracking-[0.15em] text-foreground placeholder:text-muted outline-none focus:border-foreground rounded-md"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-px bg-border" aria-hidden />
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted">
                Ordenar
              </span>
              <div className="flex items-center gap-1">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="bg-transparent text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground outline-none cursor-pointer appearance-none pr-0"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
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
                  className="text-foreground"
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
      ))}

      {/* Jordan hero image */}
      {dark && brand === 'JORDAN' && (
        <div
          className="mt-8"
          style={{
            marginLeft: 'calc(50% - 50vw)',
            marginRight: 'calc(50% - 50vw)',
          }}
        >
          <div className="pl-0 pr-[68px] md:pl-20 md:pr-20">
            <JordanHeroSlider />
          </div>
        </div>
      )}

      {/* Nike hero */}
      {!dark && brand === 'NIKE' && (
        <div
          className="mt-8"
          style={{
            marginLeft: 'calc(50% - 50vw)',
            marginRight: 'calc(50% - 50vw)',
          }}
        >
          <div className="pl-0 pr-[68px] md:pl-20 md:pr-20">
            <NikeHeroSlider />
          </div>
        </div>
      )}

      {/* Result count */}
      <p
        className={`${dark ? 'mt-8' : 'mt-4'} text-[10px] uppercase tracking-[0.18em] ${
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
