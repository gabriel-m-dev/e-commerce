'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from '@/components/ui/AppImage'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import type { DbProduct } from '@/lib/queries/products'

type Brand = 'JORDAN' | 'NIKE' | 'ADIDAS'

const BRAND_CONFIG_KEY: Record<Brand, string> = {
  JORDAN: 'jordanMasPedido',
  NIKE: 'nikeMasPedido',
  ADIDAS: 'adidasMasPedido',
}

export default function MasPedidoEditor({
  products,
  currentIds,
}: {
  products: DbProduct[]
  currentIds: Record<Brand, string>
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Brand>('JORDAN')
  const [selectedIds, setSelectedIds] = useState<Record<Brand, string>>(currentIds)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const brandProducts = products.filter((p) => p.brand === activeTab)
  const filtered = brandProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const selectedId = selectedIds[activeTab]
  const selected = products.find((p) => p.id === selectedId)

  function handleSelect(id: string) {
    setSelectedIds((prev) => ({ ...prev, [activeTab]: id }))
  }

  function handleClear() {
    setSelectedIds((prev) => ({ ...prev, [activeTab]: '' }))
  }

  async function handleSave() {
    const id = selectedIds[activeTab]
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: BRAND_CONFIG_KEY[activeTab],
          value: { productId: id },
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Mas Pedido ${activeTab} guardado`)
      router.refresh()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Brand tabs */}
      <div className="flex border-b border-border">
        {(['JORDAN', 'NIKE', 'ADIDAS'] as Brand[]).map((brand) => (
          <button
            key={brand}
            type="button"
            onClick={() => { setActiveTab(brand); setSearch('') }}
            className={`px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors ${
              activeTab === brand
                ? 'border-b-2 border-foreground text-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Selected preview */}
      {selected ? (
        <div className="flex items-center gap-4 border border-gold/40 bg-surface px-4 py-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-background">
            <Image
              src={selected.image}
              alt={selected.name}
              fill
              sizes="64px"
              className="object-cover object-center"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gold">{selected.category}</p>
            <p className="mt-0.5 text-[12px] font-black uppercase tracking-tight text-foreground truncate">{selected.name}</p>
            <p className="text-[11px] text-muted">{formatPrice(selected.price)}</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">Seleccionado</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-[9px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border px-4 py-6 text-center">
          <p className="text-[11px] text-muted uppercase tracking-[0.15em]">
            Sin producto seleccionado — la sección no se mostrará
          </p>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder={`Buscar en ${activeTab}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-border bg-background px-4 py-2.5 text-[11px] text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
      />

      {/* Product list */}
      <div className="flex flex-col gap-1 max-h-[480px] overflow-y-auto">
        {filtered.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => handleSelect(product.id)}
            className={`flex items-center gap-3 border px-3 py-3 text-left transition-colors ${
              selectedId === product.id
                ? 'border-foreground bg-surface'
                : 'border-border hover:border-foreground/40'
            }`}
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-surface">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="48px"
                className="object-cover object-center"
              />
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
          <p className="py-8 text-center text-[11px] text-muted">
            {brandProducts.length === 0
              ? `No hay productos de ${activeTab}`
              : 'Sin resultados'}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {saving ? 'Guardando...' : `Guardar ${activeTab}`}
        </button>
      </div>
    </div>
  )
}
