'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CategoryGroup = 'ROPA' | 'ACCESORIOS' | 'NONE'

interface CategoryItem {
  id: string
  name: string
  slug: string
  group: string
}

const GROUP_OPTIONS: { value: CategoryGroup; label: string }[] = [
  { value: 'ROPA',       label: 'Ropa'       },
  { value: 'ACCESORIOS', label: 'Accesorios' },
  { value: 'NONE',       label: 'Sin grupo'  },
]


export default function CategoriesManager({ categories: initial }: { categories: CategoryItem[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryItem[]>(initial)
  const [newName, setNewName]       = useState('')
  const [newGroup, setNewGroup]     = useState<CategoryGroup>('NONE')
  const [creating, setCreating]     = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setCreateError(null)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), group: newGroup }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error ?? 'Error al crear la categoría')
        return
      }
      setCategories((prev) => {
        const exists = prev.find((c) => c.id === data.id)
        if (exists) return prev.map((c) => (c.id === data.id ? data : c))
        return [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
      })
      setNewName('')
      setNewGroup('NONE')
      router.refresh()
    } finally {
      setCreating(false)
    }
  }

  async function handleGroupChange(id: string, group: CategoryGroup) {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, group }),
      })
      const data = await res.json()
      if (res.ok) {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, group: data.group } : c)))
        router.refresh()
      }
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <div className="border border-border bg-background p-6">
        <h2 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-foreground">
          Nueva categoría
        </h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted">Nombre</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: Camperas"
              disabled={creating}
              className="border border-border bg-transparent px-3 py-2 text-[12px] uppercase tracking-[0.12em] text-foreground placeholder:text-muted outline-none focus:border-foreground min-w-[180px] disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted">Grupo nav</label>
            <select
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value as CategoryGroup)}
              disabled={creating}
              className="border border-border bg-transparent px-3 py-2 text-[12px] uppercase tracking-[0.12em] text-foreground outline-none focus:border-foreground cursor-pointer disabled:opacity-50"
            >
              {GROUP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="h-9 px-5 bg-foreground text-[10px] font-semibold uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-80 disabled:opacity-40 cursor-pointer"
          >
            {creating ? 'Creando...' : 'Crear'}
          </button>
        </form>
        {createError && (
          <p className="mt-2 text-[11px] text-destructive">{createError}</p>
        )}
      </div>

      {/* Categories table */}
      <div className="border border-border bg-background">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">
            Categorías ({categories.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">Nombre</th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">Slug</th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">Grupo nav</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-border hover:bg-surface">
                  <td className="px-6 py-3 text-[12px] font-semibold text-foreground">
                    {cat.name}
                  </td>
                  <td className="px-6 py-3 text-[11px] text-muted font-mono">
                    {cat.slug}
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={cat.group}
                      disabled={updatingId === cat.id}
                      onChange={(e) => handleGroupChange(cat.id, e.target.value as CategoryGroup)}
                      className="border border-border bg-transparent px-2 py-1.5 text-[11px] uppercase tracking-[0.12em] text-foreground outline-none focus:border-foreground cursor-pointer disabled:opacity-50"
                    >
                      {GROUP_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {updatingId === cat.id && (
                      <span className="ml-2 text-[10px] text-muted">Guardando...</span>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-[11px] text-muted">
                    No hay categorías todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="border border-border bg-surface p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted mb-2">Cómo funciona el grupo nav</p>
        <ul className="space-y-1">
          <li className="text-[11px] text-foreground">
            <span className="font-semibold">Ropa</span> — aparece bajo el dropdown ROPA en el sub-nav de las brand pages.
          </li>
          <li className="text-[11px] text-foreground">
            <span className="font-semibold">Accesorios</span> — aparece bajo el dropdown ACCESORIOS.
          </li>
          <li className="text-[11px] text-foreground">
            <span className="font-semibold">Sin grupo</span> — aparece como ítem directo en el nav (sin dropdown), como ZAPATILLAS hoy.
          </li>
        </ul>
      </div>
    </div>
  )
}
