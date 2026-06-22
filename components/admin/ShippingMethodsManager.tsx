'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import type { ShippingMethodRow } from '@/lib/queries/shipping-methods'

const INPUT_CLASS =
  'border border-border bg-transparent px-3 py-2 text-[12px] uppercase tracking-[0.12em] text-foreground placeholder:text-muted outline-none focus:border-foreground disabled:opacity-50'

const LABEL_CLASS =
  'text-[10px] uppercase tracking-[0.15em] text-muted mb-1 block'

type EditState = {
  id: string
  name: string
  price: string
  active: boolean
}

export default function ShippingMethodsManager({
  methods: initial,
}: {
  methods: ShippingMethodRow[]
}) {
  const router = useRouter()
  const [methods, setMethods] = useState<ShippingMethodRow[]>(initial)

  // Create form state
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Edit state
  const [editing, setEditing] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [softDeleteNotice, setSoftDeleteNotice] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return

    const parsedPrice = parseInt(newPrice, 10)
    if (!parsedPrice || parsedPrice <= 0) {
      setCreateError('El precio debe ser un número entero mayor a 0')
      return
    }

    setCreating(true)
    setCreateError(null)

    try {
      const res = await fetch('/api/admin/shipping-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), price: parsedPrice }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error ?? 'Error al crear el método de envío')
        return
      }
      setMethods((prev) => [...prev, data].sort((a, b) => a.price - b.price))
      setNewName('')
      setNewPrice('')
      router.refresh()
    } finally {
      setCreating(false)
    }
  }

  function startEdit(method: ShippingMethodRow) {
    setEditing({
      id: method.id,
      name: method.name,
      price: String(method.price),
      active: method.active,
    })
    setSaveError(null)
    setSoftDeleteNotice(null)
  }

  function cancelEdit() {
    setEditing(null)
    setSaveError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return

    const parsedPrice = parseInt(editing.price, 10)
    if (!parsedPrice || parsedPrice <= 0) {
      setSaveError('El precio debe ser un número entero mayor a 0')
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      const res = await fetch(`/api/admin/shipping-methods/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editing.name.trim(),
          price: parsedPrice,
          active: editing.active,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error ?? 'Error al guardar')
        return
      }
      setMethods((prev) =>
        prev.map((m) => (m.id === editing.id ? data : m)).sort((a, b) => a.price - b.price)
      )
      setEditing(null)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar el método "${name}"?`)) return
    setDeletingId(id)
    setSoftDeleteNotice(null)

    try {
      const res = await fetch(`/api/admin/shipping-methods/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) return

      if ('softDeleted' in data && data.softDeleted) {
        // Soft-deleted: mark inactive in local state, show notice
        setMethods((prev) =>
          prev.map((m) => (m.id === id ? { ...m, active: false } : m))
        )
        setSoftDeleteNotice(
          `El método "${name}" tiene órdenes asociadas y fue desactivado.`
        )
      } else {
        // Hard-deleted: remove from list
        setMethods((prev) => prev.filter((m) => m.id !== id))
      }
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <div className="border border-border bg-background p-6">
        <h2 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-foreground">
          Nuevo método de envío
        </h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col">
            <label className={LABEL_CLASS}>Nombre</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: Correo Argentino"
              disabled={creating}
              className={`${INPUT_CLASS} min-w-[200px]`}
            />
          </div>
          <div className="flex flex-col">
            <label className={LABEL_CLASS}>Precio (ARS)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="16000"
              disabled={creating}
              className={`${INPUT_CLASS} min-w-[140px]`}
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newName.trim() || !newPrice}
            className="h-9 px-5 bg-foreground text-[10px] font-semibold uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-80 disabled:opacity-40 cursor-pointer"
          >
            {creating ? 'Creando...' : 'Crear'}
          </button>
        </form>
        {createError && (
          <p className="mt-2 text-[11px] text-destructive uppercase tracking-[0.1em]">
            {createError}
          </p>
        )}
      </div>

      {/* Soft-delete notice */}
      {softDeleteNotice && (
        <div className="border border-border bg-surface px-5 py-3">
          <p className="text-[11px] text-muted uppercase tracking-[0.12em]">
            {softDeleteNotice}
          </p>
        </div>
      )}

      {/* Methods table */}
      <div className="border border-border bg-background">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">
            Métodos ({methods.length})
          </h2>
        </div>

        {methods.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[11px] text-muted uppercase tracking-[0.15em] mb-4">
              No hay métodos de envío todavía.
            </p>
            <p className="text-[10px] text-muted">
              Creá el primer método usando el formulario de arriba.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-[10px] uppercase tracking-[0.18em] text-muted">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {methods.map((method) =>
                  editing?.id === method.id ? (
                    /* Inline edit row */
                    <tr key={method.id} className="border-b border-border bg-surface/40">
                      <td colSpan={4} className="px-6 py-4">
                        <form onSubmit={handleSave} className="flex flex-wrap gap-3 items-end">
                          <div className="flex flex-col">
                            <label className={LABEL_CLASS}>Nombre</label>
                            <input
                              type="text"
                              value={editing.name}
                              onChange={(e) =>
                                setEditing((prev) =>
                                  prev ? { ...prev, name: e.target.value } : prev
                                )
                              }
                              disabled={saving}
                              className={`${INPUT_CLASS} min-w-[200px]`}
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className={LABEL_CLASS}>Precio (ARS)</label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={editing.price}
                              onChange={(e) =>
                                setEditing((prev) =>
                                  prev ? { ...prev, price: e.target.value } : prev
                                )
                              }
                              disabled={saving}
                              className={`${INPUT_CLASS} min-w-[140px]`}
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className={LABEL_CLASS}>Estado</label>
                            <select
                              value={editing.active ? 'active' : 'inactive'}
                              onChange={(e) =>
                                setEditing((prev) =>
                                  prev
                                    ? { ...prev, active: e.target.value === 'active' }
                                    : prev
                                )
                              }
                              disabled={saving}
                              className={`${INPUT_CLASS} cursor-pointer`}
                            >
                              <option value="active">Activo</option>
                              <option value="inactive">Inactivo</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={saving}
                              className="h-9 px-4 bg-foreground text-[10px] font-semibold uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-80 disabled:opacity-40 cursor-pointer"
                            >
                              {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={saving}
                              className="h-9 px-4 border border-border text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground transition-opacity hover:opacity-60 disabled:opacity-40 cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                          {saveError && (
                            <p className="w-full text-[11px] text-destructive uppercase tracking-[0.1em]">
                              {saveError}
                            </p>
                          )}
                        </form>
                      </td>
                    </tr>
                  ) : (
                    /* Normal display row */
                    <tr
                      key={method.id}
                      className={[
                        'border-b border-border hover:bg-surface transition-colors',
                        !method.active ? 'opacity-50' : '',
                      ].join(' ')}
                    >
                      <td className="px-6 py-3 text-[12px] font-semibold text-foreground uppercase tracking-[0.08em]">
                        {method.name}
                      </td>
                      <td className="px-6 py-3 text-[12px] text-foreground">
                        {formatPrice(method.price)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={[
                            'text-[10px] font-semibold uppercase tracking-[0.15em] px-2 py-1 border',
                            method.active
                              ? 'border-foreground text-foreground'
                              : 'border-muted text-muted',
                          ].join(' ')}
                        >
                          {method.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => startEdit(method)}
                            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold hover:opacity-70 transition-opacity cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(method.id, method.name)}
                            disabled={deletingId === method.id}
                            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-destructive hover:opacity-70 transition-opacity disabled:opacity-40 cursor-pointer"
                          >
                            {deletingId === method.id ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info notice */}
      <div className="border border-border bg-surface p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted mb-2">
          Cómo funciona
        </p>
        <ul className="space-y-1">
          <li className="text-[11px] text-foreground">
            Los métodos <span className="font-semibold">activos</span> aparecen en el checkout para que el cliente elija.
          </li>
          <li className="text-[11px] text-foreground">
            Si un método tiene órdenes asociadas, al eliminarlo se <span className="font-semibold">desactiva</span> en lugar de borrarse.
          </li>
        </ul>
      </div>
    </div>
  )
}
