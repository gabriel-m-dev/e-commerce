import Image from 'next/image'
import { getBenefitCardsConfig } from '@/lib/queries/site-config'
import BenefitCardsSlider from './BenefitCardsSlider'

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

function DesktopCard({ slotKey, imageUrl }: { slotKey: SlotKey; imageUrl?: string | null }) {
  const defaults = CARD_DEFAULTS[slotKey]

  if (imageUrl) {
    return (
      <div className="relative overflow-hidden" style={{ minHeight: '260px' }}>
        <Image
          src={imageUrl}
          alt={defaults.title}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover object-center"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 px-10 py-14 pb-20 text-center lg:py-20 lg:pb-28">
      {defaults.icon}
      <div>
        <p className="text-base font-semibold uppercase tracking-[0.22em] text-foreground">{defaults.title}</p>
        <p className="mt-2.5 text-sm leading-relaxed text-foreground/60">{defaults.description}</p>
      </div>
    </div>
  )
}

export default async function BenefitCardsSection() {
  const config = await getBenefitCardsConfig()

  const slots: SlotKey[] = ['payment', 'shipping', 'security']

  return (
    <section className="bg-[#f5f5f7]">
      <div className="mx-auto max-w-screen-xl">
        {/* Mobile slider */}
        <BenefitCardsSlider config={config} />

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:divide-x divide-border">
          {slots.map((slot) => (
            <DesktopCard key={slot} slotKey={slot} imageUrl={config[slot]?.imageUrl} />
          ))}
        </div>
      </div>
    </section>
  )
}
