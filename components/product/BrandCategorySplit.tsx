import Image from 'next/image'
import Link from 'next/link'

interface BrandCategorySplitProps {
  brand: 'NIKE' | 'JORDAN' | 'ADIDAS'
  ropaImage: string
  zapatillasImage: string
}

const PANELS = [
  { slot: 'ropa' as const, label: 'ROPA', category: 'Remeras' },
  { slot: 'zapatillas' as const, label: 'ZAPATILLAS', category: 'Zapatillas' },
]

export default function BrandCategorySplit({ brand, ropaImage, zapatillasImage }: BrandCategorySplitProps) {
  if (!ropaImage && !zapatillasImage) return null

  const images = { ropa: ropaImage, zapatillas: zapatillasImage }

  return (
    <div className="flex flex-col md:flex-row gap-1 mt-8">
      {PANELS.map(({ slot, label, category }) => {
        const img = images[slot]
        return (
          <Link
            key={slot}
            href={`/products?brand=${brand}&category=${category}`}
            className="relative flex-1 h-[55vw] md:h-[65vh] min-h-[280px] overflow-hidden group block"
          >
            {img ? (
              <Image
                src={img}
                alt={label}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-foreground/10" />
            )}

            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="border border-white px-10 py-4 text-[13px] font-black uppercase tracking-[0.32em] text-white transition-all duration-300 group-hover:bg-white/10">
                {label}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
