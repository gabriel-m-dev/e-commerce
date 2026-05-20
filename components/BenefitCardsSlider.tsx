'use client'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { type BenefitCardsConfig } from '@/lib/data/site-config-defaults'

const CARD_DEFAULTS = {
  payment: {
    title: 'Pagá como quieras',
    description: 'Tarjetas, transferencia o efectivo. Con Mercado Pago.',
    icon: (
      <svg width="80" height="80" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-gold" aria-hidden>
        <rect x="2" y="7" width="28" height="18" rx="2" />
        <path d="M2 13h28M7 19h5M7 22h3" />
      </svg>
    ),
  },
  shipping: {
    title: 'Envíos a todo el país',
    description: 'Recibí tu pedido en la puerta de tu casa.',
    icon: (
      <svg width="80" height="80" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-gold" aria-hidden>
        <rect x="1" y="11" width="18" height="13" rx="1" />
        <path d="M19 15h5l5 5v5h-10V15z" />
        <circle cx="7" cy="26" r="2" />
        <circle cx="24" cy="26" r="2" />
      </svg>
    ),
  },
  security: {
    title: 'Compra segura',
    description: 'Tus datos están protegidos en todo momento.',
    icon: (
      <svg width="80" height="80" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-gold" aria-hidden>
        <path d="M16 2 4 7v10c0 7.2 5.4 12 12 13 6.6-1 12-5.8 12-13V7L16 2z" />
      </svg>
    ),
  },
} as const

type SlotKey = keyof typeof CARD_DEFAULTS
const SLOTS: SlotKey[] = ['payment', 'shipping', 'security']

export default function BenefitCardsSlider({ config }: { config: BenefitCardsConfig }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const index = Math.round(el.scrollLeft / el.offsetWidth)
      setActiveIndex(index)
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="sm:hidden">
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto divide-x divide-border"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {SLOTS.map((slot, i) => {
          const defaults = CARD_DEFAULTS[slot]
          const imageUrl = config[slot]?.imageUrl

          return (
            <div key={slot} className="min-w-full snap-center">
              {imageUrl ? (
                <div className="relative w-full" style={{ minHeight: '260px' }}>
                  <Image
                    src={imageUrl}
                    alt={defaults.title}
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 px-10 py-14 pb-20 text-center">
                  {defaults.icon}
                  <div>
                    <p className="text-base font-semibold uppercase tracking-[0.22em] text-foreground">{defaults.title}</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-foreground/60">{defaults.description}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-center mt-3 pb-8">
        <div className="inline-flex gap-2 px-4 py-2 rounded-full bg-black/10 backdrop-blur-md">
          {SLOTS.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i === activeIndex ? 'bg-foreground' : 'bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
