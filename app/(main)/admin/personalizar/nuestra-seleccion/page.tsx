import Link from 'next/link'
import { getProducts } from '@/lib/queries/products'
import { getSiteConfig } from '@/lib/queries/site-config'
import NuestraSeleccionConfigEditor from '@/components/admin/NuestraSeleccionConfigEditor'

export const dynamic = 'force-dynamic'

export default async function NuestraSeleccionConfigPage() {
  const [products, config] = await Promise.all([
    getProducts(),
    getSiteConfig('nuestraSeleccion'),
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
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Nuestra Selección</h1>
      </div>
      <p className="text-[16px] text-neutral-950 -mt-4">
        Elegí hasta 4 productos para destacar en la sección &quot;Nuestra Selección&quot; de la homepage. Cuando no hay productos seleccionados, la sección no se muestra.
      </p>

      <NuestraSeleccionConfigEditor
        products={products}
        initialProductIds={config?.productIds ?? []}
      />
    </div>
  )
}
