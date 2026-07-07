import { getProducts, getCategories } from '@/lib/queries/products'
import { getActiveShippingMethods } from '@/lib/queries/shipping-methods'
import CreateProductForm from '@/components/admin/CreateProductForm'
import ProductsTable from '@/components/admin/ProductsTable'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const [products, categories, shippingMethods] = await Promise.all([
    getProducts({ includeInactive: true }),
    getCategories(),
    getActiveShippingMethods(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[13px] font-black uppercase tracking-[0.22em] text-foreground">
            Productos
          </h1>
          <p className="mt-1 text-[11px] text-muted">
            {products.length} productos en total
          </p>
        </div>
        <CreateProductForm categories={categories} shippingMethods={shippingMethods} />
      </div>

      <ProductsTable products={products} categories={categories} shippingMethods={shippingMethods} />
    </div>
  )
}
