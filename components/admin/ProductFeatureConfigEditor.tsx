'use client'

import { useState } from 'react'
import Image from '@/components/ui/AppImage'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import type { DbProduct } from '@/lib/queries/products'

export default function ProductFeatureConfigEditor({
  products,
  currentProductId,
}: {
  products: DbProduct[]
  currentProductId: string | null
}) {
  const [selectedId, setSelectedId] = useState<string>(currentProductId ?? '')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const selected = products.find((p) => p.id === selectedId)

  async function handleSave() {
    if (!selectedId) {
      toast.error('Seleccioná un producto')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'productFeature', value: { productId: selectedId } }),
      })
      if (!res.ok) throw new Error()
      toast.success('Producto destacado guardado')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Selected preview */}
      {selected && (
        <div className="flex items-center gap-4 border border-gold/40 bg-surface px-4 py-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-background">
            <Image src={selected.image} alt={selected.name} fill sizes="64px" className="object-cover object-center" />
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gold">{selected.category}</p>
            <p className="mt-0.5 text-[12px] font-black uppercase tracking-tight text-foreground">{selected.name}</p>
            <p className="text-[11px] text-muted">{formatPrice(selected.price)}</p>
          </div>
          <div className="ml-auto text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">Seleccionado</div>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar producto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-border bg-background px-4 py-2.5 text-[11px] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
      />

      {/* List */}
      <div className="flex flex-col gap-1 max-h-[480px] overflow-y-auto">
        {filtered.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => setSelectedId(product.id)}
            className={`flex items-center gap-3 border px-3 py-3 text-left transition-colors ${
              selectedId === product.id
                ? 'border-foreground bg-surface'
                : 'border-border hover:border-foreground/40'
            }`}
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-surface">
              <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover object-center" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">{product.category}</p>
              <p className="truncate text-[11px] font-semibold uppercase tracking-tight text-foreground">{product.name}</p>
            </div>
            <p className="shrink-0 text-[11px] text-muted">{formatPrice(product.price)}</p>
            {selectedId === product.id && (
              <div className="shrink-0 h-2 w-2 rounded-full bg-foreground" aria-hidden />
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[11px] text-muted">Sin resultados</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !selectedId}
          className="bg-foreground px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {saving ? 'Guardando...' : 'Guardar producto'}
        </button>
      </div>
    </div>
  )
}
