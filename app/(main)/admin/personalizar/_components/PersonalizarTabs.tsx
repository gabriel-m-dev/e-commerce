'use client'

import Link from 'next/link'
import { useState } from 'react'

export interface SectionItem {
  href: string
  title: string
  description: string
  icon: React.ReactNode
}

interface Props {
  homepage: SectionItem[]
  shared: SectionItem[]
  nike: SectionItem[]
  jordan: SectionItem[]
  adidas: SectionItem[]
}

type MainTab = 'homepage' | 'brand'
type BrandSubTab = 'compartido' | 'nike' | 'jordan' | 'adidas'

function SectionCard({ item }: { item: SectionItem }) {
  return (
    <Link
      href={item.href}
      className="group flex items-center gap-4 border border-border bg-white p-5 transition-colors hover:border-gold lg:gap-5 lg:p-6"
    >
      <div className="size-12 shrink-0 text-gold lg:size-14">
        {item.icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground lg:text-base">
          {item.title}
        </span>
        <span className="text-xs leading-relaxed text-muted lg:text-sm">
          {item.description}
        </span>
      </div>
    </Link>
  )
}

function SectionGrid({ items }: { items: SectionItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <SectionCard key={item.href} item={item} />
      ))}
    </div>
  )
}

export default function PersonalizarTabs({ homepage, shared, nike, jordan, adidas }: Props) {
  const [mainTab, setMainTab] = useState<MainTab>('homepage')
  const [brandSubTab, setBrandSubTab] = useState<BrandSubTab>('compartido')

  const mainTabs: { id: MainTab; label: string }[] = [
    { id: 'homepage', label: 'Homepage' },
    { id: 'brand', label: 'Brand Pages' },
  ]

  const brandSubTabs: { id: BrandSubTab; label: string }[] = [
    { id: 'compartido', label: 'Compartido' },
    { id: 'nike', label: 'Nike' },
    { id: 'jordan', label: 'Jordan' },
    { id: 'adidas', label: 'Adidas' },
  ]

  const brandSections: Record<BrandSubTab, SectionItem[]> = {
    compartido: shared,
    nike,
    jordan,
    adidas,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Main tabs */}
      <div className="flex border-b border-border">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={[
              'px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] transition-colors',
              mainTab === tab.id
                ? 'border-b-2 border-gold text-gold'
                : 'text-muted hover:text-foreground',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Homepage tab content */}
      {mainTab === 'homepage' && (
        <SectionGrid items={homepage} />
      )}

      {/* Brand pages tab content */}
      {mainTab === 'brand' && (
        <div className="flex flex-col gap-5">
          {/* Brand sub-tabs */}
          <div className="flex flex-wrap gap-2">
            {brandSubTabs.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setBrandSubTab(sub.id)}
                className={[
                  'px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border transition-colors',
                  brandSubTab === sub.id
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border text-muted hover:border-foreground hover:text-foreground',
                ].join(' ')}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub-tab section list */}
          <SectionGrid items={brandSections[brandSubTab]} />
        </div>
      )}
    </div>
  )
}
