import Link from 'next/link'
import { getProducts } from '@/lib/queries/products'
import { getSiteConfig } from '@/lib/queries/site-config'
import BrandSneakersConfigEditor from '@/components/admin/BrandSneakersConfigEditor'

export const dynamic = 'force-dynamic'

export default async function ZapatillasJordanPage() {
  const [sneakers, config] = await Promise.all([
    getProducts({ brand: 'JORDAN', categorySlug: 'zapatillas' }),
    getSiteConfig('brandSneakersJordan'),
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
        <span className="text-accent-foreground">/</span>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Zapatillas Jordan</h1>
      </div>
      <p className="text-[12px] text-muted -mt-4 uppercase tracking-[0.12em]">
        Elegí las zapatillas Jordan que aparecen en la sección destacada de la brand page.
      </p>

      <BrandSneakersConfigEditor
        brand="JORDAN"
        configKey="brandSneakersJordan"
        products={sneakers}
        initialProductIds={config?.productIds ?? []}
      />
    </div>
  )
}
