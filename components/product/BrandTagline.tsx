'use client'

const TAGLINES: Record<'NIKE' | 'JORDAN' | 'ADIDAS', string> = {
  NIKE: 'JUST DO IT',
  JORDAN: 'DREAM IT, DO IT',
  ADIDAS: 'IMPOSSIBLE IS NOTHING',
}

interface BrandTaglineProps {
  brand: 'NIKE' | 'JORDAN' | 'ADIDAS'
}

export default function BrandTagline({ brand }: BrandTaglineProps) {
  const tagline = TAGLINES[brand]

  return (
    <>
      <style>{`
        @keyframes brand-tagline-in {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div className="flex items-center gap-3" style={{ animation: 'brand-tagline-in 0.5s ease-out 0.15s both' }}>
        <span className="w-px h-3 bg-foreground/20" aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/60">
          {tagline}
          <span className="text-gold"> .</span>
        </p>
      </div>
    </>
  )
}
