'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function TrackingNumberInput({
  orderId,
  current,
}: {
  orderId: string
  current: string | null
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(current ?? '')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function save() {
    const trimmed = value.trim()
    const next = trimmed === '' ? null : trimmed
    setEditing(false)

    if (next === (current ?? null)) return

    setSaving(true)
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNumber: next }),
    })
    setSaving(false)
    router.refresh()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') {
      setValue(current ?? '')
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        placeholder="Ej: OCA123456"
        className="border border-foreground bg-background px-2 py-1 text-[11px] text-foreground focus:outline-none w-32"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      disabled={saving}
      className="text-[11px] text-muted hover:text-foreground transition-colors disabled:opacity-50 text-left"
      title="Click para editar"
    >
      {saving ? '...' : (current ?? '—')}
    </button>
  )
}
