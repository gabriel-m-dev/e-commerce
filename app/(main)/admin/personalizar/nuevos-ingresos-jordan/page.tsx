import Link from 'next/link'
import { getNewProducts } from '@/lib/queries/products'
import { getSiteConfig } from '@/lib/queries/site-config'
import NewArrivalsOrderEditor from '@/components/admin/NewArrivalsOrderEditor'

export const dynamic = 'force-dynamic'

export default async function NuevosIngresosJordanPage() {
  const [products, config] = await Promise.all([
    getNewProducts(20, 'JORDAN'),
    getSiteConfig('newArrivalsJordan'),
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
        <span className="text-muted">/</span>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Nuevos Ingresos Jordan</h1>
      </div>
      <p className="text-[12px] text-muted -mt-4 uppercase tracking-[0.12em]">
        Arrastrá los productos para definir el orden en que aparecen en la sección de nuevos ingresos de Jordan.
      </p>

      <NewArrivalsOrderEditor
        products={products}
        brand="JORDAN"
        initialIds={config?.productIds ?? []}
      />
    </div>
  )
}
