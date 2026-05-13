'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'
import EditProductForm from './EditProductForm'

interface ProductsTableProps {
  products: DbProduct[]
  categories: { id: string; name: string; slug: string }[]
}

export default function ProductsTable({ products, categories }: ProductsTableProps) {
  const router = useRouter()
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error ?? 'Error al eliminar')
        setConfirmingDeleteId(null)
        return
      }
      setConfirmingDeleteId(null)
      router.refresh()
    } catch {
      setDeleteError('Error de red')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {deleteError && (
        <p className="text-[11px] font-medium text-destructive mb-2">{deleteError}</p>
      )}

      <div className="overflow-x-auto border border-border bg-background">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">Imagen</th>
              <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">Nombre</th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">Categoría</th>
              <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">Precio</th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">Destacado</th>
              <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border hover:bg-surface">
                <td className="px-6 py-4">
                  <div className="relative h-12 w-12 overflow-hidden bg-surface">
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" />
                  </div>
                </td>
                <td className="px-6 py-4 text-[12px] font-semibold text-foreground">{product.name}</td>
                <td className="hidden sm:table-cell px-6 py-4 text-[11px] text-muted">{product.category}</td>
                <td className="px-6 py-4 text-[12px] font-semibold text-foreground">{formatPrice(product.price)}</td>
                <td className="hidden sm:table-cell px-6 py-4 text-[13px]">
                  {product.featured ? <span className="text-gold">✓</span> : <span className="text-muted">—</span>}
                </td>
                <td className="px-6 py-4">
                  {confirmingDeleteId === product.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted">¿Eliminar?</span>
                      <button
                        type="button"
                        disabled={deletingId === product.id}
                        onClick={() => handleDelete(product.id)}
                        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-destructive underline underline-offset-2 transition-opacity hover:opacity-60 disabled:opacity-40"
                      >
                        {deletingId === product.id ? '...' : 'Sí'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(null)}
                        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted underline underline-offset-2 transition-opacity hover:opacity-60"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(product)}
                        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground underline underline-offset-2 transition-opacity hover:opacity-60"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setConfirmingDeleteId(product.id); setDeleteError(null) }}
                        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-destructive underline underline-offset-2 transition-opacity hover:opacity-60"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          categories={categories}
          onSuccess={() => { setEditingProduct(null); router.refresh() }}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </>
  )
}
