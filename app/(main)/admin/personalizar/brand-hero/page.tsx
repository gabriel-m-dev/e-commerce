import Link from 'next/link'
import { getBrandHeroConfig } from '@/lib/queries/site-config'
import BrandHeroEditor from '@/components/admin/BrandHeroEditor'

export const dynamic = 'force-dynamic'

export default async function BrandHeroPage() {
  const [jordan, nike, adidas] = await Promise.all([
    getBrandHeroConfig('JORDAN'),
    getBrandHeroConfig('NIKE'),
    getBrandHeroConfig('ADIDAS'),
  ])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/personalizar"
          className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors"
        >
          Personalizar web
        </Link>
        <span className="text-muted/40">/</span>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Hero de Brand Pages</h1>
      </div>
      <p className="text-[11px] text-muted -mt-4">
        Slider de imágenes en las brand pages de Jordan, Nike y Adidas. Cada slide tiene una imagen y un texto superpuesto.
      </p>
      <BrandHeroEditor
        initialJordan={jordan}
        initialNike={nike}
        initialAdidas={adidas}
      />
    </div>
  )
}
