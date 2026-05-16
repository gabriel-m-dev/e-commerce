'use client'

import { useState } from 'react'

type BannerCopy = {
  eyebrow: string
  title: string
  image: string
}

const COPY: Record<string, BannerCopy | undefined> = {
  JORDAN: {
    eyebrow: 'HECHO PARA DESTACAR',
    title: 'La cancha es tuya.',
    image: '/jordan_collection_thumb.png',
  },
  // NIKE y ADIDAS pendientes
}

interface BrandCollectionBannerProps {
  brand: string
}

export default function BrandCollectionBanner({ brand }: BrandCollectionBannerProps) {
  const copy = COPY[brand]
  const [imgFailed, setImgFailed] = useState(false)

  if (!copy) return null

  return (
    <div className="mt-4 flex items-center gap-3 bg-[#141414] border border-white/10 rounded-lg p-4">
      {/* Globe icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      </div>

      {/* Centro: eyebrow + título */}
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gold">
          {copy.eyebrow}
        </p>
        <p className="mt-1 text-[13px] font-bold text-white leading-snug">
          {copy.title}
        </p>
      </div>

      {/* Derecha: thumbnail + link */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative w-12 h-12 rounded overflow-hidden bg-white/5">
          {!imgFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={copy.image}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          )}
        </div>
        <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
          Ver colección →
        </span>
      </div>
    </div>
  )
}
