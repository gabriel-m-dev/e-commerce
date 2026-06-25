import Image from '@/components/ui/AppImage'
import Link from 'next/link'
import ArrowIcon from '@/components/ui/ArrowIcon'
import { type CategoryCard, DEFAULT_CATEGORY_CARDS } from '@/lib/data/site-config-defaults'

const NUMBERS = ['01', '02', '03']

export default function CategoryShowcase({ cards: cardsProp }: { cards?: CategoryCard[] }) {
  const cards = (cardsProp && cardsProp.length === 3) ? cardsProp : DEFAULT_CATEGORY_CARDS

  return (
    <section className="flex flex-col lg:flex-row" style={{ minHeight: '92vh' }} aria-label="Explorar por categoría">
      {cards.map((card, i) => (
        <Link
          key={i}
          href={card.link}
          className="group relative flex-1 overflow-hidden"
          style={{ minHeight: '260px' }}
        >
          <Image
            src={card.image}
            alt={card.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover md:object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/45 transition-colors duration-500 group-hover:bg-foreground/60" />
          {i < 2 && (
            <div className="absolute right-0 top-0 hidden h-full w-px bg-background/15 lg:block" />
          )}
          <div className="absolute bottom-0 left-8 lg:left-10 h-0 w-px bg-gold transition-all duration-700 ease-out group-hover:h-24" />
          <span className="absolute left-8 top-8 lg:left-10 lg:top-10 text-[10px] font-medium tabular-nums text-background/40">
            {NUMBERS[i]}
          </span>
          <div className="absolute bottom-8 left-8 right-8 lg:bottom-10 lg:left-10 lg:right-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">{card.label}</p>
            <h2 className="mt-2 font-black uppercase leading-none tracking-tight text-background transition-transform duration-500 group-hover:-translate-y-1" style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)' }}>
              {card.title}
            </h2>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-background/50 group-hover:text-background/70 transition-colors duration-300">
              {card.subtitle}
            </p>
            <p className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-background/0 group-hover:text-background/90 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
              Ver colección <ArrowIcon className="shrink-0 text-gold transition-transform duration-300 group-hover:translate-x-1" />
            </p>
          </div>
        </Link>
      ))}
    </section>
  )
}
