'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type DbProduct } from '@/lib/queries/products'
import { formatPrice } from '@/lib/utils'

interface FeaturedOrderManagerProps {
  products: DbProduct[]
}

function SortableRow({ product }: { product: DbProduct }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 border border-border bg-background px-4 py-3"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex flex-col gap-[3px] cursor-grab active:cursor-grabbing text-muted hover:text-foreground transition-colors shrink-0"
        aria-label="Arrastrar"
      >
        <span className="block w-4 h-px bg-current" />
        <span className="block w-4 h-px bg-current" />
        <span className="block w-4 h-px bg-current" />
      </button>

      {/* Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.image}
        alt=""
        className="h-12 w-12 object-cover border border-border shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden' }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] truncate">{product.name}</p>
        <p className="text-[11px] text-muted">{formatPrice(product.price)}</p>
      </div>
    </div>
  )
}

export default function FeaturedOrderManager({ products }: FeaturedOrderManagerProps) {
  const router = useRouter()
  const isCustomMode = products.some((p) => p.featuredOrder != null)

  const [items, setItems] = useState<DbProduct[]>(products)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === active.id)
        const newIndex = prev.findIndex((p) => p.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
      setIsDirty(true)
      setMessage(null)
    }
  }, [])

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/featured-order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: items.map((p) => p.id) }),
      })
      if (!res.ok) throw new Error()
      setIsDirty(false)
      setMessage({ type: 'ok', text: 'Orden guardado.' })
      router.refresh()
    } catch {
      setMessage({ type: 'error', text: 'Error al guardar. Intentá de nuevo.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setResetting(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/featured-order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      })
      if (!res.ok) throw new Error()
      setMessage({ type: 'ok', text: 'Orden restablecido al predeterminado.' })
      router.refresh()
    } catch {
      setMessage({ type: 'error', text: 'Error al restablecer. Intentá de nuevo.' })
    } finally {
      setResetting(false)
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-[12px] text-muted uppercase tracking-[0.15em]">
        No hay productos destacados. Marcá productos como destacados desde la sección Productos.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={[
            'text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1',
            isCustomMode || isDirty ? 'bg-gold/20 text-gold' : 'bg-border text-muted',
          ].join(' ')}>
            {isCustomMode || isDirty ? 'Orden personalizado' : 'Orden predeterminado'}
          </span>
          {!isCustomMode && !isDirty && (
            <span className="text-[10px] text-muted uppercase tracking-[0.12em]">
              arrastrá para reordenar
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {(isCustomMode && !isDirty) && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors underline underline-offset-2 disabled:opacity-40"
            >
              {resetting ? 'Restableciendo...' : 'Restablecer predeterminado'}
            </button>
          )}
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-foreground px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-background hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {saving ? 'Guardando...' : 'Guardar orden'}
            </button>
          )}
        </div>
      </div>

      {message && (
        <p className={['text-[11px] font-medium', message.type === 'error' ? 'text-destructive' : 'text-foreground'].join(' ')}>
          {message.text}
        </p>
      )}

      {/* List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((product) => (
              <SortableRow key={product.id} product={product} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

    </div>
  )
}
