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

const FALLBACK_SNEAKERS: SneakerItem[] = [
  {
    id: 'fb-1',
    name: 'AIR MAX 270',
    price: 189999,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop&auto=format&q=80',
    slug: 'air-max-270',
  },
  {
    id: 'fb-2',
    name: 'JORDAN 1 RETRO HIGH',
    price: 229999,
    image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=600&fit=crop&auto=format&q=80',
    slug: 'jordan-1-retro-high',
  },
  {
    id: 'fb-3',
    name: 'ULTRABOOST 23',
    price: 209999,
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=600&fit=crop&auto=format&q=80',
    slug: 'ultraboost-23',
  },
  {
    id: 'fb-4',
    name: 'AIR FORCE 1 LOW',
    price: 159999,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=600&fit=crop&auto=format&q=80',
    slug: 'air-force-1-low',
  },
  {
    id: 'fb-5',
    name: 'JORDAN 4 RETRO',
    price: 249999,
    image: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=400&h=600&fit=crop&auto=format&q=80',
    slug: 'jordan-4-retro',
  },
]

function toSneakerItem(p: DbProduct): SneakerItem {
  return { id: p.id, name: p.name, price: p.price, image: p.image, slug: p.slug }
}

export default function BrandSneakersSection({ products, theme = 'light' }: BrandSneakersSectionProps) {
  const items: SneakerItem[] = products.length > 0 ? products.map(toSneakerItem) : FALLBACK_SNEAKERS

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
