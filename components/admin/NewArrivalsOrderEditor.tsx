'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
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

interface NewArrivalsOrderEditorProps {
  products: DbProduct[]
  brand: 'NIKE' | 'JORDAN' | 'ADIDAS'
  initialIds: string[]
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
      className="flex items-center gap-4 border border-border bg-surface px-4 py-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex flex-col gap-[3px] cursor-grab active:cursor-grabbing text-muted hover:text-foreground transition-colors shrink-0"
        style={{ touchAction: 'none' }}
        aria-label="Arrastrar"
      >
        <span className="block w-4 h-px bg-current" />
        <span className="block w-4 h-px bg-current" />
        <span className="block w-4 h-px bg-current" />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.image}
        alt=""
        className="h-[50px] w-[50px] object-cover border border-border shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden' }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] px-1.5 py-0.5 bg-border text-muted">
            {product.brand}
          </span>
          <span className="text-[11px] text-muted">{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  )
}

export default function NewArrivalsOrderEditor({ products, brand, initialIds }: NewArrivalsOrderEditorProps) {
  const router = useRouter()

  const initialItems = initialIds.length > 0
    ? initialIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as DbProduct[]
    : [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const [items, setItems] = useState<DbProduct[]>(initialItems)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const isCustomMode = initialIds.length > 0

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
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
      const res = await fetch('/api/admin/new-arrivals-order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, ids: items.map((p) => p.id) }),
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
      const res = await fetch('/api/admin/new-arrivals-order', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand }),
      })
      if (!res.ok) throw new Error()
      setMessage({ type: 'ok', text: 'Orden restablecido al automático.' })
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
        No hay nuevos ingresos disponibles para esta marca.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={[
            'text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1',
            isCustomMode || isDirty ? 'bg-gold/20 text-gold' : 'bg-border text-muted',
          ].join(' ')}>
            {isCustomMode || isDirty ? 'Orden personalizado' : 'Orden automático'}
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
              {resetting ? 'Restableciendo...' : 'Restablecer orden automático'}
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
