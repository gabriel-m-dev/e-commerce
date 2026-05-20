import { getCategories } from '@/lib/queries/products'
import CategoriesManager from '@/components/admin/CategoriesManager'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em] text-foreground">
          Categorías
        </h1>
        <p className="mt-1 text-[11px] text-muted">
          Administrá las categorías y su grupo en el nav de las brand pages.
        </p>
      </div>

      <CategoriesManager categories={categories} />
    </div>
  )
}
