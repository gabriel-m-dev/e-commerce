'use client'

const TAGLINES: Record<'NIKE' | 'JORDAN' | 'ADIDAS', string[]> = {
  NIKE:   ['JUST DO IT'],
  JORDAN: ['DREAM IT', 'DO IT'],
  ADIDAS: ['IMPOSSIBLE IS NOTHING'],
}

interface BrandTaglineProps {
  brand: 'NIKE' | 'JORDAN' | 'ADIDAS'
  large?: boolean
}

export default function BrandTagline({ brand, large }: BrandTaglineProps) {
  const lines = TAGLINES[brand]

  return (
    <>
      <style>{`
        @keyframes brand-tagline-in {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .btagline-line { display: block; }
        .btagline-sep  { display: none; }
        @media (min-width: 500px) {
          .btagline-line { display: inline; }
          .btagline-sep  { display: inline; }
        }
      `}</style>
      <div className="flex items-center gap-3" style={{ animation: 'brand-tagline-in 0.5s ease-out 0.15s both' }}>
        {!large && <span className="w-px h-3 bg-foreground/20" aria-hidden />}
        <p className={`font-semibold uppercase leading-tight ${large ? 'text-sm tracking-[0.18em] text-foreground/70' : 'text-[11px] tracking-[0.22em] text-foreground/60'}`}>
          {lines.map((line, i) => (
            <span key={i} className="btagline-line">
              {line}
              {i < lines.length - 1 && <span className="btagline-sep">,</span>}
              {i === lines.length - 1 && <span className="text-gold"> .</span>}
            </span>
          ))}
        </p>
      </div>
    </>
  )
}
