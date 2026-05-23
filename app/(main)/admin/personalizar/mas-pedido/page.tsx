import Link from 'next/link'
import { getProducts } from '@/lib/queries/products'
import { getSiteConfig } from '@/lib/queries/site-config'
import MasPedidoEditor from '@/components/admin/MasPedidoEditor'

export const dynamic = 'force-dynamic'

export default async function MasPedidoPage() {
  const [products, jordanConfig, nikeConfig, adidasConfig] = await Promise.all([
    getProducts(),
    getSiteConfig('jordanMasPedido'),
    getSiteConfig('nikeMasPedido'),
    getSiteConfig('adidasMasPedido'),
  ])

  const currentIds = {
    JORDAN: jordanConfig?.productId ?? '',
    NIKE: nikeConfig?.productId ?? '',
    ADIDAS: adidasConfig?.productId ?? '',
  }

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
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Mas Pedido</h1>
      </div>
      <p className="text-[11px] text-muted -mt-4 uppercase tracking-[0.12em]">
        Elegí el producto más pedido para cada marca. Aparece como card editorial en la brand page.
      </p>

      <MasPedidoEditor products={products} currentIds={currentIds} />
    </div>
  )
}
