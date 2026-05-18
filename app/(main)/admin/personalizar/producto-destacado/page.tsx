import Link from 'next/link'
import { getProducts } from '@/lib/queries/products'
import { getSiteConfig } from '@/lib/queries/site-config'
import ProductFeatureConfigEditor from '@/components/admin/ProductFeatureConfigEditor'

export const dynamic = 'force-dynamic'

export default async function ProductoDestacadoPage() {
  const [products, config] = await Promise.all([
    getProducts(),
    getSiteConfig('productFeature'),
  ])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/personalizar" className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors">
          Personalizar web
        </Link>
        <span className="text-muted/40">/</span>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Producto Destacado</h1>
      </div>
      <p className="text-[11px] text-muted -mt-4">
        El producto seleccionado aparece en la sección de producto único de la homepage.
      </p>
      <ProductFeatureConfigEditor
        products={products}
        currentProductId={config?.productId ?? null}
      />
    </div>
  )
}
