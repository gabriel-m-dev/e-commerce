'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from '@/components/ui/AppImage'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import type { DbProduct } from '@/lib/queries/products'

const SLOT_LABELS = [
  'Posición 1 — Superior Izquierda',
  'Posición 2 — Superior Derecha',
  'Posición 3 — Inferior Izquierda',
  'Posición 4 — Inferior Derecha',
]

export default function NuestraSeleccionConfigEditor({
  products,
  initialProductIds,
}: {
  products: DbProduct[]
  initialProductIds: string[]
}) {
  const router = useRouter()
  const [slotIds, setSlotIds] = useState<string[]>(
    Array.from({ length: 4 }, (_, i) => initialProductIds[i] ?? '')
  )
  const [searches, setSearches] = useState(['', '', '', ''])
  const [saving, setSaving] = useState(false)

  function updateSearch(idx: number, value: string) {
    setSearches((prev) => prev.map((s, i) => (i === idx ? value : s)))
  }

  function selectProduct(idx: number, productId: string) {
    setSlotIds((prev) => prev.map((id, i) => (i === idx ? productId : id)))
    updateSearch(idx, '')
  }

  function clearSlot(idx: number) {
    setSlotIds((prev) => prev.map((id, i) => (i === idx ? '' : id)))
  }

  function filteredProducts(idx: number) {
    const search = searches[idx].toLowerCase()
    const usedIds = new Set(slotIds.filter((id, i) => id && i !== idx))
    return products.filter(
      (p) =>
        !usedIds.has(p.id) &&
        (p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search))
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'nuestraSeleccion',
          value: { productIds: slotIds.filter(Boolean) },
        }),
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {slotIds.map((slotId, idx) => {
          const selected = products.find((p) => p.id === slotId)
          return (
            <div key={idx} className="flex flex-col gap-3 border border-border p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                {SLOT_LABELS[idx]}
              </p>

              {selected ? (
                <div className="flex items-center gap-3 border border-gold/40 bg-surface px-3 py-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-background">
                    <Image
                      src={selected.image}
                      alt={selected.name}
                      fill
                      sizes="48px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                      {selected.category}
                    </p>
                    <p className="truncate text-[11px] font-semibold uppercase tracking-tight text-foreground">
                      {selected.name}
                    </p>
                    <p className="text-[11px] text-muted">{formatPrice(selected.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => clearSlot(idx)}
                    className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searches[idx]}
                    onChange={(e) => updateSearch(idx, e.target.value)}
                    className="border border-border bg-background px-3 py-2 text-[11px] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
                  />
                  {searches[idx] && (
                    <div className="flex max-h-48 flex-col gap-1 overflow-y-auto border border-border bg-background">
                      {filteredProducts(idx).length === 0 ? (
                        <p className="py-4 text-center text-[11px] text-muted">Sin resultados</p>
                      ) : (
                        filteredProducts(idx).map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => selectProduct(idx, product.id)}
                            className="flex items-center gap-3 border-b border-border px-3 py-2.5 text-left transition-colors hover:bg-surface last:border-b-0"
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
                            <p className="shrink-0 text-[11px] text-muted">
                              {formatPrice(product.price)}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
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
