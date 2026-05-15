'use client'

import Image from 'next/image'

const BRAND_IMAGES = {
  NIKE:   '/nike_bg.png',
  JORDAN: '/jordan_bg.png',
  ADIDAS: '/adidas_bg.png',
} as const

interface BrandBgImageProps {
  brand: keyof typeof BRAND_IMAGES
}

export default function BrandBgImage({ brand }: BrandBgImageProps) {
  return (
    <>
      <style>{`
        @keyframes brand-bg-in {
          from { transform: translateX(110%); }
          to   { transform: translateX(0); }
        }
      `}</style>
      <div
        className="pointer-events-none absolute bottom-0 right-0 top-0 w-[120px] md:w-[160px] lg:w-[200px] xl:w-[240px]"
        aria-hidden
        style={{ animation: 'brand-bg-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' }}
      >
        <Image
          src={BRAND_IMAGES[brand]}
          alt=""
          fill
          sizes="(min-width: 1280px) 240px, (min-width: 1024px) 200px, (min-width: 768px) 160px, 120px"
          className="object-contain object-right-top"
          priority
        />
      </div>
    </>
  )
}
