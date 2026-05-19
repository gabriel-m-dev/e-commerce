import Link from 'next/link'
import { getSiteConfig, DEFAULT_BRAND_CATEGORY_SPLIT } from '@/lib/queries/site-config'
import BrandCategorySplitConfigEditor from '@/components/admin/BrandCategorySplitConfigEditor'

export const dynamic = 'force-dynamic'

const BRANDS = [
  { key: 'JORDAN' as const, configKey: 'jordanCategorySplit' as const, label: 'Jordan' },
  { key: 'NIKE' as const, configKey: 'nikeCategorySplit' as const, label: 'Nike' },
  { key: 'ADIDAS' as const, configKey: 'adidasCategorySplit' as const, label: 'Adidas' },
]

export default async function BrandCategoriasConfigPage() {
  const [jordan, nike, adidas] = await Promise.all(
    BRANDS.map(b => getSiteConfig(b.configKey))
  )
  const configs = [
    jordan ?? DEFAULT_BRAND_CATEGORY_SPLIT,
    nike ?? DEFAULT_BRAND_CATEGORY_SPLIT,
    adidas ?? DEFAULT_BRAND_CATEGORY_SPLIT,
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/personalizar" className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors">
          Personalizar web
        </Link>
        <span className="text-muted/40">/</span>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Hero de Marca</h1>
      </div>
      <p className="text-[11px] text-muted -mt-4">
        Doble panel hero que aparece en las páginas de cada brand. Dos imágenes editoriales side by side. Cuando están vacías, la sección no se muestra.
      </p>

      <div className="flex flex-col gap-10">
        {BRANDS.map((brand, i) => (
          <div key={brand.key} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" aria-hidden />
              <span className="text-[11px] font-black uppercase tracking-[0.22em] shrink-0">{brand.label}</span>
              <div className="h-px flex-1 bg-border" aria-hidden />
            </div>
            <BrandCategorySplitConfigEditor brand={brand.key} initialConfig={configs[i]} />
          </div>
        ))}
      </div>
    </div>
  )
}
