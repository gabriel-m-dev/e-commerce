'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from '@/components/ui/AppImage'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import type { DbProduct } from '@/lib/queries/products'

interface BrandSneakersConfigEditorProps {
  brand: 'NIKE' | 'JORDAN' | 'ADIDAS'
  configKey: 'brandSneakersNike' | 'brandSneakersJordan' | 'brandSneakersAdidas'
  products: DbProduct[]
  initialProductIds: string[]
}

export default function BrandSneakersConfigEditor({
  brand,
  configKey,
  products,
  initialProductIds,
}: BrandSneakersConfigEditorProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>(initialProductIds)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is DbProduct => p !== undefined)

  const availableProducts = products.filter(
    (p) =>
      !selectedIds.includes(p.id) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  )

  function addProduct(id: string) {
    setSelectedIds((prev) => [...prev, id])
    setSearch('')
  }

  function removeProduct(id: string) {
    setSelectedIds((prev) => prev.filter((sid) => sid !== id))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: configKey, value: { productIds: selectedIds } }),
      })
      if (!res.ok) throw new Error()
      toast.success('Selección guardada')
      router.refresh()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Zapatillas seleccionadas — {brand}
        </p>
        {selectedProducts.length === 0 ? (
          <p className="text-[11px] text-muted border border-dashed border-border px-4 py-6 text-center uppercase tracking-[0.15em]">
            Sin zapatillas seleccionadas
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 border border-gold/40 bg-surface px-3 py-3"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-background">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="48px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                    {product.category}
                  </p>
                  <p className="truncate text-[11px] font-semibold uppercase tracking-tight text-foreground">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-muted">{formatPrice(product.price)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Agregar zapatilla
        </p>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border bg-background px-3 py-2 text-[11px] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
        />
        {(search || availableProducts.length > 0) && (
          <div className="flex max-h-64 flex-col gap-0 overflow-y-auto border border-border bg-background">
            {availableProducts.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-muted">Sin resultados</p>
            ) : (
              availableProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product.id)}
                  className="flex items-center gap-3 border-b border-border px-3 py-2.5 text-left transition-colors hover:bg-surface last:border-b-0 cursor-pointer"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-surface">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="40px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted">
                      {product.category}
                    </p>
                    <p className="truncate text-[11px] font-semibold uppercase tracking-tight text-foreground">
                      {product.name}
                    </p>
                  </div>
                  <p className="shrink-0 text-[11px] text-muted">{formatPrice(product.price)}</p>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {saving ? 'Guardando...' : 'Guardar selección'}
        </button>
      </div>
    </div>
  )
}
