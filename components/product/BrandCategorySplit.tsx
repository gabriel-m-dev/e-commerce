import Image from 'next/image'
import { type BrandHeroPanel } from '@/lib/data/site-config-defaults'

interface BrandCategorySplitProps {
  ropaPanel: BrandHeroPanel
  zapatillasPanel: BrandHeroPanel
}

function textPositionClasses(position?: string) {
  if (position === 'bottom-center') return 'absolute bottom-0 left-0 right-0 flex justify-center pb-8 lg:pb-12'
  if (position === 'bottom-left')   return 'absolute bottom-0 left-0 pb-8 pl-8 lg:pb-12 lg:pl-12'
  return 'absolute inset-0 flex items-center justify-center'
}

function textBorderClasses(border?: string) {
  if (border === 'full')   return 'border border-white px-10 py-4'
  if (border === 'bottom') return 'border-b border-white pb-2'
  return ''
}

export default function BrandCategorySplit({ ropaPanel, zapatillasPanel }: BrandCategorySplitProps) {
  const panels = [ropaPanel, zapatillasPanel]
  if (panels.every(p => !p.image)) return null

  return (
    <div className="flex flex-col md:flex-row gap-1 mt-8">
      {panels.map((panel, i) => {
        const text = panel.text?.trim()
        return (
          <div key={i} className="relative flex-1 h-[55vw] md:h-[65vh] min-h-[280px] overflow-hidden">
            {panel.image ? (
              <Image
                src={panel.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-foreground/10" />
            )}

            {panel.overlay && (
              <div className="absolute inset-0 bg-black/40" aria-hidden />
            )}

            {text && (
              <div className={textPositionClasses(panel.textPosition)}>
                <span className={`text-[13px] font-black uppercase tracking-[0.32em] text-white ${textBorderClasses(panel.textBorder)}`}>
                  {text}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
