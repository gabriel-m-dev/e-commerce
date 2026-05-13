import Image from 'next/image'
import { getProducts } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const products = await getProducts()
  const RECENT_PRODUCTS = products.slice(0, 5)
  const STATS = [
    { label: 'Total productos', value: products.length.toString() },
    { label: 'Total órdenes', value: '0' },
    { label: 'Revenue total', value: '$0' },
    { label: 'Clientes', value: '0' },
  ]

  return (
    <div className="space-y-8">
      {/* ─── Page title ─── */}
      <div>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em] text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-[11px] text-muted">
          Resumen del estado de la tienda
        </p>
      </div>

      {/* ─── Stats grid ─── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ label, value }) => (
          <div
            key={label}
            className="border border-border bg-background p-6"
          >
            <p className="text-[32px] font-black leading-none text-foreground">
              {value}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ─── Recent products table ─── */}
      <div className="border border-border bg-background">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">
            Últimos productos
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Imagen
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Nombre
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Precio
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {RECENT_PRODUCTS.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border hover:bg-surface"
                >
                  <td className="px-6 py-3">
                    <div className="relative h-8 w-8 overflow-hidden bg-surface">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-3 text-[12px] font-semibold text-foreground">
                    {product.name}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3 text-[11px] text-muted">
                    {product.category}
                  </td>
                  <td className="px-6 py-3 text-[12px] font-semibold text-foreground">
                    {formatPrice(product.price)}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3 text-[11px] text-muted">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
