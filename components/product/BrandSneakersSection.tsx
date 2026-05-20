import Image from 'next/image'
import Link from 'next/link'
import { type DbProduct } from '@/lib/queries/products'

interface BrandSneakersSectionProps {
  products: DbProduct[]
  brand: string
  theme?: 'dark' | 'light'
}

interface SneakerItem {
  id: string
  name: string
  price: number
  image: string
  slug: string
}

function toSneakerItem(p: DbProduct): SneakerItem {
  return { id: p.id, name: p.name, price: p.price, image: p.image, slug: p.slug }
}

export default function BrandSneakersSection({ products, theme = 'light' }: BrandSneakersSectionProps) {
  if (products.length === 0) return null

  const items: SneakerItem[] = products.map(toSneakerItem)

  const isDark = theme === 'dark'

  return (
    <div className="py-10">
      <div className="mb-5 flex items-center gap-4">
        <div className="h-px w-8 bg-gold shrink-0" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
          Zapatillas
        </span>
      </div>
      <h2 className={`mb-6 text-[20px] font-black uppercase tracking-[0.18em] leading-none ${isDark ? 'text-white' : 'text-foreground'}`}>
        ZAPATILLAS
      </h2>

      <div
        className="overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3" style={{ width: 'max-content' }}>
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              className="shrink-0 w-[42vw] max-w-[200px] sm:w-[26vw] md:w-[22vw] lg:w-[180px] block"
              aria-label={item.name}
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 180px, (min-width: 768px) 22vw, (min-width: 640px) 26vw, 42vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="mt-2 text-center px-1">
                <p className={`text-[11px] font-medium uppercase tracking-[0.06em] leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-foreground'}`}>
                  {item.name}
                </p>
                <p className={`text-[12px] font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-foreground'}`}>
                  ${item.price.toLocaleString('es-AR')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
